import { Request, Response } from "express";
import * as driversService from "./drivers.service.js";

export const driversController = {
    async getAll(req: Request, res: Response) {
        try {
            const drivers = await driversService.getAllDrivers();
            res.json(drivers);
        } catch (error) {
            console.error("Error fetching drivers:", error);
            res.status(500).json({ error: "Internal error fetching drivers" });
        }
    },

    async create(req: Request, res: Response) {
        try {
            const data = req.body;
            // Validações básicas
            if (!data.nome || !data.email || !data.senha) {
                return res.status(400).json({ error: "Campos obrigatórios: nome, email, senha" });
            }

            const newDriver = await driversService.createDriver(data);
            res.status(201).json(newDriver);
        } catch (error: any) {
            console.error("Error creating driver:", error);
            res.status(400).json({ error: error.message });
        }
    },

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const data = req.body;
            const updatedDriver = await driversService.updateDriver(id, data);
            res.json(updatedDriver);
        } catch (error: any) {
            console.error("Error updating driver:", error);
            res.status(400).json({ error: error.message });
        }
    },

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await driversService.deleteDriver(id);
            res.json({ success: true });
        } catch (error: any) {
            console.error("Error deleting driver:", error);
            res.status(500).json({ error: error.message });
        }
    }
};
