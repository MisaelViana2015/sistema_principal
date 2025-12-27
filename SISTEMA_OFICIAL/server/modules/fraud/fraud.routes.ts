import { Router } from "express";
import { FraudController } from "./fraud.controller.js";

const router = Router();

// Todas as rotas de fraude exigem autenticação e nível ADMIN
import { requireAuth, requireAdmin } from "../../core/middlewares/authMiddleware.js";
router.use(requireAuth, requireAdmin);

// Dashboard Data
router.get("/dashboard-stats", FraudController.getDashboardStats);
router.get("/heatmap", FraudController.getHeatmapData);
router.get("/alerts", FraudController.getRecentAlerts);
router.get("/stats/top-drivers", FraudController.getTopDrivers);
router.get("/events", FraudController.getEventsList);

// Actions
router.post("/seed", FraudController.seedData);
router.post("/analyze/:shiftId", FraudController.manualAnalyze);
router.post("/analyze-all", FraudController.analyzeAllShifts);
router.get("/preview/:shiftId", FraudController.previewAnalysis);
router.get("/event/:id", FraudController.getEventDetail);
router.post("/event/:id/status", FraudController.updateEventStatus);
router.get("/event/:id/pdf", FraudController.getEventPdf);

export const fraudRoutes = router;
