
import { Router } from "express";
import * as tiresController from "./tires.controller.js";

import { requireAuth, requireAdmin } from "../../core/middlewares/authMiddleware.js";

const router = Router();

// 🔒 PROTEGER TODAS AS ROTAS DE PNEUS
router.use(requireAuth, requireAdmin);

router.post("/", tiresController.createTire);
router.get("/", tiresController.getAllTires);
router.delete("/:id", tiresController.deleteTire);

export default router;
