
import { Router } from "express";
import { getAllRidesController, createRideController } from "./rides.controller.js";
import { requireAuth } from "../../core/middlewares/authMiddleware.js";

const router = Router();

// Exige autenticação para ver corridas
router.use(requireAuth);

router.get("/", getAllRidesController);
router.post("/", createRideController);

export default router;
