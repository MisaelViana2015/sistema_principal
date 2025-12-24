
import { Router } from "express";
import * as controller from "./financial.controller.js";
import { requireAuth, requireAdmin } from "../../core/middlewares/authMiddleware.js";

const router = Router();

// Todas as rotas exigem autenticação
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

// FIX: Add missing columns to fixed_costs table
router.get("/fix-fixed-costs-schema", async (req, res) => {
    try {
        const { db } = await import("../../core/db/connection.js");
        const { sql } = await import("drizzle-orm");
        await db.execute(sql`ALTER TABLE fixed_costs ADD COLUMN IF NOT EXISTS total_installments integer`);
        await db.execute(sql`ALTER TABLE fixed_costs ADD COLUMN IF NOT EXISTS start_date timestamp`);
        res.json({ success: true, message: "Columns total_installments and start_date added/verified." });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DEBUG: Get database counts and recent data
router.get("/debug", async (req, res) => {
    try {
        const { db } = await import("../../core/db/connection.js");
        const { fixedCosts, fixedCostInstallments } = await import("../../../shared/schema.js");
        const { sql } = await import("drizzle-orm");

        const costsCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM fixed_costs`);
        const installmentsCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM fixed_cost_installments`);
        const recentCosts = await db.select().from(fixedCosts).limit(5);
        const recentInstallments = await db.select().from(fixedCostInstallments).limit(10);

        res.json({
            fixedCostsCount: costsCountResult.rows?.[0] || costsCountResult,
            installmentsCount: installmentsCountResult.rows?.[0] || installmentsCountResult,
            recentCosts,
            recentInstallments
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
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
