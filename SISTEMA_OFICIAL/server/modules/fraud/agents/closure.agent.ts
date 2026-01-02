
import type { FraudAgent, AgentContext } from './index.js';
import type { FraudRuleHit } from '../fraud.types.js';

export const ClosureAgent: FraudAgent = {
    name: 'ClosureAgent',
    description: 'Analisa KM e métricas no fechamento do turno',
    runOn: 'closed_shift',
    priority: 1,

    async analyze(ctx: AgentContext): Promise<FraudRuleHit[]> {
        const hits: FraudRuleHit[] = [];

        // Este agente foca em validações que só podem ocorrer quando kmFinal é conhecido
        // As regras de KM já existem parcialmente no fraud.engine.ts mas podem ser migradas para cá

        // Exemplo de regra futura: KM_REVENUE_MISMATCH
        // Implementação pendente da migração das regras antigas

        return hits;
    },
};
