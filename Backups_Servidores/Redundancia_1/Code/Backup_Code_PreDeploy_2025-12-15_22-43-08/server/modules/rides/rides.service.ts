
import * as ridesRepository from "./rides.repository.js";

export async function getAllRides(
    page: number = 1,
    limit: number = 10,
    filters?: {
        driverId?: number;
        vehicleId?: number;
        shiftId?: string;
        startDate?: string;
        endDate?: string;
    }
) {
    return await ridesRepository.getWithPagination(page, limit, filters);
}

import { db } from "../../core/db/connection.js";
import { shifts, rides } from "../../../shared/schema.js";
import { eq, sql } from "drizzle-orm";

export async function createRide(data: typeof rides.$inferInsert) {
    // 1. Create the ride
    const newRide = await ridesRepository.create(data);

    // 2. Fetch current shift
    const [shift] = await db.select().from(shifts).where(eq(shifts.id, data.shiftId));

    if (shift) {
        const valor = Number(data.valor);
        const isApp = data.tipo === "APP";

        // Calculate new totals
        const totalBruto = (shift.totalBruto || 0) + valor;
        const totalApp = isApp ? (shift.totalApp || 0) + valor : (shift.totalApp || 0);
        const totalParticular = !isApp ? (shift.totalParticular || 0) + valor : (shift.totalParticular || 0);

        const totalCorridas = (shift.totalCorridas || 0) + 1;
        const totalCorridasApp = isApp ? (shift.totalCorridasApp || 0) + 1 : (shift.totalCorridasApp || 0);
        const totalCorridasParticular = !isApp ? (shift.totalCorridasParticular || 0) + 1 : (shift.totalCorridasParticular || 0);

        const totalCustos = shift.totalCustos || 0;
        const liquido = totalBruto - totalCustos;

        // 60/40 Split
        const repasseEmpresa = liquido * 0.60;
        const repasseMotorista = liquido * 0.40;

        await db.update(shifts)
            .set({
                totalCorridas,
                totalCorridasApp,
                totalCorridasParticular,
                totalApp,
                totalParticular,
                totalBruto,
                liquido,
                repasseEmpresa,
                repasseMotorista
            })
            .where(eq(shifts.id, data.shiftId));
    }

    return newRide;
}
