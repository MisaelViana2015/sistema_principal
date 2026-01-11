
import type { FraudAgent, AgentContext } from './index.js';
import type { FraudRuleHit } from '../fraud.types.js';

const THRESHOLDS = {
    LOW_VALUE: 12,
    MIN_RIDES_FOR_PATTERN: 4,
    INTERVAL_MIN: 20,
    INTERVAL_MAX: 35,
    LOW_VALUE_PCT: 0.6,
};

export const RealTimeAgent: FraudAgent = {
    name: 'RealTimeAgent',
    description: 'Analisa padrões de corridas em tempo real durante turno aberto',
    runOn: 'both', // CHANGED: Now also runs on closed shifts to detect patterns retrospectively
    priority: 1,

    async analyze(ctx: AgentContext): Promise<FraudRuleHit[]> {
        const hits: FraudRuleHit[] = [];

        // ADJUSTMENT 6: Ignorar janela inicial (dados insuficientes)
        const shiftDurationMs = Date.now() - ctx.shiftStart.getTime();
        const MIN_ANALYSIS_WINDOW = 30 * 60 * 1000; // 30 minutos

        if (shiftDurationMs < MIN_ANALYSIS_WINDOW) {
            return hits; // Muito cedo para análise confiável
        }

        if (ctx.rides.length < THRESHOLDS.MIN_RIDES_FOR_PATTERN) {
            return hits;
        }

        // REGRA 1: LOW_VALUE_STEADY (60%+ das corridas <= R$12)
        const lowValueRides = ctx.rides.filter(r => r.valor <= THRESHOLDS.LOW_VALUE);
        const lowValuePct = lowValueRides.length / ctx.rides.length;

        if (lowValuePct >= THRESHOLDS.LOW_VALUE_PCT) {
            hits.push({
                code: 'LOW_VALUE_STEADY',
                label: 'Padrão de valores baixos constante',
                description: `${Math.round(lowValuePct * 100)}% das corridas são ≤ R$${THRESHOLDS.LOW_VALUE}`,
                severity: 'high',
                score: 25,
                confidence: 0.8,
                data: {
                    totalRides: ctx.rides.length,
                    lowValueCount: lowValueRides.length,
                    percentage: lowValuePct,
                    avgLowValue: lowValueRides.reduce((s, r) => s + r.valor, 0) / lowValueRides.length,
                },
            });
        }

        // REGRA 2: RIDE_INTERVAL_20_30 (intervalo suspeitamente regular)
        if (ctx.rides.length >= 3) {
            const sortedRides = [...ctx.rides].sort((a, b) => a.hora.getTime() - b.hora.getTime());
            const intervals: number[] = [];

            for (let i = 1; i < sortedRides.length; i++) {
                const gap = (sortedRides[i].hora.getTime() - sortedRides[i - 1].hora.getTime()) / 60000;
                intervals.push(gap);
            }

            const suspiciousIntervals = intervals.filter(
                i => i >= THRESHOLDS.INTERVAL_MIN && i <= THRESHOLDS.INTERVAL_MAX
            );

            if (suspiciousIntervals.length >= intervals.length * 0.6) {
                const avgInterval = suspiciousIntervals.reduce((s, i) => s + i, 0) / suspiciousIntervals.length;
                hits.push({
                    code: 'RIDE_INTERVAL_20_30',
                    label: 'Intervalo suspeitamente regular',
                    description: `${suspiciousIntervals.length} de ${intervals.length} intervalos entre 20-35 min (média: ${avgInterval.toFixed(0)} min)`,
                    severity: 'high',
                    score: 30,
                    confidence: 0.85,
                    data: {
                        intervals,
                        suspiciousCount: suspiciousIntervals.length,
                        avgInterval,
                    },
                });
            }
        }

        // REGRA 3: VALUE_DISTRIBUTION_SPIKE (concentração em 1-2 valores)
        const valueCounts = new Map<number, number>();
        ctx.rides.forEach(r => {
            const rounded = Math.round(r.valor);
            valueCounts.set(rounded, (valueCounts.get(rounded) || 0) + 1);
        });

        const topValue = [...valueCounts.entries()].sort((a, b) => b[1] - a[1])[0];
        if (topValue && topValue[1] / ctx.rides.length > 0.5) {
            hits.push({
                code: 'VALUE_DISTRIBUTION_SPIKE',
                label: 'Concentração anormal em um valor',
                description: `${topValue[1]} de ${ctx.rides.length} corridas com valor R$${topValue[0]}`,
                severity: 'medium',
                score: 15,
                confidence: 0.7,
                data: {
                    topValue: topValue[0],
                    topCount: topValue[1],
                    percentage: topValue[1] / ctx.rides.length,
                },
            });
        }

        return hits;
    },
};
