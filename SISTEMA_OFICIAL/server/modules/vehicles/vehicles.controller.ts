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
            // Map keys
            const newVehicle = await vehiclesService.createVehicle({
                plate: data.placa,
                modelo: data.modelo,
                kmInicial: data.kmInicial,
                motoristaPadraoId: data.motoristaPadraoId,
                color: data.color,
                imageUrl: data.imageUrl,
                isActive: data.isActive,
                status: data.status
            }, req.auditContext);
            res.status(201).json(newVehicle);
        } catch (error) {
            next(error);
        }
    },

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const data = updateVehicleSchema.parse(req.body);
            // Map keys from Portuguese (validator) to English (database schema)
            const mappedData: Record<string, any> = {};
            if (data.placa !== undefined) mappedData.plate = data.placa;
            if (data.modelo !== undefined) mappedData.modelo = data.modelo;
            if (data.kmInicial !== undefined) mappedData.kmInicial = data.kmInicial;
            if (data.motoristaPadraoId !== undefined) mappedData.motoristaPadraoId = data.motoristaPadraoId;
            if (data.color !== undefined) mappedData.color = data.color;
            if (data.imageUrl !== undefined) mappedData.imageUrl = data.imageUrl;
            if (data.isActive !== undefined) mappedData.isActive = data.isActive;
            if (data.status !== undefined) mappedData.status = data.status;

            const updatedVehicle = await vehiclesService.updateVehicle(req.params.id, mappedData, req.auditContext);
            res.json(updatedVehicle);
        } catch (error) {
            next(error);
        }
    },

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            await vehiclesService.deleteVehicle(req.params.id, req.auditContext);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
};
