
import * as repository from "./financial.repository.js";

export async function getAllExpenses(filters?: { shiftId?: string }) {
    return await repository.findAllExpenses(filters);
}

export async function getAllLegacyMaintenances() {
    return await repository.findAllLegacyMaintenances();
}

export async function getAllCostTypes() {
    return await repository.findAllCostTypes();
}

export async function getAllFixedCosts() {
    return await repository.findAllFixedCosts();
}

import { db } from "../../core/db/connection.js";
import { shifts, expenses } from "../../../shared/schema.js";
import { eq, and, sql } from "drizzle-orm";

export async function createExpense(data: typeof expenses.$inferInsert) {
    const newExpense = await repository.createExpense(data);

    // 2. Update Open Shift if exists
    if (data.driverId) {
        const valor = Number(data.value);

        const [shift] = await db.select().from(shifts)
            .where(and(
                eq(shifts.driverId, String(data.driverId)),
                eq(shifts.status, 'em_andamento')
            ));

        if (shift) {
            const totalBruto = Number(shift.totalBruto || 0);
            const currentCustos = Number(shift.totalCustos || 0);
            const newTotalCustos = currentCustos + valor;
            const newLiquido = totalBruto - newTotalCustos;

            await db.update(shifts)
                .set({
                    totalCustos: newTotalCustos,
                    liquido: newLiquido,
                    repasseEmpresa: newLiquido * 0.60,
                    repasseMotorista: newLiquido * 0.40
                })
                .where(eq(shifts.id, shift.id));
        }
    }

    return newExpense;
}

export async function createCostType(data: any) {
    return await repository.createCostType(data);
}

export async function updateCostType(id: string, data: any) {
    return await repository.updateCostType(id, data);
}

export async function deleteCostType(id: string) {
    return await repository.deleteCostType(id);
}
