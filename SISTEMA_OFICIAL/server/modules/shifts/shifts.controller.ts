import { Request, Response } from "express";
import * as shiftsService from "./shifts.service.js";
import { startShiftSchema, finishShiftSchema, updateShiftSchema } from "./shifts.validators.js";

export async function getAllShiftsController(req: Request, res: Response) {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: "Usuário não autenticado" });

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 50;

        let driverIdFilter = req.query.driverId as string;

        // Regra de Segurança: Se não for ADMIN, força filtrar pelos próprios turnos
        if (user.role !== 'admin') {
            driverIdFilter = user.userId;
        }

        const filters = {
            driverId: driverIdFilter,
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

export async function getShiftByIdController(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const shift = await shiftsService.getShiftById(id);
        if (!shift) return res.status(404).json({ message: "Turno não encontrado" });
        return res.json(shift);
    } catch (error) {
        console.error("Error getting shift by id:", error);
        return res.status(500).json({ message: "Erro ao buscar turno" });
    }
}


export async function startShiftController(req: Request, res: Response) {
    try {
        const driverId = req.body.driverId || (req as any).user?.userId;
        const data = { ...req.body, driverId }; // Merge driverId

        const validatedData = startShiftSchema.parse(data);

        const shift = await shiftsService.startShift(validatedData.driverId!, validatedData.vehicleId, validatedData.kmInicial);
        return res.status(201).json(shift);
    } catch (error: any) {
        if (error.issues) return res.status(400).json({ message: "Validation error", details: error.issues });
        return res.status(400).json({ message: error.message || "Erro ao iniciar turno" });
    }
}

export async function finishShiftController(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const validatedData = finishShiftSchema.parse(req.body);

        const shift = await shiftsService.finishShift(id, validatedData.kmFinal);
        return res.json(shift);
    } catch (error: any) {
        if (error.issues) return res.status(400).json({ message: "Validation error", details: error.issues });
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

export async function deleteShiftController(req: Request, res: Response) {
    try {
        const { id } = req.params;
        await shiftsService.deleteShift(id);
        return res.json({ message: "Turno excluído com sucesso" });
    } catch (error) {
        console.error("Error deleting shift:", error);
        return res.status(500).json({ message: "Erro ao excluir turno" });
    }
}

// Add update controller
export async function updateShiftController(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const validatedData = updateShiftSchema.parse(req.body);
        const updated = await shiftsService.updateShift(id, validatedData);
        return res.json(updated);
    } catch (error: any) {
        console.error("Error updating shift:", error);
        if (error.issues) return res.status(400).json({ message: "Validation error", details: error.issues });
        return res.status(500).json({ message: "Erro ao atualizar turno" });
    }
}

export const shiftsController = {
    getAll: getAllShiftsController,
    getById: getShiftByIdController,
    start: startShiftController,
    finish: finishShiftController,
    getOpen: getOpenShiftController,
    update: updateShiftController,
    delete: deleteShiftController
};
