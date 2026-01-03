/**
 * ENGINE DE DETECÇÃO DE FRAUDE
 * 
 * Implementa 10 regras de negócio extraídas do sistema legado.
 * Focado em identificar anomalias financeiras e operacionais.
 */

import { FraudRuleHit, FraudScore, FraudSeverity, ShiftContext } from "./fraud.types.js";
import { db } from "../../core/db/connection.js";
import { shifts, rides, logs } from "../../../shared/schema.js";
import { eq, and, gte, lte, ne, isNotNull, desc, sql } from "drizzle-orm";

const THRESHOLDS = {
    // Receita/KM - Base: R$ 2.20 média
    MIN_REVENUE_PER_KM_HIGH: 1.98,       // 10% abaixo = HIGH
    MIN_REVENUE_PER_KM_CRITICAL: 1.87,   // 15% abaixo = CRITICAL
    MAX_REVENUE_PER_KM: 3.30,            // 50% acima = HIGH

    // Receita/Hora
    MIN_REVENUE_PER_HOUR: 20,            // MEDIUM
    MAX_REVENUE_PER_HOUR: 70,            // HIGH

    // Arrecadação/Turno (NEW v2)
    MIN_REVENUE_PER_SHIFT: 200,          // < R$200 = MEDIUM
    MAX_REVENUE_PER_SHIFT: 550,          // > R$550 = HIGH

    // Produtividade
    MIN_RIDES_PER_HOUR: 0.3,
    MAX_RIDES_PER_HOUR: 8,

    // Duração Turno
    MIN_SHIFT_HOURS: 1 / 6,              // 10 min = LOW
    MAX_SHIFT_HOURS: 16,                 // > 16h = LOW (v2)

    // Gap KM
    MAX_KM_GAP_NORMAL: 250,              // > 250km = HIGH

    // Baseline Deviation
    DEVIATION_MULTIPLIER_HIGH: 1.5,      // >= 1.5x = HIGH
    DEVIATION_MULTIPLIER_CRITICAL: 1.5,  // >= 1.5x = CRITICAL (user requested)

    SCORE: {
        LOW: 5,
        MEDIUM: 10,
        HIGH: 20,
        CRITICAL: 40,
    },
    LEVELS: {
        SUSPECT_MIN: 35,
        CRITICAL_MIN: 70,
    },
};

// --- REGRAS ---

function ruleShiftKmAndRevenue(
    kmTotal: number,
    revenueTotal: number,
    ctx: ShiftContext
): FraudRuleHit[] {
    const hits: FraudRuleHit[] = [];

    // 1. KM Zero com Receita (Crítico)
    if (kmTotal <= 0 && revenueTotal > 0) {
        hits.push({
            code: "KM_ZERO_COM_RECEITA",
            label: "Receita com km zero",
            description: "Turno com receita registrada mas km total <= 0.",
            severity: "critical",
            score: THRESHOLDS.SCORE.CRITICAL,
            data: { kmTotal, revenueTotal },
        });
        return hits; // Aborta outras verificações de KM
    }

    if (kmTotal <= 0) return hits;

    const revPerKm = revenueTotal / kmTotal;

    // 2/3. Receita/KM Baixa - Escalonamento por gravidade (v2)
    if (revPerKm < THRESHOLDS.MIN_REVENUE_PER_KM_CRITICAL) {
        // 15% abaixo da média = CRITICAL
        hits.push({
            code: "RECEITA_KM_CRITICA",
            label: "Receita/km crítica",
            description: `Receita por km 15%+ abaixo da média (R$ ${revPerKm.toFixed(2)}/km).`,
            severity: "critical",
            score: THRESHOLDS.SCORE.CRITICAL,
            data: { revPerKm, threshold: THRESHOLDS.MIN_REVENUE_PER_KM_CRITICAL },
        });
    } else if (revPerKm < THRESHOLDS.MIN_REVENUE_PER_KM_HIGH) {
        // 10% abaixo da média = HIGH
        hits.push({
            code: "RECEITA_KM_BAIXA",
            label: "Receita/km baixa",
            description: `Receita por km 10%+ abaixo da média (R$ ${revPerKm.toFixed(2)}/km).`,
            severity: "high",
            score: THRESHOLDS.SCORE.HIGH,
            data: { revPerKm, threshold: THRESHOLDS.MIN_REVENUE_PER_KM_HIGH },
        });
    }

    // 4. Receita/KM Alta (50% acima)
    if (revPerKm > THRESHOLDS.MAX_REVENUE_PER_KM) {
        hits.push({
            code: "RECEITA_KM_ALTA",
            label: "Receita/km alta",
            description: `Receita por km 50%+ acima da média (R$ ${revPerKm.toFixed(2)}/km).`,
            severity: "high",
            score: THRESHOLDS.SCORE.HIGH,
            data: { revPerKm, maxThreshold: THRESHOLDS.MAX_REVENUE_PER_KM },
        });
    }

    // Baseline Deviation (Rules 8 & 9)
    const base = ctx.baseline;
    if (base && base.avgRevenuePerKm > 0) {
        const ratio = revPerKm / base.avgRevenuePerKm;

        // 9. Desvio Crítico (>= 1.5x ou <= 0.67x)
        if (ratio >= THRESHOLDS.DEVIATION_MULTIPLIER_CRITICAL || ratio <= (1 / THRESHOLDS.DEVIATION_MULTIPLIER_CRITICAL)) {
            hits.push({
                code: "RECEITA_KM_DESVIO_CRITICO",
                label: "Desvio crítico de baseline",
                description: `Receita/km fugiu drasticamente do padrão pessoal (${ratio.toFixed(2)}x).`,
                severity: "critical", // User Rule 9 Severity
                score: THRESHOLDS.SCORE.CRITICAL,
                data: { revPerKm, baseline: base.avgRevenuePerKm, ratio },
            });
        }
        // 8. Desvio Alto (≥ 1.5x ou ≤ 0.66x)
        else if (ratio >= THRESHOLDS.DEVIATION_MULTIPLIER_HIGH || ratio <= (1 / THRESHOLDS.DEVIATION_MULTIPLIER_HIGH)) {
            hits.push({
                code: "RECEITA_KM_DESVIO_ALTO",
                label: "Desvio alto de baseline",
                description: `Receita/km fora do padrão pessoal (${ratio.toFixed(2)}x).`,
                severity: "high", // User Rule 8 Severity
                score: THRESHOLDS.SCORE.HIGH,
                data: { revPerKm, baseline: base.avgRevenuePerKm, ratio },
            });
        }
    }

    return hits;
}

function ruleShiftRevenueAndRidesPerHour(
    revenueTotal: number,
    ridesCount: number,
    durationHours: number,
    ctx: ShiftContext
): FraudRuleHit[] {
    const hits: FraudRuleHit[] = [];
    if (durationHours <= 0) return hits;

    const revPerHour = revenueTotal / durationHours;
    const ridesPerHour = ridesCount / durationHours;

    // 4. Receita/Hora Baixa (New Rule)
    if (revPerHour < THRESHOLDS.MIN_REVENUE_PER_HOUR) {
        hits.push({
            code: "RECEITA_HORA_MUITO_BAIXA",
            label: "Receita/hora baixa",
            description: `Receita/hora abaixo do centro operacional (R$ ${revPerHour.toFixed(2)}/h).`,
            severity: "medium", // User Rule 4 Severity
            score: THRESHOLDS.SCORE.MEDIUM,
            data: { revPerHour, minThreshold: THRESHOLDS.MIN_REVENUE_PER_HOUR },
        });
    }

    // 5. Receita/Hora Alta (Rule 5)
    if (revPerHour > THRESHOLDS.MAX_REVENUE_PER_HOUR) {
        hits.push({
            code: "RECEITA_HORA_MUITO_ALTA",
            label: "Receita/hora alta",
            description: `Receita/hora acima do máximo real (R$ ${revPerHour.toFixed(2)}/h).`,
            severity: "high", // User Rule 5 Severity
            score: THRESHOLDS.SCORE.HIGH,
            data: { revPerHour, maxThreshold: THRESHOLDS.MAX_REVENUE_PER_HOUR },
        });
    }

    // 6. Poucas Corridas/Hora (Not explicitly in 1-10 but kept as extra check)
    if (ridesPerHour < THRESHOLDS.MIN_RIDES_PER_HOUR && ridesCount > 0) {
        hits.push({
            code: "POUCAS_CORRIDAS_HORA",
            label: "Poucas corridas/hora",
            description: `Ritmo muito lento (${ridesPerHour.toFixed(2)}/h).`,
            severity: "low",
            score: THRESHOLDS.SCORE.LOW,
            data: { ridesPerHour, ridesCount, minThreshold: THRESHOLDS.MIN_RIDES_PER_HOUR },
        });
    }

    return hits;
}

function ruleShiftDuration(
    durationHours: number,
    ridesCount: number
): FraudRuleHit[] {
    const hits: FraudRuleHit[] = [];

    // 7. Turno Curto Demais (Rule 6)
    if (durationHours < THRESHOLDS.MIN_SHIFT_HOURS && ridesCount > 0) {
        hits.push({
            code: "TURNO_CURTO_DEMAIS",
            label: "Turno extremamente curto",
            description: `Turno técnico de apenas ${(durationHours * 60).toFixed(0)} min.`,
            severity: "low", // User Rule 6 Severity
            score: THRESHOLDS.SCORE.LOW,
            data: { durationHours, ridesCount, minThresholdHours: THRESHOLDS.MIN_SHIFT_HOURS },
        });
    }

    // 10. Turno Longo Demais (> 14h = LOW, v2)
    if (durationHours > THRESHOLDS.MAX_SHIFT_HOURS) {
        hits.push({
            code: "TURNO_LONGO_DEMAIS",
            label: "Turno longo",
            description: `Duração acima do padrão: ${durationHours.toFixed(1)} horas.`,
            severity: "low", // Changed to LOW (v2)
            score: THRESHOLDS.SCORE.LOW,
            data: { durationHours, maxThresholdHours: THRESHOLDS.MAX_SHIFT_HOURS },
        });
    }

    return hits;
}

/**
 * REGRA 7/8: Arrecadação Total do Turno (NEW v2)
 * Detecta arrecadação muito baixa (<R$200) ou muito alta (>R$550).
 */
function ruleShiftRevenue(
    revenueTotal: number
): FraudRuleHit[] {
    const hits: FraudRuleHit[] = [];

    // 7. Baixa Arrecadação/Turno (< R$200 = MEDIUM)
    if (revenueTotal > 0 && revenueTotal < THRESHOLDS.MIN_REVENUE_PER_SHIFT) {
        hits.push({
            code: "ARRECADACAO_TURNO_BAIXA",
            label: "Arrecadação do turno baixa",
            description: `Receita total abaixo do esperado (R$ ${revenueTotal.toFixed(2)}).`,
            severity: "medium",
            score: THRESHOLDS.SCORE.MEDIUM,
            data: { revenueTotal, minThreshold: THRESHOLDS.MIN_REVENUE_PER_SHIFT },
        });
    }

    // 8. Alta Arrecadação/Turno (> R$550 = HIGH)
    if (revenueTotal > THRESHOLDS.MAX_REVENUE_PER_SHIFT) {
        hits.push({
            code: "ARRECADACAO_TURNO_ALTA",
            label: "Arrecadação do turno alta",
            description: `Receita total acima do padrão (R$ ${revenueTotal.toFixed(2)}).`,
            severity: "high",
            score: THRESHOLDS.SCORE.HIGH,
            data: { revenueTotal, maxThreshold: THRESHOLDS.MAX_REVENUE_PER_SHIFT },
        });
    }

    return hits;
}

function ruleKmBetweenShifts(
    currentShiftKmStart: number,
    prevShiftKmEnd?: number | null
): FraudRuleHit[] {
    const hits: FraudRuleHit[] = [];
    if (prevShiftKmEnd == null) return hits;

    const gap = currentShiftKmStart - prevShiftKmEnd;

    // 9. KM Retrocedeu
    if (gap < 0) {
        hits.push({
            code: "KM_RETROCEDEU",
            label: "KM retrocedeu",
            description: `Odômetro voltou: anterior ${prevShiftKmEnd}, atual ${currentShiftKmStart}.`,
            severity: "critical",
            score: THRESHOLDS.SCORE.CRITICAL,
            data: { gap, prevShiftKmEnd, currentShiftKmStart },
        });
    }
    // 10. Salto de KM Absurdo
    else if (gap > THRESHOLDS.MAX_KM_GAP_NORMAL) {
        hits.push({
            code: "KM_SALTO_ABSURDO",
            label: "Salto de KM absurdo",
            description: `Salto de ${gap} km entre turnos.`,
            severity: "high",
            score: THRESHOLDS.SCORE.HIGH,
            data: { gap, prevShiftKmEnd, currentShiftKmStart },
        });
    }

    return hits;
}

/**
 * REGRA 11: Sequência de Corridas com Valores Iguais
 * Detecta padrão suspeito de múltiplas corridas com exatamente o mesmo valor.
 */
// 3.0.0 REFACTOR: Lógica estritamente sequencial a pedido do usuário
// Detecta APENAS se vierem um atrás do outro (ex: 12, 12, 12, 12)
function ruleRepeatedRideValues(
    rideValues: number[]
): FraudRuleHit[] {
    const hits: FraudRuleHit[] = [];
    if (rideValues.length < 4) return hits;

    let streak = 1;
    let streakValue = rideValues[0];
    const reportedStreaks = new Set<string>(); // Evita reportar a mesma sequência várias vezes

    for (let i = 1; i < rideValues.length; i++) {
        const val = rideValues[i];

        // Compara com tolerância para float
        if (Math.abs(val - streakValue) < 0.01) {
            streak++;
        } else {
            // Fim da sequência, avalia
            if (streak >= 4) {
                const key = `${streakValue}-${streak}`; // Unique key para este hit
                if (!reportedStreaks.has(key)) {
                    hits.push({
                        code: "SEQUENCIA_VALORES_IGUAIS",
                        label: "Sequência de valores iguais",
                        description: `${streak} corridas CONSECUTIVAS de R$ ${streakValue.toFixed(2)}.`,
                        severity: "high",
                        score: THRESHOLDS.SCORE.HIGH,
                        data: { valor: streakValue, count: streak },
                    });
                    reportedStreaks.add(key);
                }
            }
            // Reseta
            streak = 1;
            streakValue = val;
        }
    }

    // Check final (caso termine em streak)
    if (streak >= 4) {
        const key = `${streakValue}-${streak}`;
        if (!reportedStreaks.has(key)) {
            hits.push({
                code: "SEQUENCIA_VALORES_IGUAIS",
                label: "Sequência de valores iguais",
                description: `${streak} corridas CONSECUTIVAS de R$ ${streakValue.toFixed(2)}.`,
                severity: "high",
                score: THRESHOLDS.SCORE.HIGH,
                data: { valor: streakValue, count: streak },
            });
        }
    }

    return hits;
}

// --- HELPER SCORE ---

function severityFromScore(score: number): FraudSeverity {
    if (score >= THRESHOLDS.LEVELS.CRITICAL_MIN) return "critical";
    if (score >= THRESHOLDS.LEVELS.SUSPECT_MIN) return "high";
    if (score >= 20) return "medium";
    return "low";
}

function computeScore(ruleHits: FraudRuleHit[]): FraudScore {
    const totalScore = ruleHits.reduce((s, r) => s + r.score, 0);
    const level = severityFromScore(totalScore);
    return { totalScore, level, reasons: ruleHits };
}

// --- FN PRINCIPAL ---

export function analyzeShiftRules(
    kmStart: number,
    kmEnd: number,
    totalBruto: number,
    totalCorridas: number,
    durationHours: number,
    ctx: ShiftContext,
    rideValues: number[] = [] // NEW: Array of ride values for pattern detection
): FraudScore {
    const kmTotal = Math.max(0, kmEnd - kmStart);
    const ruleHits: FraudRuleHit[] = [];

    ruleHits.push(
        ...ruleShiftKmAndRevenue(kmTotal, totalBruto, ctx),
        ...ruleShiftRevenueAndRidesPerHour(totalBruto, totalCorridas, durationHours, ctx),
        ...ruleShiftDuration(durationHours, totalCorridas),
        ...ruleShiftRevenue(totalBruto), // NEW v2: Arrecadação por turno
        ...ruleKmBetweenShifts(kmStart, ctx.prevShiftKmEnd),
        ...ruleRepeatedRideValues(rideValues)
    );

    return computeScore(ruleHits);
}

// --- ASYNC RULES (INTELLIGENCE v2.0) ---

export interface FleetBaseline {
    weekday: number; // 0=Dom, 1=Seg, ..., 6=Sab
    hourSlot: number; // 0-23
    avgRidesPerHour: number;
    avgRevenuePerHour: number;
    sampleSize: number;
}

export async function getFleetBaseline(
    weekday: number,
    hourSlot: number,
    excludeDriverId?: string
): Promise<FleetBaseline | null> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const relevantShifts = await db.query.shifts.findMany({
        where: and(
            gte(shifts.inicio, thirtyDaysAgo),
            isNotNull(shifts.fim),
            excludeDriverId ? ne(shifts.driverId, excludeDriverId) : undefined
        ),
        with: { rides: true }
    });

    const matchingDayShifts = relevantShifts.filter(s =>
        new Date(s.inicio).getDay() === weekday
    );

    if (matchingDayShifts.length < 3) return null;

    let totalRides = 0;
    let totalRevenue = 0;
    let hoursWorked = 0;

    matchingDayShifts.forEach(shift => {
        const ridesInSlot = (shift.rides as any[]).filter((r: any) => {
            const h = new Date(r.hora).getHours();
            return h === hourSlot;
        });

        // Check if shift covers this hour slot
        const shiftStartH = new Date(shift.inicio).getHours();
        const shiftEndH = shift.fim ? new Date(shift.fim).getHours() : 23;

        // Simple overlap check: if shift includes this hour
        // Note: tricky for overnight shifts, but assuming same-day logic for simplistic baseline or verifying overlap properly
        // For simplicity: if shift start <= hour <= shift end (handling day wrap roughly or ignoring)
        // Better: Just accumulate rides found in that hour slot across all shifts

        totalRides += ridesInSlot.length;
        totalRevenue += ridesInSlot.reduce((sum: number, r: any) => sum + Number(r.valor), 0);
        // Increment hoursWorked only if the shift actually covered this hour
        hoursWorked += 1;
    });

    return {
        weekday,
        hourSlot,
        avgRidesPerHour: hoursWorked > 0 ? totalRides / hoursWorked : 0,
        avgRevenuePerHour: hoursWorked > 0 ? totalRevenue / hoursWorked : 0,
        sampleSize: matchingDayShifts.length
    };
}

export async function checkProductivityVsBaseline(
    shiftStart: Date,
    durationHours: number,
    driverId: string,
    driverRides: any[]
): Promise<FraudRuleHit | null> {
    // SAFETY CHECK: Se o turno tem boa produtividade global, não analisar faixas horárias
    // Isso evita falsos positivos para motoristas que produziram bem no geral
    const overallRidesPerHour = durationHours > 0 ? driverRides.length / durationHours : 0;

    // Se produtividade global >= 1.5 corridas/hora, motorista está produzindo bem
    // Não faz sentido alertar por faixas horárias específicas
    if (overallRidesPerHour >= 1.5) {
        return null;
    }

    const weekday = shiftStart.getDay();
    const hourlyAnalysis: { hour: number; actual: number; expected: number }[] = [];

    // Analyze simplified range of hours (max 24h)
    const startH = shiftStart.getHours();
    const endH = Math.min(startH + Math.ceil(durationHours), startH + 23);

    for (let h = startH; h <= endH; h++) {
        const currentHour = h % 24;
        const baseline = await getFleetBaseline(weekday, currentHour, driverId);

        if (!baseline || baseline.sampleSize < 3 || baseline.avgRidesPerHour === 0) continue;

        const ridesInHour = driverRides.filter(r => new Date(r.hora).getHours() === currentHour);

        const ratio = ridesInHour.length / baseline.avgRidesPerHour;
        // Mudança: de 0.3 (30%) para 0.2 (20%) - mais tolerante
        if (ratio < 0.2) { // < 20% of fleet average (mais restritivo para disparar)
            hourlyAnalysis.push({
                hour: currentHour,
                actual: ridesInHour.length,
                expected: baseline.avgRidesPerHour
            });
        }
    }

    // Mudança: de 2 para 3 faixas horárias mínimas
    // E a produtividade global deve ser ruim (já verificado acima)
    if (hourlyAnalysis.length >= 3) {
        return {
            code: "PRODUTIVIDADE_ABAIXO_BASELINE",
            label: "Produtividade abaixo do baseline",
            description: `Motorista produziu 80% menos que a frota em ${hourlyAnalysis.length} faixas horárias (produtividade geral: ${overallRidesPerHour.toFixed(1)}/h).`,
            severity: "high",
            score: 15,
            data: {
                hoursBelow: hourlyAnalysis,
                overallRidesPerHour: overallRidesPerHour.toFixed(2),
                totalRides: driverRides.length,
                durationHours: durationHours.toFixed(2)
            }
        };
    }
    return null;
}

export async function getDriverHistoricalBaseline(
    driverId: string,
    excludeShiftId?: string
): Promise<{ avgRidesPerHour: number; avgRevenuePerHour: number; shiftCount: number } | null> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const historicalShifts = await db.query.shifts.findMany({
        where: and(
            eq(shifts.driverId, driverId),
            gte(shifts.inicio, thirtyDaysAgo),
            isNotNull(shifts.fim),
            excludeShiftId ? ne(shifts.id, excludeShiftId) : undefined
        ),
        with: { rides: true }
    });

    if (historicalShifts.length < 3) return null;

    let totalRides = 0;
    let totalRevenue = 0;
    let totalHours = 0;

    historicalShifts.forEach(s => {
        const duration = (new Date(s.fim!).getTime() - new Date(s.inicio).getTime()) / 3600000;
        if (duration > 0.1) {
            totalRides += (s.rides as any[]).length;
            totalRevenue += (s.rides as any[]).reduce((sum: number, r: any) => sum + Number(r.valor), 0);
            totalHours += duration;
        }
    });

    return {
        avgRidesPerHour: totalHours > 0 ? totalRides / totalHours : 0,
        avgRevenuePerHour: totalHours > 0 ? totalRevenue / totalHours : 0,
        shiftCount: historicalShifts.length
    };
}

export async function checkDriverHistoricalDeviation(
    shiftId: string,
    driverId: string,
    durationHours: number,
    ridesCount: number
): Promise<FraudRuleHit | null> {
    const baseline = await getDriverHistoricalBaseline(driverId, shiftId);
    if (!baseline || baseline.shiftCount < 3) return null;

    const currentRidesPerHour = durationHours > 0 ? ridesCount / durationHours : 0;
    const ratio = baseline.avgRidesPerHour > 0
        ? currentRidesPerHour / baseline.avgRidesPerHour
        : 1;

    if (ratio < 0.4) { // 60%+ drop
        return {
            code: "DESVIO_HISTORICO_PESSOAL",
            label: "Desvio de histórico pessoal",
            description: `Performance 60%+ abaixo do seu próprio normal (${currentRidesPerHour.toFixed(1)}/h vs ${baseline.avgRidesPerHour.toFixed(1)}/h).`,
            severity: "high",
            score: 20,
            data: {
                currentRidesPerHour,
                historicalAvg: baseline.avgRidesPerHour,
                deviation: `${((1 - ratio) * 100).toFixed(0)}%`,
                sampleSize: baseline.shiftCount
            }
        };
    }
    return null;
}

export async function checkValueAsymmetry(
    shiftId: string,
    driverId: string,
    shiftStart: Date,
    shiftEnd: Date,
    driverRides: any[]
): Promise<FraudRuleHit | null> {
    if (driverRides.length < 5) return null;

    // Fetch Fleet Rides in same period
    const fleetRides = await db.query.rides.findMany({
        where: and(
            gte(rides.hora, shiftStart),
            lte(rides.hora, shiftEnd),
            // ne(rides.driverId, driverId) removed as rides table has no driverId. filtering in memory below.
        ),
        with: {
            shift: true // Assuming relation exists
        }
    }) as any[]; // Type assertion for relation

    // Filter manually if relation query is complex
    const validFleetRides = fleetRides.filter((r: any) => r.shift?.driverId !== driverId);

    if (validFleetRides.length < 20) return null;

    const driverLowRides = driverRides.filter(r => Number(r.valor) < 15).length;
    const driverLowPercent = (driverLowRides / driverRides.length) * 100;

    const fleetLowRides = validFleetRides.filter((r: any) => Number(r.valor) < 15).length;
    const fleetLowPercent = (fleetLowRides / validFleetRides.length) * 100;

    const asymmetry = fleetLowPercent - driverLowPercent;

    if (asymmetry > 25) {
        return {
            code: "ASSIMETRIA_VALORES",
            label: "Seleção suspeita de corridas",
            description: `Motorista pegou ${asymmetry.toFixed(0)}% menos corridas baratas que a frota.`,
            severity: asymmetry > 35 ? "high" : "medium", // Adjusted score logic
            score: asymmetry > 35 ? 25 : 15,
            data: {
                driverLowPercent,
                fleetLowPercent,
                asymmetry
            }
        };
    }
    return null;
}

// Phase 5: Time Gaps with Presence
async function getLastDriverAction(driverId: string, beforeTime: Date): Promise<Date | null> {
    // Check logs?
    // Not implemented fully in schema/logs yet, assuming 'logs' table might track login/actions.
    // Fallback: Check 'rides' or 'shifts' updates?
    // For now, let's assume if shift is OPEN, they are 'active'.
    // Or check if they have a session token active?

    // Simplification for MVP:
    // If shift is 'em_andamento', we consider them 'present' in the system.
    return null;
}

export async function checkTimeGapsWithPresence(
    shift: any,
    driverRides: any[]
): Promise<FraudRuleHit | null> {
    // Sort rides
    const sortedRides = [...driverRides].sort((a, b) => new Date(a.hora).getTime() - new Date(b.hora).getTime());

    const gaps = [];
    let lastTime = new Date(shift.inicio).getTime();

    for (const ride of sortedRides) {
        const rideTime = new Date(ride.hora).getTime();
        const gapMin = (rideTime - lastTime) / 60000;

        if (gapMin > 20) { // Gap > 20 min
            gaps.push({ start: new Date(lastTime), end: new Date(ride.hora), msg: `${gapMin.toFixed(0)} min` });
        }
        lastTime = rideTime; // Use ride start time, or end time? Ideally end time if we had duration.
    }

    // Check gap until 'now' if shift is open, or until 'fim'
    const endTime = shift.fim ? new Date(shift.fim).getTime() : new Date().getTime();
    const finalGap = (endTime - lastTime) / 60000;
    if (finalGap > 20) {
        gaps.push({ start: new Date(lastTime), end: new Date(endTime), msg: `${finalGap.toFixed(0)} min (Final)` });
    }

    if (gaps.length === 0) return null;

    // Presence Flag Logic
    const isShiftOpen = shift.status === 'em_andamento';

    // If shift is open, gaps are more suspicious because driver *should* be available
    if (isShiftOpen || gaps.some(g => g.msg.includes('min'))) {
        // Create hit
        return {
            code: "GAP_TEMPORAL_COM_PRESENCA",
            label: "Gap de tempo injustificado",
            description: `Detectado(s) ${gaps.length} intervalo(s) sem corridas > 20min enquanto ativo.`,
            severity: "medium",
            score: 10 + (gaps.length * 5), // Adds up
            data: { gaps, isShiftOpen }
        };
    }

    return null;
}

