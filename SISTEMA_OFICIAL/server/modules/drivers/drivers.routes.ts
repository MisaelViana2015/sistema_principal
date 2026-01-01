import { Router } from "express";
import { driversController } from "./drivers.controller.js";
import { auditLog } from "../../core/middlewares/auditLogger.js";
import { requireAuth, requireAdmin } from "../../core/middlewares/authMiddleware.js";

const router = Router();

// 1. Exige login para qualquer rota
router.use(requireAuth);

// 2. Exige admin para listar todos e gerenciar (protege dados sensíveis e operações)
router.get("/", requireAdmin, driversController.getAll);
router.post("/", requireAdmin, auditLog('CREATE_DRIVER'), driversController.create);
router.put("/:id", requireAdmin, auditLog('UPDATE_DRIVER'), driversController.update);
router.delete("/:id", requireAdmin, auditLog('DELETE_DRIVER'), driversController.delete);
router.post("/:id/reset-password", requireAdmin, auditLog('RESET_DRIVER_PASSWORD'), driversController.resetPassword);

export default router;
