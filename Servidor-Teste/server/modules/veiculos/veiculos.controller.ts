
import { Request, Response } from "express";
import { veiculosService } from "./veiculos.service.js";

export const veiculosController = {
    async getAll(req: Request, res: Response) {
        try {
            const veiculos = await veiculosService.getAllVeiculos();
            res.json(veiculos);
        } catch (error) {
            console.error("Erro ao buscar veículos:", error);
            res.status(500).json({ message: "Erro interno ao buscar veículos" });
        }
    }
};
