import { Router } from "express";
import { getAllRidesController, createRideController, updateRideController, deleteRideController } from "./rides.controller.js";
import { requireAuth } from "../../core/middlewares/authMiddleware.js";
import { rideCreationLimiter } from "../../core/middlewares/rateLimiter.js";

const router = Router();

// Exige autenticação para ver corridas
router.use(requireAuth);

router.get("/", getAllRidesController);
router.post("/", rideCreationLimiter, createRideController);

// Edição e Exclusão -> APENAS ADMIN
import { requireAdmin } from "../../core/middlewares/authMiddleware.js";
router.put("/:id", requireAdmin, updateRideController);
router.delete("/:id", requireAdmin, deleteRideController);

export default router;
