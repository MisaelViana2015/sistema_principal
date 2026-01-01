import { Request, Response } from "express";
import * as service from "./financial.service.js";
import { db } from "../../core/db/connection.js";
import { shifts } from "../../../shared/schema.js";
import { and, eq } from "drizzle-orm";
import * as shiftsService from "../shifts/shifts.service.js";
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

export async function deleteLegacyMaintenance(req: Request, res: Response) {
    try {
        const { id } = req.params;
        await service.deleteLegacyMaintenance(id);
        res.json({ message: "Manutenção removida com sucesso" });
    } catch (error) {
        console.error("Erro ao remover manutenção legada:", error);
        res.status(500).json({ error: "Erro interno ao remover manutenção" });
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
        const payload = createFixedCostSchema.parse(req.body);
        const fixedCost = await service.createFixedCost({
            name: payload.name,
            value: payload.valor,
            frequency: payload.frequency,
            dueDay: payload.dueDay,
            vehicleId: payload.vehicleId,
            costTypeId: payload.costTypeId,
            notes: payload.notes,
            vendor: payload.vendor,
            description: payload.description,
            totalInstallments: payload.totalInstallments,
            startDate: payload.startDate
        });
        res.status(201).json(fixedCost);
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
        res.status(500).json({ error: "Erro interno", message: error.message, code: error.code });
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
        const user = (req as any).user;
        const driverId = user.role === 'admin' ? (req.body.driverId || user.userId) : user.userId;

        const data = { ...req.body, driverId };
        const payload = createExpenseSchema.parse(data);

        // Se houver shiftId, verificar se o turno pertence a este motorista (Segurança Adicional)
        if (payload.shiftId) {
            const shift = await db.select().from(shifts)
                .where(and(eq(shifts.id, payload.shiftId), eq(shifts.driverId, String(driverId))))
                .limit(1);

            if (shift.length === 0 && user.role !== 'admin') {
                return res.status(403).json({ error: "Turno não pertence ao motorista" });
            }
        }

        const newExpense = await service.createExpense({
            driverId: payload.driverId,
            shiftId: payload.shiftId,
            costTypeId: payload.costTypeId,
            value: payload.valor,
            date: payload.data,
            notes: payload.notes,
            isParticular: payload.isParticular,
            isSplitCost: payload.isSplitCost,
        }, req.auditContext);

        res.status(201).json(newExpense);
    } catch (error: any) {
        console.error("Erro ao criar despesa:", error);
        if (error.issues) return res.status(400).json({ error: "Validation error", details: error.issues });
        res.status(500).json({ error: "Erro interno", detail: error.message });
    }
}

export async function updateExpenseController(req: Request, res: Response) {
    const validatedData = updateExpenseSchema.parse(req.body);

    const updated = await service.updateExpense(id, validatedData, req.auditContext);
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
        await service.deleteExpense(id, req.auditContext);
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

// ... existing code ...

export async function createLegacyMaintenance(req: Request, res: Response) {
    try {
        const data = req.body;
        // Basic validation could go here or use Zod
        const newMaintenance = await service.createLegacyMaintenance(data);
        res.status(201).json(newMaintenance);
    } catch (error) {
        console.error("Erro ao criar manutenção legada:", error);
        res.status(500).json({ error: "Erro interno ao criar manutenção" });
    }
}

// --- TIRES ---
export async function getTires(req: Request, res: Response) {
    try {
        const tires = await service.getAllTires();
        res.json(tires);
    } catch (error) {
        console.error("Erro ao buscar pneus:", error);
        res.status(500).json({ error: "Erro interno ao buscar pneus" });
    }
}

export async function createTire(req: Request, res: Response) {
    try {
        const data = req.body;
        const newTire = await service.createTire(data);
        res.status(201).json(newTire);
    } catch (error) {
        console.error("Erro ao criar pneu:", error);
        res.status(500).json({ error: "Erro interno ao criar pneu" });
    }
}

export async function deleteTire(req: Request, res: Response) {
    try {
        const { id } = req.params;
        await service.deleteTire(id);
        res.json({ message: "Pneu removido com sucesso" });
    } catch (error) {
        console.error("Erro ao remover pneu:", error);
        res.status(500).json({ error: "Erro interno ao remover pneu" });
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


export async function fixLegacyShifts(req: Request, res: Response) {
    try {
        const dryRun = req.query.dryRun === "true";
        const result = await service.fixLegacyShifts(dryRun);
        res.json(result);
    } catch (error: any) {
        console.error("Erro ao corrigir turnos:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function getDebugShifts(req: Request, res: Response) {
    try {
        const result = await service.getDebugShifts();
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function fixSingleShift(req: Request, res: Response) {
    try {
        const { shiftId } = req.params;
        const dryRun = req.query.dryRun === "true";
        const result = await service.fixSingleShift(shiftId, dryRun);
        res.json(result);
    } catch (error: any) {
        console.error("Erro ao corrigir turno:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function fixRideCounts(req: Request, res: Response) {
    try {
        const dryRun = req.query.dryRun === "true";
        const result = await service.fixRideCounts(dryRun);
        res.json(result);
    } catch (error: any) {
        console.error("Erro ao corrigir contagem:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function fixSingleRideCount(req: Request, res: Response) {
    try {
        const { shiftId } = req.params;
        const result = await service.fixSingleRideCount(shiftId);
        res.json(result);
    } catch (error: any) {
        console.error("Erro:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function getDebugData(req: Request, res: Response) {
    try {
        const result = await service.checkDebugData();
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function fixDbEmergency(req: Request, res: Response) {
    try {
        const result = await service.fixDbEmergency();
        res.send(result);
    } catch (error: any) {
        res.status(500).send("Error updating DB: " + error.message);
    }
}

export async function fixLegacyVisuals(req: Request, res: Response) {
    try {
        const { migrateCostTypesVisuals } = await import("../../scripts/db/migrate_cost_types_visuals.js");
        await migrateCostTypesVisuals();
        res.json({ success: true, message: "Migração visual executada com sucesso." });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
}
