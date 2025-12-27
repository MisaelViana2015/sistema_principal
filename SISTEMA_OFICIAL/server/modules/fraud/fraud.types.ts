// Basic types for the fraud detection module
export type FraudSeverity = "low" | "medium" | "high" | "critical";

export type FraudEventStatus =
    | "pendente"
    | "em_analise"
    | "confirmado"
    | "descartado"
    | "bloqueado";

export interface FraudRuleHit {
    code: string;
    label: string;
    description: string;
    severity: FraudSeverity;
    score: number;
    data?: Record<string, any>;
}

export interface FraudScore {
    totalScore: number;
    level: FraudSeverity;
    reasons: FraudRuleHit[];
}

export interface DriverBaseline {
    driverId: string;
    sampleSize: number;
    avgRevenuePerKm: number;
    avgRevenuePerHour: number;
    avgRidesPerHour: number;
    avgTicket: number;
    avgKmPerShift: number;
    avgShiftDurationHours: number;
}

export interface GlobalBaseline extends DriverBaseline {
    driverId: "_GLOBAL_";
}

export interface FraudShiftAnalysis {
    shiftId: string;
    driverId: string;
    vehicleId: string;
    date: string;
    kmTotal: number;
    revenueTotal: number;
    revenuePerKm: number;
    revenuePerHour: number;
    ridesPerHour: number;
    score: FraudScore;
    baseline?: DriverBaseline;
}

export interface ShiftContext {
    prevShiftKmEnd?: number | null;
    baseline?: DriverBaseline | null;
    globalBaseline?: GlobalBaseline | null;
}
