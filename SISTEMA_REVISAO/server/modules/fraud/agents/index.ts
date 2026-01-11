
import { FraudRuleHit } from '../fraud.types.js';

export interface AgentContext {
    shiftId: string;
    driverId: string;
    vehicleId: string;
    shiftStart: Date;
    shiftEnd: Date | null;
    isOpen: boolean;
    rides: Array<{ id: string; valor: number; hora: Date; tipo: string }>;
    expenses: Array<{ id: string; valor: number; costTypeId: string | null }>;
    baseline: any | null;
    fleetStats: FleetStats | null;
}

export interface FleetStats {
    openDrivers: number;
    ridesLast15m: number;
    ridesPerDriver15m: number;
    medianRideValue15m: number;
    ridesLast60m: number;
    ridesPerDriver60m: number;
    demandHigh: boolean;
}

export interface FraudAgent {
    name: string;
    description: string;
    runOn: 'open_shift' | 'closed_shift' | 'both';
    priority: number; // 1 = alta, 3 = baixa
    analyze: (context: AgentContext) => Promise<FraudRuleHit[]>;
}

export * from './realtime.agent.js';
export * from './cohort.agent.js';
export * from './audit.agent.js';
export * from './history.agent.js';
export * from './financial.agent.js';
export * from './closure.agent.js';
export * from './telemetry.agent.js';
