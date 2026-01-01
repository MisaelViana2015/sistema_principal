import { Router } from "express";
import { shiftsController } from "./shifts.controller.js";
import { requireAuth, requireAdmin } from "../../core/middlewares/authMiddleware.js";
import { auditLog } from "../../core/middlewares/auditLogger.js";
import { requireShiftOwner } from "../../core/middlewares/ownershipMiddleware.js";


const router = Router();

// Exige autenticação para gerenciar turnos
router.use(requireAuth);

// Listar turnos (controle de permissão dentro do controller)
router.get("/", shiftsController.getAll);

// Turno atual (o próprio) -> Qualquer logado
router.get("/current", shiftsController.getOpen);

// Get by ID
router.get("/:id", requireShiftOwner, shiftsController.getById);

// Ações operacionais -> Qualquer logado
router.post("/", auditLog('START_SHIFT'), shiftsController.start);
router.post("/:id/finish", auditLog('FINISH_SHIFT'), shiftsController.finish);

// Encerrar turno manualmente (Admin Manutenção)
router.post("/:id/close", requireAdmin, auditLog('ADMIN_CLOSE_SHIFT'), shiftsController.adminClose);

// Apenas ADMIN pode editar ou excluir turnos
router.patch("/:id", requireAdmin, auditLog('UPDATE_SHIFT'), shiftsController.update);
router.delete("/:id", requireAdmin, shiftsController.delete);

export default router;
