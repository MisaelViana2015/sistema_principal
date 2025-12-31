import { Router } from "express";
import { getAllRidesController, createRideController, updateRideController, deleteRideController } from "./rides.controller.js";
import { requireAuth, requireAdmin } from "../../core/middlewares/authMiddleware.js";
import { rideCreationLimiter } from "../../core/middlewares/rateLimiter.js";
import { auditLog } from "../../core/middlewares/auditLogger.js";
import { preventReplay } from "../../core/middlewares/idempotencyMiddleware.js";


const router = Router();

// Motorista pode listar e criar
router.get("/", requireAuth, getAllRidesController); // Listar é safe
router.post("/", requireAuth, rideCreationLimiter, auditLog('CREATE_RIDE'), preventReplay, createRideController); // Crítico

// Apenas ADMIN pode editar ou excluir
router.put("/:id", requireAuth, requireAdmin, auditLog('UPDATE_RIDE'), updateRideController);
router.delete("/:id", requireAuth, requireAdmin, auditLog('DELETE_RIDE'), deleteRideController);

export default router;
