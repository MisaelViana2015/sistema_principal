import { Router } from "express";
import { vehiclesController } from "./vehicles.controller.js";
import { auditLog } from "../../core/middlewares/auditLogger.js";
import { requireAuth, requireAdmin } from "../../core/middlewares/authMiddleware.js";

const router = Router();

// 1. Exige login para qualquer rota
router.use(requireAuth);

// 2. Listar todos - Permitido para todos os usuários autenticados (motoristas precisam ver a garagem)
router.get("/with-status", vehiclesController.getWithStatus);
router.get("/", vehiclesController.getAll);

// 3. Exige admin para criar novos
router.post("/", requireAdmin, auditLog('CREATE_VEHICLE'), vehiclesController.create);

// 4. Exige admin para editar e excluir
router.put("/:id", requireAdmin, auditLog('UPDATE_VEHICLE'), vehiclesController.update);
router.delete("/:id", requireAdmin, auditLog('DELETE_VEHICLE'), vehiclesController.delete);

export default router;
