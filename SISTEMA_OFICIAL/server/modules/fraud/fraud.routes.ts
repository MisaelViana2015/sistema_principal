import { Router } from "express";
import { FraudController } from "./fraud.controller";

const router = Router();

// Dashboard Data
router.get("/dashboard-stats", FraudController.getDashboardStats);
router.get("/heatmap", FraudController.getHeatmapData);
router.get("/alerts", FraudController.getRecentAlerts);

// Actions
router.post("/analyze/:shiftId", FraudController.manualAnalyze);

export const fraudRoutes = router;
