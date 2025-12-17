import { Request, Response } from "express";
import * as shiftsService from "./shifts.service.js";

export async function getAllShiftsController(req: Request, res: Response) {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 50;

        const filters = {
            driverId: req.query.driverId as string,
            vehicleId: req.query.vehicleId as string,
            status: req.query.status as string,
            startDate: req.query.startDate as string,
            endDate: req.query.endDate as string,
        };

        const result = await shiftsService.getAllShifts(page, limit, filters);
        return res.json(result);
    } catch (error) {
        console.error("Error getting shifts:", error);
        return res.status(500).json({ message: "Erro ao buscar turnos" });
    }
}


export async function startShiftController(req: Request, res: Response) {
    try {
        const { vehicleId, kmInicial } = req.body;
        // Assuming user ID comes from authenticated request (req.user.id)
        // For now, we might need to pass driverId in body or headers if not fully integrated
        // But the prompt context showed AuthContext used in frontend, so backend likely has auth middleware.
        // However, the current controller doesn't seem to use `req.user`.
        // To be safe and consistent with the mock frontend that might send driverId, let's check body first.
        const driverId = req.body.driverId || (req as any).user?.userId;

        if (!driverId) return res.status(400).json({ message: "Motorista não identificado" });
        if (!vehicleId) return res.status(400).json({ message: "Veículo obrigatório" });
        if (!kmInicial) return res.status(400).json({ message: "KM Inicial obrigatório" });

        const shift = await shiftsService.startShift(driverId, vehicleId, Number(kmInicial));
        return res.status(201).json(shift);
    } catch (error: any) {
        return res.status(400).json({ message: error.message || "Erro ao iniciar turno" });
    }
}

export async function finishShiftController(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { kmFinal } = req.body;

        if (!kmFinal) return res.status(400).json({ message: "KM Final obrigatório" });

        const shift = await shiftsService.finishShift(id, Number(kmFinal));
        return res.json(shift);
    } catch (error: any) {
        return res.status(400).json({ message: error.message || "Erro ao finalizar turno" });
    }
}

export async function getOpenShiftController(req: Request, res: Response) {
    try {
        const driverId = req.query.driverId as string || (req as any).user?.userId;
        if (!driverId) return res.status(400).json({ message: "Motorista não identificado" });

        const shift = await shiftsService.getOpenShift(driverId);
        return res.json(shift || null);
    } catch (error) {
        console.error("Error getting open shift:", error);
        return res.status(500).json({ message: "Erro ao buscar turno aberto" });
    }
}

export const shiftsController = {
    getAll: getAllShiftsController,
    start: startShiftController,
    finish: finishShiftController,
    getOpen: getOpenShiftController
};
