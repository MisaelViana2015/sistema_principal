
import type { FraudAgent, AgentContext } from './index.js';
import type { FraudRuleHit } from '../fraud.types.js';

export const FinancialAgent: FraudAgent = {
    name: 'FinancialAgent',
    description: 'Analisa correlação entre despesas e receitas',
    runOn: 'closed_shift',
    priority: 2,

    async analyze(ctx: AgentContext): Promise<FraudRuleHit[]> {
        const hits: FraudRuleHit[] = [];

        if (ctx.expenses.length === 0) {
            return hits;
        }

        const totalRevenue = ctx.rides.reduce((s, r) => s + r.valor, 0);
        // ADJUSTMENT 3: Use .value standard from context, not .valor
        const totalExpenses = ctx.expenses.reduce((s, e) => s + (e.valor || 0), 0);

        // REGRA 1: EXPENSE_REVENUE_MISMATCH (gasto alto, receita baixa)
        if (totalExpenses > 50 && totalRevenue < totalExpenses * 3) {
            hits.push({
                code: 'EXPENSE_REVENUE_MISMATCH',
                label: 'Despesa alta para receita baixa',
                description: `Gastos: R$${totalExpenses.toFixed(2)} | Receita: R$${totalRevenue.toFixed(2)} (razão: ${(totalRevenue / totalExpenses).toFixed(1)}x)`,
                severity: 'medium',
                score: 15,
                confidence: 0.8,
                data: {
                    totalExpenses,
                    totalRevenue,
                    ratio: totalRevenue / totalExpenses,
                },
            });
        }

        // REGRA 2: HIGH_FUEL_LOW_REVENUE (específico para combustível)
        // Nota: Precisaria do costTypeId de combustível - simplificando aqui
        const fuelExpenses = ctx.expenses.filter(e =>
            e.costTypeId && (
                e.costTypeId.toLowerCase().includes('fuel') ||
                e.costTypeId.toLowerCase().includes('combustivel')
            )
        );

        // ADJUSTMENT 3: Use .value here too
        const fuelTotal = fuelExpenses.reduce((s, e) => s + (e.valor || 0), 0);

        if (fuelTotal > 30 && totalRevenue < fuelTotal * 4) {
            hits.push({
                code: 'HIGH_FUEL_LOW_REVENUE',
                label: 'Alto gasto com combustível para pouca receita',
                description: `Combustível: R$${fuelTotal.toFixed(2)} | Receita: R$${totalRevenue.toFixed(2)}`,
                severity: 'medium',
                score: 10,
                confidence: 0.8,
                data: {
                    fuelTotal,
                    totalRevenue,
                    ratio: totalRevenue / fuelTotal,
                },
            });
        }

        return hits;
    },
};
