
import { Request, Response } from "express";
import * as ridesService from "./rides.service.js";

export async function getAllRidesController(req: Request, res: Response) {
    try {
        const rides = await ridesService.getAllRides();
        res.json(rides);
    } catch (error) {
        console.error("Erro ao buscar corridas:", error);
        res.status(500).json({ error: "Erro interno ao buscar corridas" });
    }
}
