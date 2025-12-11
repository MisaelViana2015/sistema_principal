
import { Request, Response } from "express";
import * as service from "./financial.service.js";

export async function getExpenses(req: Request, res: Response) {
    try {
        const expenses = await service.getAllExpenses();
        res.json(expenses);
    } catch (error) {
        console.error("Erro ao buscar despesas:", error);
        res.status(500).json({ error: "Erro interno ao buscar despesas" });
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
