
import { Request, Response } from "express";
import * as service from "./fraud.service.js";

export async function getEvents(req: Request, res: Response) {
    try {
        const events = await service.getAllEvents();
        res.json(events);
    } catch (error) {
        console.error("Erro ao buscar eventos de fraude:", error);
        res.status(500).json({ error: "Erro interno ao buscar eventos" });
    }
}

export async function getDashboardStats(req: Request, res: Response) {
    try {
        const stats = await service.getStats();
        res.json(stats);
    } catch (error) {
        console.error("Erro ao buscar estatísticas de fraude:", error);
        res.status(500).json({ error: "Erro interno ao buscar estatísticas" });
    }
}

export async function getRanking(req: Request, res: Response) {
    try {
        const ranking = await service.getRanking();
        res.json(ranking);
    } catch (error) {
        console.error("Erro ao buscar ranking de risco:", error);
        res.status(500).json({ error: "Erro interno ao buscar ranking" });
    }
}
