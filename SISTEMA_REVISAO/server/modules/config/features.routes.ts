import { Router } from "express";
import { requireAuth } from "../../core/middlewares/authMiddleware.js";

/**
 * CONFIGURAÇÃO DE FEATURE FLAGS
 *
 * Permite ligar/desligar módulos por Role sem deploy.
 */

const FEATURES = {
    financial_module: {
        enabled: true,
        roles: ["admin"],
        description: "Acesso ao módulo financeiro completo"
    },
    performance_module: {
        enabled: true,
        roles: ["admin", "supervisor"],
        description: "Relatórios de desempenho e métricas"
    },
    maintenance_module: {
        enabled: true, // Pode ser desligado rapidamente aqui
        roles: ["admin", "supervisor", "driver"],
        description: "Registro de manutenção e checklist"
    }
};

const router = Router();

/**
 * GET /api/config/features
 * Retorna flags ativas para o usuário logado
 */
router.get("/", requireAuth, (req, res) => {
    // Retorna a configuração completa para o frontend decidir
    // Ou poderia filtrar aqui se quisesse esconder o que está disabled
    res.json({
        success: true,
        data: FEATURES
    });
});

export default router;
