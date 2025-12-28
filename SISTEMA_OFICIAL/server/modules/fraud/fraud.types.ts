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

// --- NEW AUDIT METRICS TYPES ---
import { AuditMetrics } from "./fraud.audit.service.js"; // Import local types if needed, or redefine here to avoid circular dep if service imports types
// To avoid circular dependency, we redefine interfaces or move them to a shared types file.
// For now, I will modify fraud.audit.service.ts to export these types and reuse them here, 
// OR simpler: Copy definitions here if they are small.

export interface TimeSlot {
    name: string;
    startHour: number;
    endHour: number;
    horasReais: number;
    corridas: number;
    receita: number;
    corridasPorHora: number;
    receitaPorHora: number;
}

export interface GapAnalysis {
    maxGapMinutos: number;
    inicioMaxGap: Date | null;
    fimMaxGap: Date | null;
    gapEmHorarioDePico: boolean;
    status: 'NORMAL' | 'ANÔMALO';
}

export interface BaselineComparison {
    metrica: string;
    valorAtual: number;
    mediaHistorica: number;
    percentil: number;
    classificacao: string;
}

export interface AuditMetricsData {
    timeSlots: TimeSlot[];
    gapAnalysis: GapAnalysis;
    baselineComparison: BaselineComparison[];
    ritmoScore: number;
    classificacaoRitmo: string;
    scoreContextual: number;
    classificacaoTurno: 'BOM' | 'RUIM';
}
