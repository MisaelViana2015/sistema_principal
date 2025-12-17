
import { Request, Response } from "express";
import * as ridesService from "./rides.service.js";

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
        const { shiftId, tipo, valor, hora } = req.body;

        if (!shiftId || !tipo || !valor) {
            return res.status(400).json({ message: "Dados incompletos (shiftId, tipo, valor)" });
        }

        const newRide = await ridesService.createRide({
            shiftId,
            tipo, // 'APP' | 'PARTICULAR'
            valor: String(valor), // Ensure it's string for numeric/decimal field if needed, or number if schema allows. Schema says numeric -> string/number.
            hora: hora ? new Date(hora) : new Date()
        });

        return res.status(201).json(newRide);
    } catch (error) {
        console.error("Erro ao criar corrida:", error);
        return res.status(500).json({ message: "Erro ao registrar corrida" });
    }

}

export async function updateRideController(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const data = req.body;

        if (data.hora) data.hora = new Date(data.hora);

        const updated = await ridesService.updateRide(id, data);
        return res.json(updated);
    } catch (error: any) {
        console.error("Erro ao atualizar corrida:", error);
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
