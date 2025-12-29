/**
 * ENGINE DE DETECÇÃO DE FRAUDE
 * 
 * Implementa 10 regras de negócio extraídas do sistema legado.
 * Focado em identificar anomalias financeiras e operacionais.
 */

import { FraudRuleHit, FraudScore, FraudSeverity, ShiftContext } from "./fraud.types.js";

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
