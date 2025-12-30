import { Router } from "express";
import { shiftsController } from "./shifts.controller.js";
import { requireAuth, requireAdmin } from "../../core/middlewares/authMiddleware.js";

const router = Router();

// Exige autenticação para gerenciar turnos
router.use(requireAuth);

// Listar turnos (controle de permissão dentro do controller)
router.get("/", shiftsController.getAll);

// Turno atual (o próprio) -> Qualquer logado
router.get("/current", shiftsController.getOpen);

// Get by ID
router.get("/:id", shiftsController.getById);

// Ações operacionais -> Qualquer logado
router.post("/", shiftsController.start);
router.post("/:id/finish", shiftsController.finish);

// Edição e Exclusão -> APENAS ADMIN
router.patch("/:id", requireAdmin, shiftsController.update);
router.delete("/:id", requireAdmin, shiftsController.delete);

export default router;
