import { Router } from "express";
import { getAllRidesController, createRideController, updateRideController, deleteRideController } from "./rides.controller.js";
import { requireAuth, requireAdmin } from "../../core/middlewares/authMiddleware.js";
import { rideCreationLimiter } from "../../core/middlewares/rateLimiter.js";
import { auditLog } from "../../core/middlewares/auditLogger.js";
import { preventReplay } from "../../core/middlewares/idempotencyMiddleware.js";


const router = Router();

// Motorista pode listar e criar
router.get("/", requireAuth, getAllRidesController); // Listar é safe
router.post("/", requireAuth, rideCreationLimiter, preventReplay, createRideController); // Crítico

// Apenas ADMIN pode editar ou excluir
router.put("/:id", requireAuth, requireAdmin, updateRideController);
router.delete("/:id", requireAuth, requireAdmin, deleteRideController);

export default router;
