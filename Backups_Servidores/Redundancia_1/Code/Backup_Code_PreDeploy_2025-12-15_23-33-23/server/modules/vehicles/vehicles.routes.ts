import { Router } from "express";
import { vehiclesController } from "./vehicles.controller.js";
import { requireAuth, requireAdmin } from "../../core/middlewares/authMiddleware.js";

const router = Router();

// 1. Exige login para qualquer rota
router.use(requireAuth);

// 2. Exige admin para listar todos
router.get("/", requireAdmin, vehiclesController.getAll);

// 3. Exige admin para criar novos
router.post("/", requireAdmin, vehiclesController.create);

// 4. Exige admin para editar e excluir
router.put("/:id", requireAdmin, vehiclesController.update);
router.delete("/:id", requireAdmin, vehiclesController.delete);

export default router;
