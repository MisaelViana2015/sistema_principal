
import { Router } from "express";
import * as controller from "./financial.controller.js";
import { requireAuth, requireAdmin } from "../../core/middlewares/authMiddleware.js";

const router = Router();

// ========== AUTHENTICATED ROUTES ==========
// Todas as rotas abaixo exigem autenticação
router.use(requireAuth);

// DEBUG: Get database counts and recent data
router.get("/debug", requireAdmin, controller.getDebugData);

router.get("/expenses", requireAdmin, controller.getExpenses);
router.get("/legacy-maintenances", requireAdmin, controller.getLegacyMaintenances);
router.delete("/legacy-maintenances/:id", requireAdmin, controller.deleteLegacyMaintenance);
router.post("/legacy-maintenances", requireAdmin, controller.createLegacyMaintenance);

// Tires
router.get("/tires", requireAdmin, controller.getTires);
router.post("/tires", requireAdmin, controller.createTire);
router.delete("/tires/:id", requireAdmin, controller.deleteTire);
router.post("/expenses", controller.createExpense);
// Apenas ADMIN pode editar ou excluir despesas
router.put("/expenses/:id", requireAdmin, controller.updateExpenseController);
router.delete("/expenses/:id", requireAdmin, controller.deleteExpenseController);

// Cost Types
router.post("/cost-types/restore-defaults", requireAdmin, controller.restoreDefaultCostTypes);
router.get("/cost-types", controller.getCostTypes);
router.post("/cost-types", requireAdmin, controller.createCostType);
router.put("/cost-types/:id", requireAdmin, controller.updateCostType);
router.delete("/cost-types/:id", requireAdmin, controller.deleteCostType);

// Installments (Must be before /:id)
router.get("/fixed-costs/installments", requireAdmin, controller.getFixedCostInstallments);
router.put("/fixed-costs/installments/:id", requireAdmin, controller.updateFixedCostInstallment);

router.get("/fixed-costs", requireAdmin, controller.getFixedCosts);
router.post("/fixed-costs", requireAdmin, controller.createFixedCost);
router.put("/fixed-costs/:id", requireAdmin, controller.updateFixedCost);
router.delete("/fixed-costs/:id", requireAdmin, controller.deleteFixedCost);

// ⚠️ ROTAS DE MANUTENÇÃO / FIX (Desabilitadas em prod por padrão)
if (process.env.ENABLE_FIX_ROUTES === 'true') {
    // Rota de Emergência para corrigir Schema (executar uma vez e remover depois)
    router.get("/fix-db-emergency", requireAdmin, controller.fixDbEmergency);

    // Rota de Migração de Dados Legados (Preencher ícones/cores faltantes)
    router.post("/fix-legacy-visuals", requireAdmin, controller.fixLegacyVisuals);

    // DEBUG: Ver turnos no banco (temporário)
    router.get("/debug-shifts", requireAdmin, controller.getDebugShifts);

    // Rota para corrigir cálculos 60/40 de TODOS os turnos
    router.post("/fix-legacy-shifts", requireAdmin, controller.fixLegacyShifts);

    // Rota para corrigir UM ÚNICO turno (para teste)
    router.post("/fix-single-shift/:shiftId", requireAdmin, controller.fixSingleShift);
}

// ============================================================
// ENDPOINT ISOLADO: Corrigir APENAS contagem de corridas
// NÃO MEXE em 60/40, custos, repasses - APENAS total_corridas
// ============================================================
router.post("/fix-ride-counts", requireAdmin, controller.fixRideCounts);

// Corrigir contagem de UM turno específico
router.post("/fix-single-ride-count/:shiftId", requireAdmin, controller.fixSingleRideCount);

export default router;
