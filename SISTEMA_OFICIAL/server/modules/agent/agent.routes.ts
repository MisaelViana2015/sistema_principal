/**
 * Agent Routes - Endpoints para o Agente IA Local
 * Fornece dados estruturados para análise automatizada
 */
import { Router } from "express";
import { db } from "../../core/db/connection.js";
import { shifts, rides, fraudEvents, drivers, vehicles } from "../../../shared/schema.js";
import { eq, desc, and, gte, isNull, isNotNull, sql } from "drizzle-orm";

const router = Router();

// ========== ENDPOINTS PÚBLICOS (para o agente local) ==========
// Nota: Em produção, adicionar autenticação via token

/**
 * GET /agent/health
 * Verifica se a API está respondendo
 */
router.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/**
 * GET /agent/open-shifts-summary
 * Retorna resumo de turnos abertos para validação de cálculos
 */
router.get("/open-shifts-summary", async (req, res) => {
    try {
        const openShifts = await db.query.shifts.findMany({
            where: (s, { eq }) => eq(s.status, 'em_andamento'),
            with: {
                driver: { columns: { nome: true } },
                vehicle: { columns: { plate: true } }
            },
            orderBy: (s, { asc }) => asc(s.inicio),
            limit: 20
        });

        const summary = openShifts.map(s => ({
            shiftId: s.id.slice(0, 8),
            driver: s.driver?.nome || "Desconhecido",
            vehicle: s.vehicle?.plate || "N/A",
            startedAt: s.inicio,
            hoursOpen: s.inicio ? Math.round((Date.now() - new Date(s.inicio).getTime()) / 3600000) : 0,
            kmInicial: Number(s.kmInicial || 0),
            totalBruto: Number(s.totalBruto || 0),
            totalCorridas: Number(s.totalCorridas || 0)
        }));

        res.json({
            count: summary.length,
            shifts: summary,
            generatedAt: new Date().toISOString()
        });
    } catch (error: any) {
        console.error("[AGENT] Error in open-shifts-summary:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /agent/fraud-events?window=60
 * Retorna eventos de fraude recentes (últimas N horas)
 */
router.get("/fraud-events", async (req, res) => {
    try {
        const windowHours = parseInt(req.query.window as string) || 60;
        const cutoffDate = new Date(Date.now() - windowHours * 60 * 60 * 1000);

        const events = await db.query.fraudEvents.findMany({
            where: (e, { and, gte, eq }) => and(
                gte(e.detectedAt, cutoffDate),
                eq(e.status, 'pendente')
            ),
            orderBy: (e, { desc }) => desc(e.riskScore),
            limit: 10
        });

        // Enriquecer com dados do motorista
        const enrichedEvents = await Promise.all(events.map(async (event) => {
            const driver = event.driverId ? await db.query.drivers.findFirst({
                where: (d, { eq }) => eq(d.id, event.driverId as string),
                columns: { nome: true }
            }) : null;

            return {
                eventId: event.id.slice(0, 8),
                driverName: driver?.nome || "Desconhecido",
                riskScore: event.riskScore,
                riskLevel: event.riskLevel,
                status: event.status,
                detectedAt: event.detectedAt,
                rulesTriggered: (event.rules as any[])?.map(r => r.label || r.ruleId).join(", ") || "N/A"
            };
        }));

        res.json({
            windowHours,
            count: enrichedEvents.length,
            events: enrichedEvents,
            generatedAt: new Date().toISOString()
        });
    } catch (error: any) {
        console.error("[AGENT] Error in fraud-events:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /agent/daily-summary
 * Resumo diário para análise geral
 */
router.get("/daily-summary", async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Contagens básicas
        const [shiftsToday, ridesCount, fraudCount] = await Promise.all([
            db.select({ count: sql<number>`count(*)` })
                .from(shifts)
                .where(gte(shifts.inicio, today)),
            db.select({ count: sql<number>`count(*)` })
                .from(rides)
                .where(gte(rides.hora, today)),
            db.select({ count: sql<number>`count(*)` })
                .from(fraudEvents)
                .where(and(
                    gte(fraudEvents.detectedAt, today),
                    eq(fraudEvents.status, 'pendente')
                ))
        ]);

        res.json({
            date: today.toISOString().split('T')[0],
            shiftsStartedToday: Number(shiftsToday[0]?.count || 0),
            ridesToday: Number(ridesCount[0]?.count || 0),
            pendingFraudAlerts: Number(fraudCount[0]?.count || 0),
            generatedAt: new Date().toISOString()
        });
    } catch (error: any) {
        console.error("[AGENT] Error in daily-summary:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /agent/shift/:id
 * Retorna turno com todas as corridas para análise de fraude
 */
router.get("/shift/:id", async (req, res) => {
    try {
        const shiftId = req.params.id;

        const shift = await db.query.shifts.findFirst({
            where: (s, { eq }) => eq(s.id, shiftId),
            with: {
                driver: { columns: { nome: true } },
                vehicle: { columns: { plate: true, modelo: true } },
                rides: true
            }
        });

        if (!shift) {
            return res.status(404).json({ error: "Turno não encontrado" });
        }

        // Formatar corridas
        const corridasFormatadas = (shift.rides as any[]).map(r => ({
            hora: r.hora,
            valor: Number(r.valor),
            tipo: r.tipo || "App",
            origem: r.origem,
            destino: r.destino
        }));

        res.json({
            shiftId: shift.id,
            motorista: shift.driver?.nome || "Desconhecido",
            veiculo: `${shift.vehicle?.modelo || ""} - ${shift.vehicle?.plate || "N/A"}`,
            inicio: shift.inicio,
            fim: shift.fim,
            kmInicial: Number(shift.kmInicial || 0),
            kmFinal: Number(shift.kmFinal || 0),
            kmTotal: Number(shift.kmFinal || 0) - Number(shift.kmInicial || 0),
            totalBruto: Number(shift.totalBruto || 0),
            totalCustos: Number(shift.totalCustos || 0),
            totalCorridas: corridasFormatadas.length,
            corridas: corridasFormatadas,
            generatedAt: new Date().toISOString()
        });
    } catch (error: any) {
        console.error("[AGENT] Error in shift/:id:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /agent/pending-fraud
 * Retorna lista de turnos pendentes de análise de fraude
 */
router.get("/pending-fraud", async (req, res) => {
    try {
        const events = await db.query.fraudEvents.findMany({
            where: (e, { eq }) => eq(e.status, 'pendente'),
            orderBy: (e, { desc }) => desc(e.riskScore),
            limit: 20
        });

        const results = await Promise.all(events.map(async (event) => {
            const driver = event.driverId ? await db.query.drivers.findFirst({
                where: (d, { eq }) => eq(d.id, event.driverId as string),
                columns: { nome: true }
            }) : null;

            return {
                eventId: event.id,
                shiftId: event.shiftId,
                motorista: driver?.nome || "Desconhecido",
                riskScore: event.riskScore,
                riskLevel: event.riskLevel,
                detectedAt: event.detectedAt,
                rules: event.rules
            };
        }));

        res.json({
            count: results.length,
            events: results,
            generatedAt: new Date().toISOString()
        });
    } catch (error: any) {
        console.error("[AGENT] Error in pending-fraud:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
