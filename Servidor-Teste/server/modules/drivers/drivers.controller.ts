
import { Request, Response } from "express";
import * as driversService from "./drivers.service.js";

export async function getAllDriversController(req: Request, res: Response) {
    try {
        const drivers = await driversService.getAllDrivers();
        res.json(drivers);
    } catch (error) {
        console.error("Erro ao buscar motoristas:", error);
        res.status(500).json({ error: "Erro interno ao buscar motoristas" });
    }
}
