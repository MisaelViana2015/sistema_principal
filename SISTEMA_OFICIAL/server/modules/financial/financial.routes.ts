
import { Router } from "express";
import * as controller from "./financial.controller.js";
import { requireAuth, requireAdmin } from "../../core/middlewares/authMiddleware.js";

const router = Router();

// ========== EMERGENCY ROUTES (NO AUTH) ==========
// (Rotas de correção e teste removidas após validação)

// DEBUG: Get database counts and recent data
router.get("/debug", async (req, res) => {
    try {
        const { db } = await import("../../core/db/connection.js");
        const { fixedCosts, fixedCostInstallments, costTypes, vehicles } = await import("../../../shared/schema.js");

        const recentCosts = await db.select().from(fixedCosts).limit(5);
        const recentInstallments = await db.select().from(fixedCostInstallments).limit(10);
        const allCostTypes = await db.select({ id: costTypes.id, name: costTypes.name }).from(costTypes);
        const allVehicles = await db.select({ id: vehicles.id, plate: vehicles.plate }).from(vehicles);

        res.json({
            fixedCostsCount: recentCosts.length,
            installmentsCount: recentInstallments.length,
            costTypesCount: allCostTypes.length,
            vehiclesCount: allVehicles.length,
            costTypes: allCostTypes,
            vehicles: allVehicles,
            recentCosts,
            recentInstallments
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// DEBUG: Attempt to create a fixed cost directly (Bypass Auth/UI)
router.get("/debug-create-cost", async (req, res) => {
    try {
        const { createFixedCost } = await import("./financial.service.js");

        // Use IDs known to exist from /debug output
        // CostType: "Teste 14:14" -> d7a8f090-2ecb-4abc-945b-04e20935203a
        // Vehicle: "TQQ0A07" -> 89146774-1d45-46c2-aa6c-abd1884d90c9

        const payload = {
            name: "Debug Auto Create",
            value: "100.50",
            frequency: "Único",
            dueDay: 25,
            vehicleId: "89146774-1d45-46c2-aa6c-abd1884d90c9",
            costTypeId: "d7a8f090-2ecb-4abc-945b-04e20935203a",
            vendor: "DebugBot",
            notes: "Created via /debug-create-cost",
            totalInstallments: 1,
            startDate: new Date("2025-12-25"),
            isActive: true
        };

        const result = await createFixedCost(payload);
        res.json({ success: true, result });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: "Insert Failed",
            message: error.message,
            code: error.code,
            detail: error.detail,
            stack: error.stack
        });
    }
});

// ========== AUTHENTICATED ROUTES ==========
// Todas as rotas abaixo exigem autenticação
router.use(requireAuth);

router.get("/expenses", requireAdmin, controller.getExpenses);
router.get("/legacy-maintenances", requireAdmin, controller.getLegacyMaintenances);
router.post("/expenses", controller.createExpense);
router.put("/expenses/:id", controller.updateExpenseController);
router.delete("/expenses/:id", controller.deleteExpenseController);

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

// Rota de Emergência para corrigir Schema (executar uma vez e remover depois)
router.get("/fix-db-emergency", async (req, res) => {
    try {
        const { db } = await import("../../core/db/connection.js");
        const { sql } = await import("drizzle-orm");
        await db.execute(sql`ALTER TABLE cost_types ADD COLUMN IF NOT EXISTS icon text`);
        await db.execute(sql`ALTER TABLE cost_types ADD COLUMN IF NOT EXISTS color text`);
        await db.execute(sql`ALTER TABLE cost_types ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true`);
        res.send("DB Update: Columns icon and color added/verified successfully.");
    } catch (error: any) {
        res.status(500).send("Error updating DB: " + error.message);
    }
});

// Rota de Migração de Dados Legados (Preencher ícones/cores faltantes)
router.post("/fix-legacy-visuals", requireAdmin, async (req, res) => {
    try {
        const { migrateCostTypesVisuals } = await import("../../scripts/db/migrate_cost_types_visuals.js");
        await migrateCostTypesVisuals();
        res.json({ success: true, message: "Migração visual executada com sucesso." });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
