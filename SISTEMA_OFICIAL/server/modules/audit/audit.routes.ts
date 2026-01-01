import { Router } from "express";
import { auditController } from "./audit.controller.js";
import { requireAuth } from "../../core/middlewares/authMiddleware.js";

const router = Router();

// Todas as rotas de auditoria requerem autenticação
router.use(requireAuth);

// Middleware para verificar role admin ou supervisor
router.use((req, res, next) => {
    const user = (req as any).user;
    if (!user || !['admin', 'supervisor'].includes(user.role)) {
        return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
    }
    next();
});

router.get("/logs", auditController.getLogs);
router.get("/history/:entity/:entityId", auditController.getEntityHistory);
router.get("/stats", auditController.getStats);

export default router;
