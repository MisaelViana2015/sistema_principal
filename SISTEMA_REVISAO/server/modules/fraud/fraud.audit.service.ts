
import { db } from "../../core/db/connection.js";
import { rides, shifts } from "../../../shared/schema.js";
import { eq, and, gte, asc } from "drizzle-orm";

// --- CONSTANTES ---
const TIMEZONE = 'America/Sao_Paulo';
const TIME_SLOTS = [
    { name: "Madrugada", startHour: 0, endHour: 6 },
    { name: "Manhã", startHour: 6, endHour: 12 },
    { name: "Tarde", startHour: 12, endHour: 18 },
    { name: "Noite", startHour: 18, endHour: 24 },
];
const PEAK_HOURS = [7, 8, 9, 17, 18, 19];
const MAX_GAP_THRESHOLD = 120; // minutos

// --- TIPOS ---
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

export interface AuditMetrics {
    timeSlots: TimeSlot[];
    gapAnalysis: GapAnalysis;
    baselineComparison: BaselineComparison[];
    ritmoScore: number;
    classificacaoRitmo: string;
    scoreContextual: number;
    classificacaoTurno: 'BOM' | 'RUIM';
}

// --- FUNÇÃO: INTERSEÇÃO REAL DE FAIXA HORÁRIA ---
// FIXED: Now handles cross-day shifts correctly
function calculateSlotOverlapHours(
    shiftStart: Date,
    shiftEnd: Date,
    slotStartHour: number,
    slotEndHour: number
): number {
    // Handle edge case: shift ends before it starts (shouldn't happen but safety)
    if (shiftEnd.getTime() < shiftStart.getTime()) {
        return 0;
    }

    // For cross-day shifts, we need to check both days
    const shiftStartDate = new Date(shiftStart);
    shiftStartDate.setHours(0, 0, 0, 0);

    const shiftEndDate = new Date(shiftEnd);
    shiftEndDate.setHours(0, 0, 0, 0);

    let totalOverlapHours = 0;

    // Iterate through each day the shift spans
    const currentDay = new Date(shiftStartDate);
    while (currentDay.getTime() <= shiftEndDate.getTime()) {
        // Build slot interval for this day
        const daySlotStart = new Date(currentDay);
        daySlotStart.setHours(slotStartHour, 0, 0, 0);

        const daySlotEnd = new Date(currentDay);
        daySlotEnd.setHours(slotEndHour, 0, 0, 0);

        // Calculate intersection with the shift for this day's slot
        const overlapStartMs = Math.max(shiftStart.getTime(), daySlotStart.getTime());
        const overlapEndMs = Math.min(shiftEnd.getTime(), daySlotEnd.getTime());

        const overlapMs = Math.max(0, overlapEndMs - overlapStartMs);
        totalOverlapHours += overlapMs / (1000 * 60 * 60);

        // Move to next day
        currentDay.setDate(currentDay.getDate() + 1);
    }

    return totalOverlapHours;
}

// --- FUNÇÃO: FAIXAS HORÁRIAS ---
export async function calculateTimeSlots(
    shiftId: string,
    shiftStart: Date,
    shiftEnd: Date
): Promise<TimeSlot[]> {
    const shiftRides = await db.query.rides.findMany({
        where: eq(rides.shiftId, shiftId),
        orderBy: asc(rides.hora)
    });

    const slots: TimeSlot[] = TIME_SLOTS.map(slot => {
        const horasReais = calculateSlotOverlapHours(
            shiftStart,
            shiftEnd,
            slot.startHour,
            slot.endHour
        );

        return {
            ...slot,
            horasReais,
            corridas: 0,
            receita: 0,
            corridasPorHora: 0,
            receitaPorHora: 0
        };
    });

    // Bucketizar corridas
    for (const ride of shiftRides) {
        const rideTime = new Date(ride.hora);
        const rideHour = rideTime.getHours();

        const slotIndex = TIME_SLOTS.findIndex(
            s => rideHour >= s.startHour && rideHour < s.endHour
        );

        if (slotIndex >= 0) {
            slots[slotIndex].corridas++;
            slots[slotIndex].receita += Number(ride.valor || 0);
        }
    }

    // Calcular taxas (divisão segura)
    slots.forEach(slot => {
        if (slot.horasReais > 0) {
            slot.corridasPorHora = slot.corridas / slot.horasReais;
            slot.receitaPorHora = slot.receita / slot.horasReais;
        }
    });

    return slots;
}

// --- FUNÇÃO: GAPS ---
export async function detectGaps(shiftId: string): Promise<GapAnalysis> {
    const shiftRides = await db.query.rides.findMany({
        where: eq(rides.shiftId, shiftId),
        orderBy: asc(rides.hora)
    });

    let maxGapMinutos = 0;
    let inicioMaxGap: Date | null = null;
    let fimMaxGap: Date | null = null;

    for (let i = 1; i < shiftRides.length; i++) {
        // Since rides table only has 'hora', we use it for both start and approximate end
        // Gap = time between consecutive rides (hora_next - hora_prev)
        const prevTime = new Date(shiftRides[i - 1].hora);
        const currTime = new Date(shiftRides[i].hora);
        const gapMin = (currTime.getTime() - prevTime.getTime()) / (1000 * 60);

        if (gapMin > maxGapMinutos) {
            maxGapMinutos = gapMin;
            inicioMaxGap = prevTime;
            fimMaxGap = currTime;
        }
    }

    const gapEmHorarioDePico = inicioMaxGap
        ? PEAK_HOURS.includes(inicioMaxGap.getHours())
        : false;

    return {
        maxGapMinutos,
        inicioMaxGap,
        fimMaxGap,
        gapEmHorarioDePico,
        status: maxGapMinutos > MAX_GAP_THRESHOLD ? 'ANÔMALO' : 'NORMAL'
    };
}

// --- FUNÇÃO: BASELINE ---
export async function compareWithBaseline(
    driverId: string,
    currentShift: {
        totalBruto: number;
        totalCorridas: number;
        kmTotal: number;
        durationHours: number;
    }
): Promise<BaselineComparison[]> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const historicalShifts = await db.query.shifts.findMany({
        where: and(
            eq(shifts.driverId, driverId),
            eq(shifts.status, 'finalizado'),
            gte(shifts.inicio, thirtyDaysAgo)
        ),
        limit: 30
    });

    if (historicalShifts.length < 5) {
        return [{
            metrica: "Baseline",
            valorAtual: 0,
            mediaHistorica: 0,
            percentil: 50,
            classificacao: "Dados Insuficientes"
        }];
    }

    // Calcular arrays históricos
    const revenues = historicalShifts.map(s => Number(s.totalBruto || 0));
    const tickets = historicalShifts.map(s => {
        const c = Number(s.totalCorridas || 0);
        return c > 0 ? Number(s.totalBruto || 0) / c : 0;
    });
    const kms = historicalShifts.map(s =>
        Math.max(0, Number(s.kmFinal || 0) - Number(s.kmInicial || 0))
    );

    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

    const calcPercentil = (v: number, arr: number[]): number => {
        const sorted = [...arr].sort((a, b) => a - b);
        const idx = sorted.findIndex(x => x >= v);
        return idx >= 0 ? Math.round((idx / sorted.length) * 100) : 100;
    };

    const getClass = (p: number): string => {
        if (p < 25) return "Muito Abaixo";
        if (p < 40) return "Abaixo";
        if (p > 75) return "Muito Acima";
        if (p > 60) return "Acima";
        return "Normal";
    };

    const currentTicket = currentShift.totalCorridas > 0
        ? currentShift.totalBruto / currentShift.totalCorridas
        : 0;

    return [
        {
            metrica: "Receita Total",
            valorAtual: currentShift.totalBruto,
            mediaHistorica: avg(revenues),
            percentil: calcPercentil(currentShift.totalBruto, revenues),
            classificacao: getClass(calcPercentil(currentShift.totalBruto, revenues))
        },
        {
            metrica: "Ticket Médio",
            valorAtual: currentTicket,
            mediaHistorica: avg(tickets),
            percentil: calcPercentil(currentTicket, tickets),
            classificacao: getClass(calcPercentil(currentTicket, tickets))
        },
        {
            metrica: "KM Total",
            valorAtual: currentShift.kmTotal,
            mediaHistorica: avg(kms),
            percentil: calcPercentil(currentShift.kmTotal, kms),
            classificacao: getClass(calcPercentil(currentShift.kmTotal, kms))
        }
    ];
}

// --- FUNÇÃO: SCORE CONTEXTUAL ---
export function calculateContextualScore(
    officialScore: number,
    shareParticular: number
): number {
    const fator = 1 - (shareParticular / 100) * 0.5;
    return Math.round(officialScore * fator);
}

// --- FUNÇÃO PRINCIPAL ---
export async function calculateAuditMetrics(
    shiftId: string,
    driverId: string,
    shift: {
        inicio: Date;
        fim: Date | null;
        totalBruto: number;
        totalCorridas: number;
        kmInicial: number;
        kmFinal: number;
        duracaoMin: number;
    },
    officialScore: number,
    shareParticular: number
): Promise<AuditMetrics> {
    const shiftEnd = shift.fim || new Date();
    const kmTotal = Math.max(0, shift.kmFinal - shift.kmInicial);
    const durationHours = shift.duracaoMin > 0
        ? shift.duracaoMin / 60
        : Math.max(0.01, (shiftEnd.getTime() - new Date(shift.inicio).getTime()) / (1000 * 60 * 60));

    const [timeSlots, gapAnalysis, baselineComparison] = await Promise.all([
        calculateTimeSlots(shiftId, new Date(shift.inicio), shiftEnd),
        detectGaps(shiftId),
        compareWithBaseline(driverId, {
            totalBruto: shift.totalBruto,
            totalCorridas: shift.totalCorridas,
            kmTotal,
            durationHours
        })
    ]);

    // Ritmo
    const faixasAtivas = timeSlots.filter(s => s.corridas > 0).length;
    const ritmoScore = (faixasAtivas / 4) * 100;
    const classificacaoRitmo = ritmoScore >= 75 ? 'Consistente' : ritmoScore >= 50 ? 'Irregular' : 'Fraco';

    // Score Contextual
    const scoreContextual = calculateContextualScore(officialScore, shareParticular);

    // Classificação Turno
    const receitaKm = kmTotal > 0 ? shift.totalBruto / kmTotal : 0;
    const classificacaoTurno: 'BOM' | 'RUIM' =
        ritmoScore >= 50 &&
            gapAnalysis.status === 'NORMAL' &&
            receitaKm >= 3
            ? 'BOM'
            : 'RUIM';

    return {
        timeSlots,
        gapAnalysis,
        baselineComparison,
        ritmoScore,
        classificacaoRitmo,
        scoreContextual,
        classificacaoTurno
    };
}
