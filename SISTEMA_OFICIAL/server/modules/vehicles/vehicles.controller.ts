import { Request, Response, NextFunction } from "express";
import { vehiclesService } from "./vehicles.service.js";
import { createVehicleSchema, updateVehicleSchema } from "./vehicles.validators.js";

/**
 * CONTROLLER - VEHICLES
 * 
 * REGRA: Controller é apenas ponte entre HTTP e Service
 * Recebe req/res, valida entrada, chama service, retorna resposta
 */

export const vehiclesController = {
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const vehicles = await vehiclesService.getAllVehicles();
            res.json(vehicles);
        } catch (error) {
            next(error);
        }
    },

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = createVehicleSchema.parse(req.body);
            // @ts-ignore - Tipo do Zod compatível com Drizzle, mas TS reclama de optional vs null
            const newVehicle = await vehiclesService.createVehicle(data);
            res.status(201).json(newVehicle);
        } catch (error) {
            next(error);
        }
    },

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const data = updateVehicleSchema.parse(req.body);
            const updatedVehicle = await vehiclesService.updateVehicle(req.params.id, data);
            res.json(updatedVehicle);
        } catch (error) {
            next(error);
        }
    },

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            await vehiclesService.deleteVehicle(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
};
