
import { Request, Response } from "express";
import * as service from "./financial.service.js";
import {
    createFixedCostSchema, updateFixedCostSchema,
    createExpenseSchema, updateExpenseSchema,
    createCostTypeSchema, updateCostTypeSchema,
    updateInstallmentSchema
} from "./financial.validators.js";

export async function getExpenses(req: Request, res: Response) {
    try {
        const shiftId = req.query.shiftId as string;
        const expenses = await service.getAllExpenses({ shiftId });
        res.json(expenses);
    } catch (error) {
        console.error("Erro ao buscar despesas:", error);
        res.status(500).json({ error: "Erro interno ao buscar despesas" });
    }
}

export async function getLegacyMaintenances(req: Request, res: Response) {
    try {
        const maintenances = await service.getAllLegacyMaintenances();
        res.json(maintenances);
    } catch (error) {
        console.error("Erro ao buscar manutenções legadas:", error);
        res.status(500).json({ error: "Erro interno ao buscar manutenções legadas" });
    }
}

export async function getCostTypes(req: Request, res: Response) {
    try {
        const types = await service.getAllCostTypes();
        res.json(types);
    } catch (error) {
        console.error("Erro ao buscar tipos de custo:", error);
        res.status(500).json({ error: "Erro interno ao buscar tipos de custo" });
    }
}

export async function getFixedCosts(req: Request, res: Response) {
    try {
        const costs = await service.getAllFixedCosts();
        res.json(costs);
    } catch (error) {
        console.error("Erro ao buscar custos fixos:", error);
        res.status(500).json({ error: "Erro interno ao buscar custos fixos" });
    }
}

export async function createFixedCost(req: Request, res: Response) {
    try {
        const validatedData = createFixedCostSchema.parse(req.body);

        const newCost = await service.createFixedCost({
            name: validatedData.name,
            value: validatedData.value,
            frequency: validatedData.frequency,
            dueDay: validatedData.dueDay,
            vehicleId: validatedData.vehicleId,
            costTypeId: validatedData.costTypeId,
            notes: validatedData.notes,
            totalInstallments: validatedData.totalInstallments,
            startDate: validatedData.startDate ? validatedData.startDate.toISOString() : undefined // Service/Repo expects Date or string? Repo uses new Date(startDate) so string is safer if repository expects string, but schema says timestamp. Repository: `newCost.startDate` is used in `new Date(newCost.startDate)`. Drizzle handles Date object to timestamp.
            // Actually, let's pass it as Date if repository handles it. Repo uses `startDate` from `fixedCosts` table insert.
            // Let's check repository again. Line 44: `const start = new Date(newCost.startDate);`.
            // So if `newCost.startDate` is a Date object, `new Date(Date object)` works.
            // So passing Date is fine.
            // HOWEVER, the `createFixedCost` types in `service` are `any`, but `repository` says `typeof fixedCosts.$inferInsert`.
            // `fixedCosts` schema definition in `shared/schema.ts`: `start_date: timestamp('start_date')`.
            // Drizzle expects Date object for timestamp.
        });
        res.status(201).json(newCost);
    } catch (error: any) {
        console.error("Erro ao criar custo fixo:", error);
        if (error.issues) return res.status(400).json({ error: "Validation error", details: error.issues });
        res.status(500).json({ error: "Erro interno", detail: error.message, code: error.code });
    }
}

export async function updateFixedCost(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const validatedData = updateFixedCostSchema.parse(req.body);

        const updated = await service.updateFixedCost(id, validatedData);
        res.json(updated);
    } catch (error: any) {
        console.error("Erro ao atualizar custo fixo:", error);
        if (error.issues) return res.status(400).json({ error: "Validation error", details: error.issues });
        res.status(500).json({ error: "Erro interno" });
    }
}

export async function deleteFixedCost(req: Request, res: Response) {
    try {
        const { id } = req.params;
        await service.deleteFixedCost(id);
        res.json({ message: "Custo fixo removido" });
    } catch (error) {
        console.error("Erro ao remover custo fixo:", error);
        res.status(500).json({ error: "Erro interno" });
    }
}



export async function getFixedCostInstallments(req: Request, res: Response) {
    try {
        const filters = {
            month: req.query.month as string,
            year: req.query.year as string,
            status: req.query.status as string
        };
        const installments = await service.getFixedCostInstallments(filters);
        res.json(installments);
    } catch (error) {
        console.error("Erro ao buscar parcelas:", error);
        res.status(500).json({ error: "Erro interno" });
    }
}

export async function updateFixedCostInstallment(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const validatedData = updateInstallmentSchema.parse(req.body);
        const updated = await service.updateFixedCostInstallment(id, validatedData);
        res.json(updated);
    } catch (error: any) {
        console.error("Erro ao atualizar parcela:", error);
        if (error.issues) return res.status(400).json({ error: "Validation error", details: error.issues });
        res.status(500).json({ error: "Erro interno" });
    }
}

export async function createExpense(req: Request, res: Response) {
    try {
        const driverId = req.body.driverId || (req as any).user?.userId;
        const data = { ...req.body, driverId };

        const validatedData = createExpenseSchema.parse(data);

        const newExpense = await service.createExpense({
            driverId: validatedData.driverId,
            shiftId: validatedData.shiftId,
            costTypeId: validatedData.costTypeId,
            value: validatedData.value,
            date: validatedData.date,
            notes: validatedData.notes,
            isParticular: validatedData.isParticular,
        });

        res.status(201).json(newExpense);
    } catch (error: any) {
        console.error("Erro ao criar despesa:", error);
        if (error.issues) return res.status(400).json({ error: "Validation error", details: error.issues });
        res.status(500).json({ error: "Erro interno ao criar despesa" });
    }
}

export async function updateExpenseController(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const validatedData = updateExpenseSchema.parse(req.body);

        const updated = await service.updateExpense(id, validatedData);
        res.json(updated);
    } catch (error: any) {
        console.error("Erro ao atualizar despesa:", error);
        if (error.issues) return res.status(400).json({ error: "Validation error", details: error.issues });
        res.status(500).json({ error: error.message || "Erro interno ao atualizar despesa" });
    }
}

export async function deleteExpenseController(req: Request, res: Response) {
    try {
        const { id } = req.params;
        await service.deleteExpense(id);
        res.json({ message: "Despesa excluída com sucesso" });
    } catch (error: any) {
        console.error("Erro ao excluir despesa:", error);
        res.status(500).json({ error: error.message || "Erro interno ao excluir despesa" });
    }
}

export async function createCostType(req: Request, res: Response) {
    try {
        const validatedData = createCostTypeSchema.parse(req.body);

        const newType = await service.createCostType(validatedData);
        res.status(201).json(newType);
    } catch (error: any) {
        console.error("Erro ao criar tipo de custo:", error);
        if (error.issues) return res.status(400).json({ error: "Validation error", details: error.issues });
        res.status(500).json({ error: "Erro interno" });
    }
}

export async function updateCostType(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const validatedData = updateCostTypeSchema.parse(req.body);
        const updated = await service.updateCostType(id, validatedData);
        res.json(updated);
    } catch (error: any) {
        console.error("Erro ao atualizar tipo de custo:", error);
        if (error.issues) return res.status(400).json({ error: "Validation error", details: error.issues });
        res.status(500).json({ error: "Erro interno" });
    }
}

export async function deleteCostType(req: Request, res: Response) {
    try {
        const { id } = req.params;
        await service.deleteCostType(id);
        res.json({ message: "Tipo de custo removido" });
    } catch (error: any) {
        console.error("Erro ao deletar tipo de custo:", error);

        // Postgres Foreign Key Violation
        if (error.code === '23503') {
            return res.status(409).json({
                error: "Não é possível excluir. Este tipo de custo já está sendo usado em lançamentos."
            });
        }

        res.status(500).json({ error: "Erro interno ao excluir: " + (error.message || "Erro desconhecido") });
    }
}

export async function restoreDefaultCostTypes(req: Request, res: Response) {
    try {
        await service.restoreDefaultCostTypes();
        res.json({ message: "Tipos de custo padrão restaurados." });
    } catch (error) {
        console.error("Erro ao restaurar tipos de custo:", error);
        res.status(500).json({ error: "Erro interno ao restaurar tipos de custo" });
    }
}
