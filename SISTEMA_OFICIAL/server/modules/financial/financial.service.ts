
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

export async function getFixedCostInstallments(filters?: { month?: string, year?: string, status?: string }) {
    return await repository.getFixedCostInstallments(filters);
}

export async function updateFixedCostInstallment(id: string, data: any) {
    return await repository.updateFixedCostInstallment(id, data);
}

export async function createFixedCost(data: any) {
    return await repository.createFixedCost(data);
}

export async function updateFixedCost(id: string, data: any) {
    return await repository.updateFixedCost(id, data);
}

export async function deleteFixedCost(id: string) {
    return await repository.deleteFixedCost(id);
}

export async function restoreDefaultCostTypes() {
    return await repository.restoreDefaultCostTypes();
}

import { db } from "../../core/db/connection.js";
import { shifts, expenses } from "../../../shared/schema.js";
import { eq, and, sql } from "drizzle-orm";

// Note: imports already present
import { recalculateShiftTotals } from "../shifts/shifts.service.js";

export async function createExpense(data: typeof expenses.$inferInsert) {
    const newExpense = await repository.createExpense(data);

    // Update Shift Totals if linked to a shift
    if (data.shiftId) {
        await recalculateShiftTotals(data.shiftId);
    } else if (data.driverId) {
        // Fallback: try to find active shift for this driver
        const [shift] = await db.select().from(shifts)
            .where(and(
                eq(shifts.driverId, String(data.driverId)),
                eq(shifts.status, 'em_andamento')
            ));

        if (shift) {
            // Update expense with shiftId
            await repository.updateExpense(newExpense.id, { shiftId: shift.id });
            await recalculateShiftTotals(shift.id);
        }
    }

    return newExpense;
}

export async function updateExpense(id: string, data: Partial<typeof expenses.$inferInsert>) {
    const original = await repository.getExpenseById(id);
    if (!original) throw new Error("Despesa não encontrada");

    const updated = await repository.updateExpense(id, data);

    if (original.shiftId) {
        await recalculateShiftTotals(original.shiftId);
    }
    if (data.shiftId && data.shiftId !== original.shiftId) {
        await recalculateShiftTotals(data.shiftId);
    }

    return updated;
}

export async function deleteExpense(id: string) {
    const expense = await repository.getExpenseById(id);
    if (!expense) throw new Error("Despesa não encontrada");

    await repository.deleteExpense(id);

    // Tentar recalcular turno, mas não falhar se o turno não existir mais (despesa órfã)
    if (expense.shiftId) {
        try {
            await recalculateShiftTotals(expense.shiftId);
        } catch (error: any) {
            console.warn(`[deleteExpense] Não foi possível recalcular turno ${expense.shiftId} (pode ter sido deletado): ${error.message}`);
        }
    }

    return true;
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

export async function deleteLegacyMaintenance(id: string) {
    return await repository.deleteLegacyMaintenance(id);
}

export async function createLegacyMaintenance(data: any) {
    return await repository.createLegacyMaintenance(data);
}

// --- TIRES ---
export async function getAllTires() {
    return await repository.findAllTires();
}

export async function createTire(data: any) {
    return await repository.createTire(data);
}

export async function deleteTire(id: string) {
    return await repository.deleteTire(id);
}
