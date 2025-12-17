import { Request, Response } from "express";
import { vehiclesService } from "./vehicles.service.js";

export const vehiclesController = {
    async getAll(req: Request, res: Response) {
        try {
            const vehicles = await vehiclesService.getAllVehicles();
            res.json(vehicles);
        } catch (error) {
            console.error("Error fetching vehicles:", error);
            res.status(500).json({ message: "Internal error fetching vehicles" });
        }
    },

    async create(req: Request, res: Response) {
        try {
            const newVehicle = await vehiclesService.createVehicle(req.body);
            res.status(201).json(newVehicle);
        } catch (error) {
            console.error("Error creating vehicle:", error);
            res.status(500).json({ message: "Internal error creating vehicle" });
        }
    },

    async update(req: Request, res: Response) {
        try {
            const updatedVehicle = await vehiclesService.updateVehicle(req.params.id, req.body);
            res.json(updatedVehicle);
        } catch (error) {
            console.error("Error updating vehicle:", error);
            res.status(500).json({ message: "Internal error updating vehicle" });
        }
    },

    async delete(req: Request, res: Response) {
        try {
            await vehiclesService.deleteVehicle(req.params.id);
            res.status(204).send();
        } catch (error) {
            console.error("Error deleting vehicle:", error);
            res.status(500).json({ message: "Internal error deleting vehicle" });
        }
    }
};
