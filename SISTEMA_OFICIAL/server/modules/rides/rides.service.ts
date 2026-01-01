
import * as ridesRepository from "./rides.repository.js";
import { FraudService } from "../fraud/fraud.service.js";
import { db } from "../../core/db/connection.js";
import { shifts, rides } from "../../../shared/schema.js";
import { eq, sql } from "drizzle-orm";
// @ts-ignore
import { recalculateShiftTotals } from "../shifts/shifts.service.js";
import { auditService, AUDIT_ACTIONS } from "../../core/audit/index.js";
import type { AuditContext } from "../../core/audit/index.js";

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

export async function getRideById(id: string) {
    return await ridesRepository.getById(id);
}

export async function createRide(data: typeof rides.$inferInsert, context?: AuditContext) {
    const auditContext = context || auditService.createSystemContext('legacy-create-ride');

    return auditService.withAudit({
        action: AUDIT_ACTIONS.CREATE_RIDE,
        entity: 'rides',
        entityId: 'new', // generated inside
        operation: 'INSERT',
        context: auditContext,
        execute: async () => {
            // 1. Check for cooldown (5 minutes between any rides for this shift)
            const lastRide = await ridesRepository.getLastRideByShiftId(data.shiftId);
            if (lastRide) {
                const timeDiff = Math.abs(new Date(data.hora).getTime() - new Date(lastRide.hora).getTime());

                // 300000 ms = 5 minutes
                if (timeDiff < 300000) {
                    const secondsRemaining = Math.ceil((300000 - timeDiff) / 1000);
                    const minutes = Math.floor(secondsRemaining / 60);
                    const seconds = secondsRemaining % 60;
                    const timeString = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

                    throw new Error(`Aguarde ${timeString} para lançar uma nova corrida.`);
                }
            }

            // 2. Create the ride
            const newRide = await ridesRepository.create(data);

            // 3. Recalculate shift totals
            if (data.shiftId) {
                await recalculateShiftTotals(data.shiftId);
                triggerFraudReanalysis(data.shiftId);
            }

            return newRide;
        },
        fetchAfter: async (result) => {
            if (result && result.id) {
                return await getRideById(result.id);
            }
            return result;
        }
    });
}

export async function updateRide(id: string, data: Partial<typeof rides.$inferInsert>, context?: AuditContext) {
    const auditContext = context || auditService.createSystemContext('legacy-update-ride');

    return auditService.withAudit({
        action: AUDIT_ACTIONS.UPDATE_RIDE,
        entity: 'rides',
        entityId: id,
        operation: 'UPDATE',
        context: auditContext,
        fetchBefore: () => getRideById(id),
        execute: async () => {
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
        },
        fetchAfter: () => getRideById(id)
    });
}

export async function deleteRide(id: string, context?: AuditContext) {
    const auditContext = context || auditService.createSystemContext('legacy-delete-ride');

    return auditService.withAudit({
        action: AUDIT_ACTIONS.DELETE_RIDE,
        entity: 'rides',
        entityId: id,
        operation: 'DELETE',
        context: auditContext,
        fetchBefore: () => getRideById(id),
        execute: async () => {
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
    });
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
