
import { Router } from "express";
import * as controller from "./financial.controller.js";
import { requireAuth, requireAdmin } from "../../core/middlewares/authMiddleware.js";

const router = Router();

// Todas as rotas exigem autenticação
router.use(requireAuth);

router.get("/expenses", requireAdmin, controller.getExpenses);
router.get("/legacy-maintenances", requireAdmin, controller.getLegacyMaintenances);
router.post("/expenses", controller.createExpense);

// Cost Types
router.get("/cost-types", controller.getCostTypes);
router.post("/cost-types", requireAdmin, controller.createCostType);
router.put("/cost-types/:id", requireAdmin, controller.updateCostType);
router.delete("/cost-types/:id", requireAdmin, controller.deleteCostType);

router.get("/fixed-costs", requireAdmin, controller.getFixedCosts);

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
