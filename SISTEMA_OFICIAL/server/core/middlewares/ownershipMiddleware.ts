import { Request, Response, NextFunction } from "express";
import * as shiftsService from "../../modules/shifts/shifts.service.js";

/**
 * Middleware para garantir que o usuário só acesse seus próprios turnos
 * (A menos que seja admin)
 * 
 * 📌 NOTA ARQUITETURAL:
 * Este middleware NÃO substitui a validação de existência do recurso.
 * Se `shiftId` não for fornecido, o middleware passa adiante.
 * Controllers DEVEM validar a presença e existência do recurso obrigatoriamente.
 */
export async function requireShiftOwner(req: Request, res: Response, next: NextFunction) {
    try {
        const user = (req as any).user;

        // Admin pode tudo
        if (user.role === 'admin') return next();

        // Tenta pegar shiftId de params ou body
        const shiftId = req.params.id || req.body.shiftId;

        // Se não tem ID, deixa o controller lidar (ou validar depois)
        if (!shiftId) return next();

        const shift = await shiftsService.getShiftById(shiftId);

        // Se turno não existe, deixa controller tratar 404
        if (!shift) return next();

        if (shift.driverId !== user.userId) {
            return res.status(403).json({ error: "Este turno não pertence a você." });
        }

        next();
    } catch (error) {
        // Em caso de erro (ex: ID inválido), loga e deixa passar pro controller tratar
        console.error("Erro no middleware requireShiftOwner:", error);
        next();
    }
}
