
import type { FraudAgent, AgentContext } from './index.js';
import type { FraudRuleHit } from '../fraud.types.js';

export const CohortAgent: FraudAgent = {
    name: 'CohortAgent',
    description: 'Compara motorista com a frota em tempo real',
    runOn: 'open_shift',
    priority: 1,

    async analyze(ctx: AgentContext): Promise<FraudRuleHit[]> {
        const hits: FraudRuleHit[] = [];

        if (!ctx.fleetStats || ctx.fleetStats.openDrivers < 2) {
            return hits; // Não há comparação possível
        }

        const fleet = ctx.fleetStats;
        const now = new Date();
        const last15m = new Date(now.getTime() - 15 * 60 * 1000);

        const driverRidesLast15m = ctx.rides.filter(r => r.hora >= last15m);

        // REGRA 1: DRIVER_IDLE_FLEET_ACTIVE
        if (fleet.demandHigh && driverRidesLast15m.length === 0) {
            hits.push({
                code: 'DRIVER_IDLE_FLEET_ACTIVE',
                label: 'Motorista parado enquanto frota está ativa',
                description: `Demanda alta (${fleet.ridesPerDriver15m.toFixed(1)} corridas/motorista em 15min) mas motorista sem corridas`,
                severity: 'high',
                score: 20,
                confidence: 0.75,
                needsEvidence: true, // Needs dashcam/telemetry to confirm why
                data: {
                    fleetRidesPerDriver15m: fleet.ridesPerDriver15m,
                    fleetMedianValue: fleet.medianRideValue15m,
                    driverRidesLast15m: 0,
                    demandHigh: true,
                },
            });
        }

        // REGRA 2: NO_RIDE_15_PLUS_HIGH_DEMAND
        if (fleet.demandHigh && driverRidesLast15m.length > 0) {
            const rides15Plus = driverRidesLast15m.filter(r => r.valor >= 15);
            if (rides15Plus.length === 0 && fleet.medianRideValue15m >= 15) {
                hits.push({
                    code: 'NO_RIDE_15_PLUS_HIGH_DEMAND',
                    label: 'Sem corridas >= R$15 em demanda alta',
                    description: `Frota com mediana R$${fleet.medianRideValue15m.toFixed(0)} mas motorista só tem corridas < R$15`,
                    severity: 'medium',
                    score: 15,
                    confidence: 0.65,
                    data: {
                        driverRides15m: driverRidesLast15m.length,
                        driverAvgValue: driverRidesLast15m.reduce((s, r) => s + r.valor, 0) / driverRidesLast15m.length,
                        fleetMedianValue: fleet.medianRideValue15m,
                    },
                });
            }
        }

        // REGRA 3: OUTLIER_VS_FLEET (produtividade muito abaixo da frota)
        const driverRidesPerHour = ctx.rides.length / Math.max(1, (now.getTime() - ctx.shiftStart.getTime()) / 3600000);
        const fleetRidesPerHour = fleet.ridesPerDriver60m;

        if (fleetRidesPerHour > 0 && driverRidesPerHour < fleetRidesPerHour * 0.5) {
            hits.push({
                code: 'OUTLIER_VS_FLEET',
                label: 'Produtividade muito abaixo da frota',
                description: `Motorista: ${driverRidesPerHour.toFixed(1)} corridas/h vs Frota: ${fleetRidesPerHour.toFixed(1)} corridas/h`,
                severity: 'medium',
                score: 15,
                confidence: 0.7,
                data: {
                    driverRidesPerHour,
                    fleetRidesPerHour,
                    ratio: driverRidesPerHour / fleetRidesPerHour,
                },
            });
        }

        return hits;
    },
};
