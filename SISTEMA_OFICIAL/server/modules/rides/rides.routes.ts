import { Router } from "express";
import { getAllRidesController, createRideController, updateRideController, deleteRideController } from "./rides.controller.js";
import { requireAuth } from "../../core/middlewares/authMiddleware.js";
import { rideCreationLimiter } from "../../core/middlewares/rateLimiter.js";

const router = Router();

// Exige autenticação para ver corridas
router.use(requireAuth);

router.get("/", getAllRidesController);
router.post("/", rideCreationLimiter, createRideController);
router.put("/:id", updateRideController);
router.delete("/:id", deleteRideController);

export default router;
