
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

// ========== AUTHENTICATED ROUTES ==========
// Todas as rotas abaixo exigem autenticação
router.use(requireAuth);

router.get("/expenses", requireAdmin, controller.getExpenses);
router.get("/legacy-maintenances", requireAdmin, controller.getLegacyMaintenances);
router.delete("/legacy-maintenances/:id", requireAdmin, controller.deleteLegacyMaintenance);
router.post("/legacy-maintenances", requireAdmin, controller.createLegacyMaintenance);

// Tires
router.get("/tires", requireAdmin, controller.getTires); // Assuming getTires exists or will be added
router.post("/tires", requireAdmin, controller.createTire);
router.delete("/tires/:id", requireAdmin, controller.deleteTire); // Might as well add delete for consistency
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

// DEBUG: Ver turnos no banco (temporário)
router.get("/debug-shifts", requireAdmin, async (req, res) => {
    try {
        const { db } = await import("../../core/db/connection.js");
        const { sql } = await import("drizzle-orm");

        // Buscar todos os turnos encerrados
        const shifts = await db.execute(sql`
            SELECT id, status, inicio, total_bruto, repasse_empresa, repasse_motorista
            FROM shifts 
            WHERE status != 'em_andamento'
            ORDER BY inicio DESC
            LIMIT 20
        `);

        // Verificar quais estão com cálculo errado (empresa != 60% do bruto)
        const analyzed = (shifts.rows as any[]).map(s => {
            const bruto = Number(s.total_bruto || 0);
            const empresaAtual = Number(s.repasse_empresa || 0);
            const empresaCorreto = bruto * 0.60;
            const diferenca = Math.abs(empresaAtual - empresaCorreto);
            return {
                id: s.id,
                status: s.status,
                inicio: s.inicio,
                bruto,
                empresaAtual,
                empresaCorreto: empresaCorreto.toFixed(2),
                errado: diferenca > 0.01
            };
        });

        res.json({
            total: shifts.rows.length,
            errados: analyzed.filter(a => a.errado).length,
            turnos: analyzed
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para corrigir cálculos 60/40 de turnos antigos (antes de 15/12/2024)
router.post("/fix-legacy-shifts", requireAdmin, async (req, res) => {
    try {
        const { db } = await import("../../core/db/connection.js");
        const { sql } = await import("drizzle-orm");

        const dryRun = req.query.dryRun === "true";
        const cutoffDate = req.query.cutoffDate || "2024-12-15";

        // Buscar TODOS os turnos encerrados (ignora data - verifica pelo cálculo incorreto)
        const legacyShifts = await db.execute(sql`
            SELECT id, status, total_bruto, repasse_empresa, repasse_motorista, inicio
            FROM shifts 
            WHERE status != 'em_andamento'
        `);

        const results: any[] = [];
        let corrected = 0;
        let skipped = 0;

        for (const shift of legacyShifts.rows as any[]) {
            const shiftId = shift.id;

            // Buscar corridas
            const ridesResult = await db.execute(sql`
                SELECT tipo, valor FROM rides WHERE shift_id = ${shiftId}
            `);
            const ridesData = ridesResult.rows as any[];

            // Buscar despesas
            const expensesResult = await db.execute(sql`
                SELECT valor, is_split_cost FROM expenses WHERE shift_id = ${shiftId}
            `);
            const expensesData = expensesResult.rows as any[];

            // Calcular totais
            const totalApp = ridesData
                .filter(r => ['APP', 'APLICATIVO'].includes(String(r.tipo || '').toUpperCase()))
                .reduce((sum, r) => sum + Number(r.valor || 0), 0);

            const totalParticular = ridesData
                .filter(r => !['APP', 'APLICATIVO'].includes(String(r.tipo || '').toUpperCase()))
                .reduce((sum, r) => sum + Number(r.valor || 0), 0);

            const normalExpenses = expensesData.filter(e => !e.is_split_cost);
            const splitExpenses = expensesData.filter(e => e.is_split_cost);

            const totalCustosNormais = normalExpenses.reduce((sum, e) => sum + Number(e.valor || 0), 0);
            const totalCustosDivididos = splitExpenses.reduce((sum, e) => sum + Number(e.valor || 0), 0);
            const totalCustos = totalCustosNormais + totalCustosDivididos;

            const totalBruto = totalApp + totalParticular;
            const liquido = totalBruto;

            // CÁLCULO CORRETO 60/40
            let repasseEmpresaFinal = liquido * 0.60;
            let repasseMotoristaFinal = liquido * 0.40;
            repasseEmpresaFinal -= totalCustosNormais;
            const discountCompany = totalCustosDivididos * 0.50;
            const discountDriver = totalCustosDivididos * 0.50;
            repasseEmpresaFinal -= discountCompany;
            repasseMotoristaFinal -= discountDriver;

            // Verificar se precisa corrigir
            const currentEmpresa = Number(shift.repasse_empresa || 0);
            const currentMotorista = Number(shift.repasse_motorista || 0);

            const needsCorrection =
                Math.abs(currentEmpresa - repasseEmpresaFinal) > 0.01 ||
                Math.abs(currentMotorista - repasseMotoristaFinal) > 0.01;

            if (!needsCorrection) {
                skipped++;
                continue;
            }

            results.push({
                id: shiftId,
                before: { empresa: currentEmpresa, motorista: currentMotorista },
                after: { empresa: repasseEmpresaFinal, motorista: repasseMotoristaFinal }
            });

            if (!dryRun) {
                await db.execute(sql`
                    UPDATE shifts SET
                        total_app = ${totalApp},
                        total_particular = ${totalParticular},
                        total_bruto = ${totalBruto},
                        total_custos = ${totalCustos},
                        liquido = ${liquido},
                        repasse_empresa = ${repasseEmpresaFinal},
                        repasse_motorista = ${repasseMotoristaFinal}
                    WHERE id = ${shiftId}
                `);
            }

            corrected++;
        }

        res.json({
            success: true,
            dryRun,
            total: legacyShifts.rows.length,
            corrected,
            skipped,
            details: results.slice(0, 10) // Limitar para não sobrecarregar resposta
        });
    } catch (error: any) {
        console.error("Erro ao corrigir turnos:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
