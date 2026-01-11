import { db } from "../../core/db/connection.js";
import { shifts } from "../../../shared/schema.js";
import { and, eq, gte, lte, desc } from "drizzle-orm";
import { DriverBaseline } from "./fraud.types.js";

/**
 * Calcula a baseline (perfil histórico) do motorista.
 * Baseado nos últimos 30 dias ou 200 turnos.
 */

function safeNumber(v: any, fallback = 0): number {
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    if (typeof v === "string") {
        const n = Number(v.replace(",", "."));
        return Number.isNaN(n) ? fallback : n;
    }
    return fallback;
}

function calcStats(values: number[]) {
    if (!values.length) {
        return { mean: 0 };
    }
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    return { mean };
}

export async function buildDriverBaseline(
    driverId: string,
    referenceDateISO?: string
): Promise<DriverBaseline | null> {
    const referenceDate = referenceDateISO ? new Date(referenceDateISO) : new Date();
    const fromDate = new Date(referenceDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 dias atrás

    const driverShifts = await db.query.shifts.findMany({
        where: (s, { and, eq, gte, lte }) =>
            and(
                eq(s.driverId, driverId),
                gte(s.inicio, fromDate),
                lte(s.inicio, referenceDate),
                eq(s.status, 'finalizado')
            ),
        limit: 200,
        orderBy: (s, { desc }) => desc(s.inicio)
    });

    if (!driverShifts.length || driverShifts.length < 5) return null; // Mínimo 5 turnos para ter estatística

    const kmTotals: number[] = [];
    const revenues: number[] = [];
    const durationsHours: number[] = [];
    const ridesCounts: number[] = [];
    const tickets: number[] = [];

    for (const sh of driverShifts) {
        const kmStart = safeNumber(sh.kmInicial, 0);
        const kmEnd = safeNumber(sh.kmFinal, 0);
        const kmTotal = Math.max(0, kmEnd - kmStart);
        kmTotals.push(kmTotal);

        const totalBruto = safeNumber(sh.totalBruto, 0);
        revenues.push(totalBruto);

        const durMin = safeNumber(sh.duracaoMin, 0);
        const durHours =
            durMin > 0
                ? durMin / 60
                : Math.max(
                    0.01,
                    (new Date(sh.fim ?? new Date()).getTime() -
                        new Date(sh.inicio).getTime()) /
                    (1000 * 60 * 60)
                );
        durationsHours.push(durHours);

        const totalCorridas = safeNumber(sh.totalCorridas, 0);
        ridesCounts.push(totalCorridas);

        if (totalCorridas > 0) {
            tickets.push(totalBruto / totalCorridas);
        }
    }

    const revenuePerKmArr = revenues.map((rev, idx) => {
        const km = kmTotals[idx] || 1;
        return rev / km;
    });

    const revenuePerHourArr = revenues.map((rev, idx) => {
        const h = durationsHours[idx] || 0.01;
        return rev / h;
    });

    const ridesPerHourArr = ridesCounts.map((c, idx) => {
        const h = durationsHours[idx] || 0.01;
        return c / h;
    });

    // Calcular Médias
    const avgRevenuePerKm = calcStats(revenuePerKmArr).mean;
    const avgRevenuePerHour = calcStats(revenuePerHourArr).mean;
    const avgRidesPerHour = calcStats(ridesPerHourArr).mean;
    const avgTicket = calcStats(tickets).mean;
    const avgKmPerShift = calcStats(kmTotals).mean;
    const avgShiftDurationHours = calcStats(durationsHours).mean;

    return {
        driverId,
        sampleSize: driverShifts.length,
        avgRevenuePerKm,
        avgRevenuePerHour,
        avgRidesPerHour,
        avgTicket,
        avgKmPerShift,
        avgShiftDurationHours,
    };
}
