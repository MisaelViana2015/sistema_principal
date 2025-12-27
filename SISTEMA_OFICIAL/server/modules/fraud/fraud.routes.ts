import { Router } from "express";
import { FraudController } from "./fraud.controller.js";

const router = Router();

// Dashboard Data
router.get("/dashboard-stats", FraudController.getDashboardStats);
router.get("/heatmap", FraudController.getHeatmapData);
router.get("/alerts", FraudController.getRecentAlerts);

// Actions
// Actions
router.post("/seed", FraudController.seedData);
router.post("/analyze/:shiftId", FraudController.manualAnalyze);
router.post("/analyze-all", FraudController.analyzeAllShifts);
router.get("/preview/:shiftId", FraudController.previewAnalysis);
router.get("/event/:id", FraudController.getEventDetail);
router.post("/event/:id/status", FraudController.updateEventStatus);
router.get("/event/:id/pdf", FraudController.getEventPdf);

export const fraudRoutes = router;
