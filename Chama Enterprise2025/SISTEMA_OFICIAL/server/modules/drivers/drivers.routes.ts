import { Router } from "express";
import { driversController } from "./drivers.controller.js";
import { requireAuth, requireAdmin } from "../../core/middlewares/authMiddleware.js";

const router = Router();

// 1. Exige login para qualquer rota
router.use(requireAuth);

// 2. Exige admin para listar todos e gerenciar (protege dados sensíveis e operações)
router.get("/", requireAdmin, driversController.getAll);
router.post("/", requireAdmin, driversController.create);
router.put("/:id", requireAdmin, driversController.update);
router.delete("/:id", requireAdmin, driversController.delete);

export default router;
