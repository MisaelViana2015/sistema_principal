/**
 * ENGINE DE DETECÇÃO DE FRAUDE
 * 
 * Implementa 10 regras de negócio extraídas do sistema legado.
 * Focado em identificar anomalias financeiras e operacionais.
 */

import { FraudRuleHit, FraudScore, FraudSeverity, ShiftContext } from "./fraud.types.js";

const THRESHOLDS = {
    MIN_REVENUE_PER_KM: 3,
    MAX_REVENUE_PER_KM: 20,
    MIN_REVENUE_PER_HOUR: 20,
    MAX_REVENUE_PER_HOUR: 150,
    MIN_RIDES_PER_HOUR: 0.3,
    MAX_RIDES_PER_HOUR: 8,
    MIN_SHIFT_HOURS: 1 / 6, // ~10 min
    MAX_SHIFT_HOURS: 14,
    MAX_KM_GAP_NORMAL: 250,
    DEVIATION_MULTIPLIER_HIGH: 2.5,
    DEVIATION_MULTIPLIER_CRITICAL: 4,
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

    // 2. Receita/KM Baixa
    if (revPerKm < THRESHOLDS.MIN_REVENUE_PER_KM) {
        hits.push({
            code: "RECEITA_KM_MUITO_BAIXA",
            label: "Receita/km baixa",
            description: `Receita por km muito baixa: R$ ${revPerKm.toFixed(2)}/km.`,
            severity: "high",
            score: THRESHOLDS.SCORE.HIGH,
            data: { revPerKm, minThreshold: THRESHOLDS.MIN_REVENUE_PER_KM },
        });
    }

    // 3. Receita/KM Alta
    if (revPerKm > THRESHOLDS.MAX_REVENUE_PER_KM) {
        hits.push({
            code: "RECEITA_KM_MUITO_ALTA",
            label: "Receita/km alta demais",
            description: `Receita por km muito alta: R$ ${revPerKm.toFixed(2)}/km.`,
            severity: "critical",
            score: THRESHOLDS.SCORE.CRITICAL,
            data: { revPerKm, maxThreshold: THRESHOLDS.MAX_REVENUE_PER_KM },
        });
    }

    // 4. Desvio de Baseline (Receita/KM)
    const base = ctx.baseline;
    if (base && base.avgRevenuePerKm > 0) {
        const diffFactor = revPerKm / base.avgRevenuePerKm;

        if (diffFactor >= THRESHOLDS.DEVIATION_MULTIPLIER_CRITICAL) {
            hits.push({
                code: "RECEITA_KM_DESVIO_CRITICO",
                label: "Receita/km fora da curva",
                description: `Receita/km ${diffFactor.toFixed(1)}x maior que a média do motorista.`,
                severity: "critical",
                score: THRESHOLDS.SCORE.CRITICAL,
                data: { revPerKm, baseline: base.avgRevenuePerKm, multiplier: THRESHOLDS.DEVIATION_MULTIPLIER_CRITICAL, actualMultiplier: diffFactor },
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

    // 5. Receita/Hora Alta
    if (revPerHour > THRESHOLDS.MAX_REVENUE_PER_HOUR) {
        hits.push({
            code: "RECEITA_HORA_MUITO_ALTA",
            label: "Receita/hora alta demais",
            description: `Receita/hora muito alta: R$ ${revPerHour.toFixed(2)}/h.`,
            severity: "critical",
            score: THRESHOLDS.SCORE.CRITICAL,
            data: { revPerHour, maxThreshold: THRESHOLDS.MAX_REVENUE_PER_HOUR },
        });
    }

    // 6. Poucas Corridas/Hora
    if (ridesPerHour < THRESHOLDS.MIN_RIDES_PER_HOUR && ridesCount > 0) {
        hits.push({
            code: "POUCAS_CORRIDAS_HORA",
            label: "Poucas corridas/hora",
            description: `Apenas ${ridesPerHour.toFixed(2)} corridas/hora.`,
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

    // 7. Turno Curto Demais
    if (durationHours < THRESHOLDS.MIN_SHIFT_HOURS && ridesCount > 0) {
        hits.push({
            code: "TURNO_CURTO_DEMAIS",
            label: "Turno curto demais",
            description: `Turno com apenas ${(durationHours * 60).toFixed(0)} min e com corridas.`,
            severity: "medium",
            score: THRESHOLDS.SCORE.MEDIUM,
            data: { durationHours, ridesCount, minThresholdHours: THRESHOLDS.MIN_SHIFT_HOURS },
        });
    }

    // 8. Turno Longo Demais (Opcional, extraído do legado)
    if (durationHours > THRESHOLDS.MAX_SHIFT_HOURS) {
        hits.push({
            code: "TURNO_LONGO_DEMAIS",
            label: "Turno longo demais",
            description: `Turno com ${durationHours.toFixed(1)} horas.`,
            severity: "high",
            score: THRESHOLDS.SCORE.HIGH,
            data: { durationHours, maxThresholdHours: THRESHOLDS.MAX_SHIFT_HOURS },
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
function ruleRepeatedRideValues(
    rideValues: number[]
): FraudRuleHit[] {
    const hits: FraudRuleHit[] = [];
    if (rideValues.length < 3) return hits;

    // Conta ocorrências de cada valor
    const valueCounts: Record<string, number> = {};
    for (const val of rideValues) {
        const key = val.toFixed(2);
        valueCounts[key] = (valueCounts[key] || 0) + 1;
    }

    // Verifica se algum valor aparece 4 ou mais vezes
    for (const [valor, count] of Object.entries(valueCounts)) {
        if (count >= 4) {
            hits.push({
                code: "SEQUENCIA_VALORES_IGUAIS",
                label: "Corridas com valores repetidos",
                description: `${count} corridas com valor de R$ ${valor} no mesmo turno.`,
                severity: "high",
                score: THRESHOLDS.SCORE.HIGH,
                data: { valor, count },
            });
        } else if (count >= 3) {
            hits.push({
                code: "SEQUENCIA_VALORES_SUSPEITA",
                label: "Padrão de valores suspeito",
                description: `${count} corridas com valor de R$ ${valor} no mesmo turno.`,
                severity: "medium",
                score: THRESHOLDS.SCORE.MEDIUM,
                data: { valor, count },
            });
        }
    }

    // Detecta sequência consecutiva (3+ corridas seguidas com mesmo valor)
    let streak = 1;
    let streakValue = rideValues[0];
    for (let i = 1; i < rideValues.length; i++) {
        if (Math.abs(rideValues[i] - streakValue) < 0.01) {
            streak++;
            if (streak >= 3 && !hits.some(h => h.code === "SEQUENCIA_CONSECUTIVA")) {
                hits.push({
                    code: "SEQUENCIA_CONSECUTIVA",
                    label: "Sequência consecutiva de valores",
                    description: `${streak}+ corridas consecutivas de R$ ${streakValue.toFixed(2)}.`,
                    severity: "high",
                    score: THRESHOLDS.SCORE.HIGH,
                    data: { streakValue, streak },
                });
            }
        } else {
            streak = 1;
            streakValue = rideValues[i];
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
        ...ruleKmBetweenShifts(kmStart, ctx.prevShiftKmEnd),
        ...ruleRepeatedRideValues(rideValues) // NEW: Check for repeated values
    );

    return computeScore(ruleHits);
}
