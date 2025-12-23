
import { Request, Response } from "express";
import * as service from "./financial.service.js";

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
        const { name, value, frequency, dueDay } = req.body;
        if (!name || !value) return res.status(400).json({ error: "Nome e Valor são obrigatórios" });

        const newCost = await service.createFixedCost({
            name,
            value: String(value),
            frequency: frequency || 'Mensal',
            dueDay: dueDay || 5
        });
        res.status(201).json(newCost);
    } catch (error) {
        console.error("Erro ao criar custo fixo:", error);
        res.status(500).json({ error: "Erro interno" });
    }
}

export async function updateFixedCost(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const data = req.body;
        if (data.value) data.value = String(data.value);

        const updated = await service.updateFixedCost(id, data);
        res.json(updated);
    } catch (error) {
        console.error("Erro ao atualizar custo fixo:", error);
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
        const data = req.body;
        const updated = await service.updateFixedCostInstallment(id, data);
        res.json(updated);
    } catch (error) {
        console.error("Erro ao atualizar parcela:", error);
        res.status(500).json({ error: "Erro interno" });
    }
}

export async function createExpense(req: Request, res: Response) {
    try {
        const { driverId, shiftId, costTypeId, value, date, notes, isParticular } = req.body;

        if (!costTypeId || !value || !date) {
            return res.status(400).json({ message: "Dados incompletos (costTypeId, value, date)" });
        }

        const newExpense = await service.createExpense({
            driverId: driverId || (req as any).user?.userId, // Allow explicit or implicit
            shiftId,
            costTypeId,
            value: String(value),
            date: new Date(date),
            notes,
            isParticular: Boolean(isParticular),
        });

        res.status(201).json(newExpense);
    } catch (error) {
        console.error("Erro ao criar despesa:", error);
        res.status(500).json({ error: "Erro interno ao criar despesa" });
    }
}

export async function updateExpenseController(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const data = req.body;

        if (data.date) data.date = new Date(data.date);
        if (data.value) data.value = String(data.value); // Ensure string format

        const updated = await service.updateExpense(id, data);
        res.json(updated);
    } catch (error: any) {
        console.error("Erro ao atualizar despesa:", error);
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
        const { name, category, description, icon, color } = req.body;
        if (!name) return res.status(400).json({ error: "Nome é obrigatório" });

        const newType = await service.createCostType({
            name,
            category: category || 'Variável',
            description: description || 'Padrão',
            icon: icon || 'dollar-sign',
            color: color || 'orange'
        });
        res.status(201).json(newType);
    } catch (error) {
        console.error("Erro ao criar tipo de custo:", error);
        res.status(500).json({ error: "Erro interno" });
    }
}

export async function updateCostType(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const data = req.body;
        const updated = await service.updateCostType(id, data);
        res.json(updated);
    } catch (error) {
        console.error("Erro ao atualizar tipo de custo:", error);
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
