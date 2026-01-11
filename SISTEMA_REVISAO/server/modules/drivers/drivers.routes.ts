import { Router } from "express";
import { driversController } from "./drivers.controller.js";
import { auditLog } from "../../core/middlewares/auditLogger.js";
import { requireAuth, requireAdmin } from "../../core/middlewares/authMiddleware.js";

const router = Router();

// 1. Exige login para qualquer rota
router.use(requireAuth);

// 2. Exige admin para listar todos e gerenciar (protege dados sensíveis e operações)
router.get("/", requireAdmin, driversController.getAll);
router.post("/", requireAdmin, driversController.create);
router.put("/:id", requireAdmin, driversController.update);
router.delete("/:id", requireAdmin, driversController.delete);
router.post("/:id/reset-password", requireAdmin, driversController.resetPassword);

export default router;
