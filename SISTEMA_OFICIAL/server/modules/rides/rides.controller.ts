
import { Request, Response } from "express";
import * as ridesService from "./rides.service.js";
import * as shiftsService from "../shifts/shifts.service.js";

import { createRideSchema, updateRideSchema } from "./rides.validators.js";

export async function getAllRidesController(req: Request, res: Response) {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const filters = {
            driverId: req.query.driverId as string,
            vehicleId: req.query.vehicleId as string,
            shiftId: req.query.shiftId as string,
            startDate: req.query.startDate as string,
            endDate: req.query.endDate as string,
        };

        const result = await ridesService.getAllRides(page, limit, filters);
        res.json(result);
    } catch (error) {
        console.error("Erro ao buscar corridas:", error);
        res.status(500).json({ error: "Erro interno ao buscar corridas" });
    }
}

export async function createRideController(req: Request, res: Response) {
    try {
        const user = (req as any).user;
        const validatedData = createRideSchema.parse(req.body);

        // Security: Check if shift belongs to the user
        const shift = await shiftsService.getShiftById(validatedData.shiftId);
        if (!shift) return res.status(404).json({ message: "Turno não encontrado" });

        if (user.role !== 'admin' && shift.driverId !== user.userId) {
            return res.status(403).json({ message: "Este turno não pertence a você." });
        }

        const newRide = await ridesService.createRide({
            shiftId: validatedData.shiftId,
            tipo: validatedData.tipo,
            valor: validatedData.valor,
            hora: validatedData.hora
        });

        return res.status(201).json(newRide);
    } catch (error: any) {
        console.error("Erro ao criar corrida:", error);
        if (error.issues) return res.status(400).json({ message: "Validation error", details: error.issues });
        return res.status(400).json({ message: error.message || "Erro ao registrar corrida" });
    }
}

export async function updateRideController(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const validatedData = updateRideSchema.parse(req.body);

        const updated = await ridesService.updateRide(id, validatedData);
        return res.json(updated);
    } catch (error: any) {
        console.error("Erro ao atualizar corrida:", error);
        if (error.issues) return res.status(400).json({ message: "Validation error", details: error.issues });
        return res.status(500).json({ message: error.message || "Erro ao atualizar corrida" });
    }
}

export async function deleteRideController(req: Request, res: Response) {
    try {
        const { id } = req.params;
        await ridesService.deleteRide(id);
        return res.json({ success: true, message: "Corrida excluída com sucesso" });
    } catch (error: any) {
        console.error("Erro ao excluir corrida:", error);
        return res.status(500).json({ message: error.message || "Erro ao excluir corrida" });
    }
}
