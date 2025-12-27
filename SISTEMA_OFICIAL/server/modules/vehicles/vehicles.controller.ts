import { Request, Response, NextFunction } from "express";
import { vehiclesService } from "./vehicles.service.js";
import { createVehicleSchema, updateVehicleSchema } from "./vehicles.validators.js";
import { db } from "../../core/db/connection.js";
import { shifts } from "../../../shared/schema.js";
import { eq } from "drizzle-orm";

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

    async getWithStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const vehicles = await vehiclesService.getAllVehicles();

            const activeShifts = await db.query.shifts.findMany({
                where: eq(shifts.status, 'em_andamento')
            });

            const vehicleShiftMap = new Map<string, string>();
            for (const shift of activeShifts) {
                vehicleShiftMap.set(shift.vehicleId, shift.id);
            }

            const result = vehicles.map(v => ({
                ...v,
                currentShiftId: vehicleShiftMap.get(v.id) || null
            }));

            res.json(result);
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
