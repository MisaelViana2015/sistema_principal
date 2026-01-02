
import { db } from '../../core/db/connection.js';
import { shifts, rides, expenses } from '../../../shared/schema.js';
import { eq, gte, and, desc, sql } from 'drizzle-orm';
import { buildDriverBaseline } from './fraud.baseline.js';
import { applyRuleCombinations, calculateRiskLevel } from './fraud.combinations.js';
import type { AgentContext, FleetStats, FraudAgent } from './agents/index.js';
import type { FraudRuleHit, FraudShiftAnalysis } from './fraud.types.js';

// Import all agents
import { RealTimeAgent } from './agents/realtime.agent.js';
import { CohortAgent } from './agents/cohort.agent.js';
import { AuditAgent } from './agents/audit.agent.js';
import { HistoryAgent } from './agents/history.agent.js';
import { FinancialAgent } from './agents/financial.agent.js';
import { ClosureAgent } from './agents/closure.agent.js';
import { TelemetryAgent } from './agents/telemetry.agent.js';

const FRAUD_AGENTS: FraudAgent[] = [
    RealTimeAgent,
    CohortAgent,
    AuditAgent,
    HistoryAgent,
    FinancialAgent,
    ClosureAgent,
    TelemetryAgent
];

/**
 * Calcula estatísticas da frota em tempo real
 * ADJUSTMENT 2: Exported for use in diagnostics endpoints
 */
export async function calculateFleetStats(): Promise<FleetStats> {
    const now = new Date();
    const last15m = new Date(now.getTime() - 15 * 60 * 1000);
    const last60m = new Date(now.getTime() - 60 * 60 * 1000);

    // Turnos abertos
    const openShifts = await db
        .select({ count: sql<number>`count(*)` })
        .from(shifts)
        .where(eq(shifts.status, 'em_andamento'));

    const openDrivers = Number(openShifts[0]?.count || 0);

    // Corridas nos últimos 15 minutos (todos os turnos abertos)
    const ridesLast15mData = await db.execute(sql`
    SELECT COUNT(*) as cnt, PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY r.valor::numeric) as median_value
    FROM rides r
    JOIN shifts s ON s.id = r.shift_id
    WHERE s.status = 'em_andamento'
      AND r.hora >= ${last15m}
  `);

    const ridesLast15m = Number(ridesLast15mData.rows[0]?.cnt || 0);
    const medianRideValue15m = Number(ridesLast15mData.rows[0]?.median_value || 0);

    // Corridas nos últimos 60 minutos
    const ridesLast60mData = await db.execute(sql`
    SELECT COUNT(*) as cnt
    FROM rides r
    JOIN shifts s ON s.id = r.shift_id
    WHERE s.status = 'em_andamento'
      AND r.hora >= ${last60m}
  `);

    const ridesLast60m = Number(ridesLast60mData.rows[0]?.cnt || 0);

    const ridesPerDriver15m = openDrivers > 0 ? ridesLast15m / openDrivers : 0;
    const ridesPerDriver60m = openDrivers > 0 ? ridesLast60m / openDrivers : 0;
    const demandHigh = ridesPerDriver15m >= 1 && medianRideValue15m >= 15;

    return {
        openDrivers,
        ridesLast15m,
        ridesPerDriver15m,
        medianRideValue15m,
        ridesLast60m,
        ridesPerDriver60m,
        demandHigh,
    };
}

/**
 * Constrói o contexto completo para os agentes
 */
async function buildAgentContext(shiftId: string, fleetStats: FleetStats): Promise<AgentContext> {
    const shift = await db.query.shifts.findFirst({
        where: eq(shifts.id, shiftId),
    });

    if (!shift) {
        throw new Error(`Shift ${shiftId} not found`);
    }

    const shiftRides = await db
        .select()
        .from(rides)
        .where(eq(rides.shiftId, shiftId))
        .orderBy(rides.hora);

    const shiftExpenses = await db
        .select()
        .from(expenses)
        .where(eq(expenses.shiftId, shiftId));

    const baseline = await buildDriverBaseline(shift.driverId, shift.inicio.toISOString());

    return {
        shiftId,
        driverId: shift.driverId,
        vehicleId: shift.vehicleId,
        shiftStart: shift.inicio,
        shiftEnd: shift.fim,
        isOpen: shift.status === 'em_andamento',
        rides: shiftRides.map(r => ({
            id: r.id,
            valor: Number(r.valor),
            hora: new Date(r.hora),
            tipo: r.tipo,
        })),
        // ADJUSTMENT 3: Standardize expenses.value
        expenses: shiftExpenses.map(e => ({
            id: e.id,
            valor: Number(e.value), // Mapped to 'valor' in interface but sourced from 'value'
            value: Number(e.value), // Keeping 'value' for clarity if needed internal agents
            costTypeId: e.costTypeId,
        })),
        baseline,
        fleetStats,
    };
}

/**
 * Executa todos os agentes e retorna análise consolidada
 */
export async function runFraudOrchestrator(shiftId: string): Promise<FraudShiftAnalysis> {
    console.log(`[FRAUD_ORCHESTRATOR] Analisando turno ${shiftId}`);

    const fleetStats = await calculateFleetStats();
    const ctx = await buildAgentContext(shiftId, fleetStats);

    const allHits: FraudRuleHit[] = [];
    const agentsRun: string[] = [];

    for (const agent of FRAUD_AGENTS) {
        // Filtrar por tipo de turno
        if (ctx.isOpen && agent.runOn === 'closed_shift') continue;
        if (!ctx.isOpen && agent.runOn === 'open_shift') continue;

        try {
            const hits = await agent.analyze(ctx);
            allHits.push(...hits);
            agentsRun.push(agent.name);

            if (hits.length > 0) {
                console.log(`[${agent.name}] ${hits.length} hit(s) encontrado(s)`);
            }
        } catch (err) {
            console.error(`[${agent.name}] Erro:`, err);
        }
    }

    // Aplicar combinações
    const { totalScore, combinationsApplied } = applyRuleCombinations(allHits);
    const riskLevel = calculateRiskLevel(totalScore);

    const analysis: FraudShiftAnalysis = {
        shiftId: ctx.shiftId,
        driverId: ctx.driverId,
        vehicleId: ctx.vehicleId,
        date: ctx.shiftStart.toISOString().split('T')[0],
        shiftInicio: ctx.shiftStart,
        kmTotal: 0, // Será preenchido no fechamento se disponível
        revenueTotal: ctx.rides.reduce((s, r) => s + r.valor, 0),
        revenuePerKm: 0,
        revenuePerHour: 0,
        ridesPerHour: 0,
        score: {
            reasons: allHits,
            totalScore,
            level: riskLevel,
        },
        baseline: ctx.baseline,
        isPartialAnalysis: ctx.isOpen,
        metadata: {
            agentsRun,
            combinationsApplied,
            fleetStats,
            analyzedAt: new Date().toISOString(),
        },
    };

    return analysis;
}
