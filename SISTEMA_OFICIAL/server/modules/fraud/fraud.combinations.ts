
import type { FraudRuleHit } from './fraud.types.js';

interface CombinationRule {
    codes: string[];
    bonus: number;
    description: string;
}

const COMBINATIONS: CombinationRule[] = [
    {
        codes: ['LOW_VALUE_STEADY', 'DRIVER_IDLE_FLEET_ACTIVE'],
        bonus: 30,
        description: 'Motorista parado + Só lança valores baixos',
    },
    {
        codes: ['POST_CLOSE_EDIT', 'BATCH_ENTRY'],
        bonus: 40,
        description: 'Edição pós-fechamento + Entrada em lote',
    },
    {
        codes: ['DEVIATION_REVENUE_PER_HOUR', 'EXPENSE_REVENUE_MISMATCH'],
        bonus: 25,
        description: 'Fora do histórico + Despesa/Receita inconsistente',
    },
    {
        codes: ['RIDE_INTERVAL_20_30', 'LOW_VALUE_STEADY'],
        bonus: 35,
        description: 'Padrão de intervalos + Valores baixos constantes',
    },
    {
        codes: ['VALUE_DISTRIBUTION_SPIKE', 'RIDE_INTERVAL_20_30'],
        bonus: 30,
        description: 'Concentração em 1 valor + Intervalos regulares',
    },
];

export function applyRuleCombinations(hits: FraudRuleHit[]): {
    totalScore: number;
    combinationsApplied: string[];
} {
    const activeCodes = new Set(hits.map(h => h.code));
    let bonusScore = 0;
    const applied: string[] = [];

    for (const combo of COMBINATIONS) {
        if (combo.codes.every(code => activeCodes.has(code))) {
            bonusScore += combo.bonus;
            applied.push(combo.description);
        }
    }

    // ADJUSTMENT 4: Score com Cap de 100 na base
    const baseScore = hits.reduce((sum, h) => sum + h.score, 0);
    const cappedBaseScore = Math.min(baseScore, 100);

    // Cap final de 150 incluindo bônus
    const totalScore = Math.min(cappedBaseScore + bonusScore, 150);

    return {
        totalScore,
        combinationsApplied: applied,
    };
}

export function calculateRiskLevel(totalScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (totalScore >= 70) return 'critical';
    if (totalScore >= 35) return 'high';
    if (totalScore >= 20) return 'medium';
    return 'low';
}
