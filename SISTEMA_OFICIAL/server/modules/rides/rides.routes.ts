import { Router } from "express";
import { getAllRidesController, createRideController, updateRideController, deleteRideController } from "./rides.controller.js";
import { requireAuth, requireAdmin } from "../../core/middlewares/authMiddleware.js";
import { rideCreationLimiter } from "../../core/middlewares/rateLimiter.js";

const router = Router();

// Exige autenticação para todas as rotas
router.use(requireAuth);

// Motorista pode listar e criar
router.get("/", getAllRidesController);
router.post("/", rideCreationLimiter, createRideController);

// Apenas ADMIN pode editar ou excluir
router.put("/:id", requireAdmin, updateRideController);
router.delete("/:id", requireAdmin, deleteRideController);

export default router;
