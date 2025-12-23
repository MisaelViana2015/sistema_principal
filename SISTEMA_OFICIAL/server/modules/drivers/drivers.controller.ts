import { Request, Response } from "express";
import * as driversService from "./drivers.service.js";
import { createDriverSchema, updateDriverSchema } from "./drivers.validators.js";

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
            const data = createDriverSchema.parse(req.body); // Validate

            // Map keys
            const newDriver = await driversService.createDriver({
                nome: data.name,
                email: data.email,
                senha: data.password,
                telefone: data.phone || null,
                role: data.role
            });

            res.status(201).json(newDriver);
        } catch (error: any) {
            console.error("Error creating driver:", error);
            if (error.issues) { // Zod error
                return res.status(400).json({ error: "Validation error", details: error.issues });
            }
            res.status(400).json({ error: error.message });
        }
    },

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const data = updateDriverSchema.parse(req.body); // Validate

            // Map keys partial
            const updateData: any = {};
            if (data.name) updateData.nome = data.name;
            // email update not allowed by schema
            if (data.password) updateData.senha = data.password;
            if (data.phone) updateData.telefone = data.phone;
            if (data.role) updateData.role = data.role;

            const updatedDriver = await driversService.updateDriver(id, updateData);
            res.json(updatedDriver);
        } catch (error: any) {
            console.error("Error updating driver:", error);
            if (error.issues) {
                return res.status(400).json({ error: "Validation error", details: error.issues });
            }
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
