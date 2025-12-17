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
    }
};
