import { Router } from "express";
import { FraudController } from "./fraud.controller.js";

const router = Router();

// Dashboard Data
router.get("/dashboard-stats", FraudController.getDashboardStats);
router.get("/heatmap", FraudController.getHeatmapData);
router.get("/alerts", FraudController.getRecentAlerts);

// Actions
// Actions
router.post("/analyze/:shiftId", FraudController.manualAnalyze);
router.post("/analyze-all", FraudController.analyzeAllShifts);
router.get("/preview/:shiftId", FraudController.previewAnalysis);

export const fraudRoutes = router;
