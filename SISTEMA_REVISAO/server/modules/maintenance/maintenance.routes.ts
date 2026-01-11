
import { Router } from "express";
import * as controller from "./maintenance.controller.js";
import { auditLog } from "../../core/middlewares/auditLogger.js";
import { requireAuth, requireAdmin } from "../../core/middlewares/authMiddleware.js";

const router = Router();

router.use(requireAuth);

// Dashboard completo
router.get("/dashboard", controller.getDashboard);
router.get("/alert-count", controller.getAlertCount);
router.post("/fix-db-data", requireAdmin, auditLog('FIX_MAINTENANCE_DB'), controller.fixDbData);

// Ação de registrar manutenção (apenas admin)
router.post("/perform", requireAdmin, auditLog('PERFORM_MAINTENANCE'), controller.performMaintenance);

export default router;
