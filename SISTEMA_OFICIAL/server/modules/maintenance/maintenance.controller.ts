
import { Request, Response } from "express";
import { maintenanceService } from "./maintenance.service.js";

export async function getDashboard(req: Request, res: Response) {
    try {
        const data = await maintenanceService.getFleetDashboard();
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function performMaintenance(req: Request, res: Response) {
    try {
        const { vehicleId, configId, currentKm, date } = req.body;
        await maintenanceService.performMaintenance(vehicleId, configId, Number(currentKm), new Date(date));
        res.json({ success: true, message: "Manutenção registrada com sucesso!" });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
}
