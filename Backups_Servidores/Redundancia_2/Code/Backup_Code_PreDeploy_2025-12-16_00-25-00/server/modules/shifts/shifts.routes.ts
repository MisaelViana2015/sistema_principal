import { Router } from "express";
import { shiftsController } from "./shifts.controller.js";
import { requireAuth, requireAdmin } from "../../core/middlewares/authMiddleware.js";

const router = Router();

// Exige autenticação para gerenciar turnos
router.use(requireAuth);

// Listar TODOS os turnos (histórico geral) -> Apenas Admin
router.get("/", requireAdmin, shiftsController.getAll);

// Turno atual (o próprio) -> Qualquer logado
router.get("/current", shiftsController.getOpen);

// Ações operacionais -> Qualquer logado
router.post("/", shiftsController.start);
router.post("/:id/finish", shiftsController.finish);

export default router;
