import { Request, Response } from "express";
import * as tiresService from "./tires.service.js";
import { insertTireSchema } from "../../../shared/schema.js";
import { z } from "zod";

export const createTire = async (req: Request, res: Response) => {
    try {
        // Estender schema para converter string -> date e string -> number
        const createTireSchema = insertTireSchema.extend({
            installDate: z.coerce.date(),
            installKm: z.coerce.number().max(2000000000, "Valor de KM muito alto (máx 2 bilhões)")
        });

        const tireData = createTireSchema.parse(req.body);
        const newTire = await tiresService.create(tireData, req.auditContext);
        res.status(201).json(newTire);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        } else {
            console.error("Error creating tire:", error);
            // DEBUG: Retornando erro detalhado para identificar causa (tabela inexistente, FK, etc)
            res.status(500).json({
                message: "Internal server error",
                details: error instanceof Error ? error.message : String(error)
            });
        }
    }
};

export const getAllTires = async (_req: Request, res: Response) => {
    try {
        const tires = await tiresService.getAll();
        res.json(tires);
    } catch (error) {
        console.error("Error fetching tires:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteTire = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await tiresService.remove(id, req.auditContext);
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting tire:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
