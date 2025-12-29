
import * as ridesRepository from "./rides.repository.js";
import { FraudService } from "../fraud/fraud.service.js";

export async function getAllRides(
    page: number = 1,
    limit: number = 10,
    filters?: {
        driverId?: string;
        vehicleId?: string;
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

// Note: shifts, rides, eq, sql imports are already present/needed
import { recalculateShiftTotals } from "../shifts/shifts.service.js";

export async function createRide(data: typeof rides.$inferInsert) {
    // 1. Create the ride
    const newRide = await ridesRepository.create(data);

    // 2. Recalculate shift totals
    if (data.shiftId) {
        await recalculateShiftTotals(data.shiftId);
        triggerFraudReanalysis(data.shiftId);
    }

    return newRide;
}

export async function updateRide(id: string, data: Partial<typeof rides.$inferInsert>) {
    // 1. Get original ride to check shiftId
    const original = await ridesRepository.getById(id);
    if (!original) throw new Error("Corrida não encontrada");

    // 2. Update ride
    const updated = await ridesRepository.update(id, data);

    // 3. Recalculate totals for involved shifts
    if (original.shiftId) {
        await recalculateShiftTotals(original.shiftId);
        triggerFraudReanalysis(original.shiftId);
    }
    // If shiftId changed (unlikely but possible), recalculate the new shift too
    if (data.shiftId && data.shiftId !== original.shiftId) {
        await recalculateShiftTotals(data.shiftId);
        triggerFraudReanalysis(data.shiftId);
    }

    return updated;
}

export async function deleteRide(id: string) {
    // 1. Get ride to check shiftId
    const ride = await ridesRepository.getById(id);
    if (!ride) throw new Error("Corrida não encontrada");

    // 2. Delete ride
    await ridesRepository.deleteRide(id);

    // 3. Recalculate totals
    if (ride.shiftId) {
        try {
            await recalculateShiftTotals(ride.shiftId);
            triggerFraudReanalysis(ride.shiftId);
        } catch (error) {
            console.warn(`[WARN] Could not recalculate totals for shift ${ride.shiftId} after deleting ride ${id}. Shift might be missing.`, error);
        }
    }

    return true;
}

async function triggerFraudReanalysis(shiftId: string) {
    try {
        const shift = await db.query.shifts.findFirst({
            where: (s, { eq }) => eq(s.id, shiftId)
        });

        if (shift?.status === 'finalizado') {
            setImmediate(() => {
                const start = Date.now();
                console.log(`[FRAUD] Re-analisando turno ${shiftId} após alteração de corrida...`);
                FraudService.analyzeShift(shiftId)
                    .then(() => console.log(`[FRAUD] Re-análise ${shiftId} concluída em ${Date.now() - start}ms`))
                    .catch(err => console.error(`[FRAUD] Erro ao re-analisar turno ${shiftId}:`, err));
            });
        }
    } catch (err) {
        console.error(`[FRAUD] Erro ao verificar turno para re-análise:`, err);
    }
}
