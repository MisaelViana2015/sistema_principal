
import type { FraudAgent, AgentContext } from './index.js';
import type { FraudRuleHit } from '../fraud.types.js';

export const TelemetryAgent: FraudAgent = {
    name: 'TelemetryAgent',
    description: 'Analisa dados de telemetria do veículo (BYD Dolphi Mini)',
    runOn: 'both',
    priority: 1,

    async analyze(_ctx: AgentContext): Promise<FraudRuleHit[]> {
        // TODO: Implementar quando API BYD estiver disponível
        // Esta função será expandida na Fase 10 do plano de implementação
        return [];
    },
};
