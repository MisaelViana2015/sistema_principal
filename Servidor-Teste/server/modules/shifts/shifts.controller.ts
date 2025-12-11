import { Request, Response } from "express";
import * as shiftsService from "./shifts.service";

export async function getAllShiftsController(req: Request, res: Response) {
    try {
        const shifts = await shiftsService.getAllShifts();
        return res.json(shifts);
    } catch (error) {
        console.error("Error getting shifts:", error);
        return res.status(500).json({ message: "Erro ao buscar turnos" });
    }
}
