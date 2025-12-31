
import { Router } from "express";
import * as controller from "./maintenance.controller.js";
import { requireAuth, requireAdmin } from "../../core/middlewares/authMiddleware.js";

const router = Router();

router.use(requireAuth);

// Dashboard completo
router.get("/dashboard", controller.getDashboard);

// Ação de registrar manutenção (apenas admin)
router.post("/perform", requireAdmin, controller.performMaintenance);

export default router;
