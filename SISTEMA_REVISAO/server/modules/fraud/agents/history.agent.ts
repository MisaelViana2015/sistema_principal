
import type { FraudAgent, AgentContext } from './index.js';
import type { FraudRuleHit } from '../fraud.types.js';

export const HistoryAgent: FraudAgent = {
    name: 'HistoryAgent',
    description: 'Compara motorista com seu próprio histórico (6 meses)',
    runOn: 'both',
    priority: 2,

    async analyze(ctx: AgentContext): Promise<FraudRuleHit[]> {
        const hits: FraudRuleHit[] = [];

        if (!ctx.baseline) {
            return hits; // Sem baseline, não há comparação
        }

        const b = ctx.baseline;
        const now = ctx.shiftEnd || new Date();
        const durationHours = Math.max(0.5, (now.getTime() - ctx.shiftStart.getTime()) / 3600000);

        const currentRidesPerHour = ctx.rides.length / durationHours;
        const currentRevenuePerHour = ctx.rides.reduce((s, r) => s + r.valor, 0) / durationHours;
        const currentTicketMedio = ctx.rides.length > 0
            ? ctx.rides.reduce((s, r) => s + r.valor, 0) / ctx.rides.length
            : 0;

        // REGRA 1: DEVIATION_RIDES_PER_HOUR
        if (b.medianRidesPerHour > 0 && currentRidesPerHour < b.medianRidesPerHour * 0.55) {
            hits.push({
                code: 'DEVIATION_RIDES_PER_HOUR',
                label: 'Corridas/hora muito abaixo do histórico',
                description: `Atual: ${currentRidesPerHour.toFixed(1)} vs Histórico: ${b.medianRidesPerHour.toFixed(1)} corridas/h`,
                severity: 'medium',
                score: 15,
                confidence: 0.7,
                data: {
                    current: currentRidesPerHour,
                    baseline: b.medianRidesPerHour,
                    ratio: currentRidesPerHour / b.medianRidesPerHour,
                },
            });
        }

        // REGRA 2: DEVIATION_REVENUE_PER_HOUR
        if (b.medianRevenuePerHour > 0 && currentRevenuePerHour < b.medianRevenuePerHour * 0.55) {
            hits.push({
                code: 'DEVIATION_REVENUE_PER_HOUR',
                label: 'Receita/hora muito abaixo do histórico',
                description: `Atual: R$${currentRevenuePerHour.toFixed(0)}/h vs Histórico: R$${b.medianRevenuePerHour.toFixed(0)}/h`,
                severity: 'medium',
                score: 15,
                confidence: 0.7,
                data: {
                    current: currentRevenuePerHour,
                    baseline: b.medianRevenuePerHour,
                    ratio: currentRevenuePerHour / b.medianRevenuePerHour,
                },
            });
        }

        // REGRA 3: DEVIATION_TICKET_MEDIO
        if (b.medianTicket > 0 && currentTicketMedio < b.medianTicket * 0.65) {
            hits.push({
                code: 'DEVIATION_TICKET_MEDIO',
                label: 'Ticket médio muito abaixo do histórico',
                description: `Atual: R$${currentTicketMedio.toFixed(2)} vs Histórico: R$${b.medianTicket.toFixed(2)}`,
                severity: 'medium',
                score: 10,
                confidence: 0.65,
                data: {
                    current: currentTicketMedio,
                    baseline: b.medianTicket,
                    ratio: currentTicketMedio / b.medianTicket,
                },
            });
        }

        // REGRA 4: UNUSUAL_HOUR (horário atípico para o motorista)
        const shiftHour = ctx.shiftStart.getHours();
        if (b.typicalHours && Array.isArray(b.typicalHours) && !b.typicalHours.includes(shiftHour)) {
            hits.push({
                code: 'UNUSUAL_HOUR',
                label: 'Horário atípico para este motorista',
                description: `Turno às ${shiftHour}h, mas histórico mostra atividade em: ${b.typicalHours.join('h, ')}h`,
                severity: 'low',
                score: 5,
                confidence: 0.6,
                data: {
                    currentHour: shiftHour,
                    typicalHours: b.typicalHours,
                },
            });
        }

        return hits;
    },
};
