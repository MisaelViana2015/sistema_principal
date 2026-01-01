
import * as repository from "./financial.repository.js";

export async function getAllExpenses(filters?: { shiftId?: string }) {
    return await repository.findAllExpenses(filters);
}

export async function getAllLegacyMaintenances() {
    return await repository.findAllLegacyMaintenances();
}

export async function getAllCostTypes() {
    return await repository.findAllCostTypes();
}

export async function getAllFixedCosts() {
    return await repository.findAllFixedCosts();
}

export async function getFixedCostInstallments(filters?: { month?: string, year?: string, status?: string }) {
    return await repository.getFixedCostInstallments(filters);
}

export async function updateFixedCostInstallment(id: string, data: any) {
    return await repository.updateFixedCostInstallment(id, data);
}

export async function createFixedCost(data: any, context?: AuditContext) {
    if (context) {
        return await auditService.withAudit({
            action: 'CREATE_FIXED_COST', // Need to check if this action exists or just use generic
            entity: 'fixed_costs',
            entityId: 'new',
            operation: 'INSERT',
            context,
            execute: () => repository.createFixedCost(data),
            fetchAfter: (result) => repository.getFixedCostById(result!.id) // Assuming getFixedCostById exists
        });
    }
    return await repository.createFixedCost(data);
}

export async function updateFixedCost(id: string, data: any, context?: AuditContext) {
    if (context) {
        return await auditService.withAudit({
            action: 'UPDATE_FIXED_COST',
            entity: 'fixed_costs',
            entityId: id,
            operation: 'UPDATE',
            context,
            fetchBefore: () => repository.getFixedCostById(id),
            execute: () => repository.updateFixedCost(id, data),
            fetchAfter: () => repository.getFixedCostById(id)
        });
    }
    return await repository.updateFixedCost(id, data);
}

export async function deleteFixedCost(id: string, context?: AuditContext) {
    if (context) {
        return await auditService.withAudit({
            action: 'DELETE_FIXED_COST',
            entity: 'fixed_costs',
            entityId: id,
            operation: 'DELETE',
            context,
            fetchBefore: () => repository.getFixedCostById(id),
            execute: () => repository.deleteFixedCost(id)
        });
    }
    return await repository.deleteFixedCost(id);
}

export async function restoreDefaultCostTypes() {
    return await repository.restoreDefaultCostTypes();
}

import { db } from "../../core/db/connection.js";
import { shifts, expenses } from "../../../shared/schema.js";
import { eq, and, sql } from "drizzle-orm";
import { auditService, AUDIT_ACTIONS } from "../../core/audit/index.js";
import type { AuditContext } from "../../core/audit/index.js";

// Note: imports already present
import { recalculateShiftTotals } from "../shifts/shifts.service.js";

export async function createExpense(data: typeof expenses.$inferInsert, context?: AuditContext) {
    const auditContext = context || auditService.createSystemContext('legacy-create-expense');

    return auditService.withAudit({
        action: AUDIT_ACTIONS.CREATE_EXPENSE,
        entity: 'expenses',
        entityId: 'new', // ID gerado
        operation: 'INSERT',
        context: auditContext,
        execute: async () => {
            const newExpense = await repository.createExpense(data);

            // Update Shift Totals if linked to a shift
            if (data.shiftId) {
                await recalculateShiftTotals(data.shiftId);
            } else if (data.driverId) {
                // Fallback: try to find active shift for this driver
                const [shift] = await db.select().from(shifts)
                    .where(and(
                        eq(shifts.driverId, String(data.driverId)),
                        eq(shifts.status, 'em_andamento')
                    ));

                if (shift) {
                    // Update expense with shiftId
                    await repository.updateExpense(newExpense.id, { shiftId: shift.id });
                    await recalculateShiftTotals(shift.id);
                }
            }

            return newExpense;
        },
        fetchAfter: async (result) => {
            if (result && result.id) {
                return await repository.getExpenseById(result.id);
            }
            return result;
        }
    });
}

export async function updateExpense(id: string, data: Partial<typeof expenses.$inferInsert>, context?: AuditContext) {
    const auditContext = context || auditService.createSystemContext('legacy-update-expense');

    return auditService.withAudit({
        action: AUDIT_ACTIONS.UPDATE_EXPENSE,
        entity: 'expenses',
        entityId: id,
        operation: 'UPDATE',
        context: auditContext,
        fetchBefore: () => repository.getExpenseById(id),
        execute: async () => {
            const original = await repository.getExpenseById(id);
            if (!original) throw new Error("Despesa não encontrada");

            const updated = await repository.updateExpense(id, data);

            if (original.shiftId) {
                await recalculateShiftTotals(original.shiftId);
            }
            if (data.shiftId && data.shiftId !== original.shiftId) {
                await recalculateShiftTotals(data.shiftId);
            }

            return updated;
        },
        fetchAfter: () => repository.getExpenseById(id)
    });
}

export async function deleteExpense(id: string, context?: AuditContext) {
    const auditContext = context || auditService.createSystemContext('legacy-delete-expense');

    return auditService.withAudit({
        action: AUDIT_ACTIONS.DELETE_EXPENSE,
        entity: 'expenses',
        entityId: id,
        operation: 'DELETE',
        context: auditContext,
        fetchBefore: () => repository.getExpenseById(id),
        execute: async () => {
            const expense = await repository.getExpenseById(id);
            if (!expense) throw new Error("Despesa não encontrada");

            await repository.deleteExpense(id);

            // Tentar recalcular turno, mas não falhar se o turno não existir mais (despesa órfã)
            if (expense.shiftId) {
                try {
                    await recalculateShiftTotals(expense.shiftId);
                } catch (error: any) {
                    console.warn(`[deleteExpense] Não foi possível recalcular turno ${expense.shiftId} (pode ter sido deletado): ${error.message}`);
                }
            }

            return true;
        },
        // fetchAfter null
    });
}

export async function createCostType(data: any) {
    return await repository.createCostType(data);
}

export async function updateCostType(id: string, data: any) {
    return await repository.updateCostType(id, data);
}

export async function deleteCostType(id: string) {
    return await repository.deleteCostType(id);
}

export async function deleteLegacyMaintenance(id: string) {
    return await repository.deleteLegacyMaintenance(id);
}

export async function createLegacyMaintenance(data: any) {
    return await repository.createLegacyMaintenance(data);
}

// --- TIRES ---
export async function getAllTires() {
    return await repository.findAllTires();
}

export async function createTire(data: any) {
    return await repository.createTire(data);
}

export async function deleteTire(id: string) {
    return await repository.deleteTire(id);
}

// DB FIX LOGIC (MOVED FROM ROUTES)
export async function fixLegacyShifts(dryRun: boolean) {
    const { db } = await import("../../core/db/connection.js");
    const { sql } = await import("drizzle-orm");

    // Buscar TODOS os turnos encerrados
    const allShifts = await db.execute(sql`
        SELECT id, status, total_bruto, total_custos, repasse_empresa, repasse_motorista, inicio
        FROM shifts 
        WHERE status != 'em_andamento'
    `);

    const results: any[] = [];
    let corrected = 0;
    let skipped = 0;

    for (const shift of allShifts.rows as any[]) {
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

        // Contar corridas
        const totalCorridasApp = ridesData.filter(r => ['APP', 'APLICATIVO'].includes(String(r.tipo || '').toUpperCase())).length;
        const totalCorridasParticular = ridesData.filter(r => !['APP', 'APLICATIVO'].includes(String(r.tipo || '').toUpperCase())).length;
        const totalCorridas = ridesData.length;

        // REGRA: SEMPRE 60% Empresa / 40% Motorista
        let repasseEmpresaFinal = liquido * 0.60;
        let repasseMotoristaFinal = liquido * 0.40;

        // Custos normais: descontados 100% da empresa
        repasseEmpresaFinal -= totalCustosNormais;

        // Custos divididos: 50% de cada
        repasseEmpresaFinal -= totalCustosDivididos * 0.50;
        repasseMotoristaFinal -= totalCustosDivididos * 0.50;

        // Verificar se precisa corrigir (diferença > R$ 0.01)
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
            id: shiftId.substring(0, 8),
            data: new Date(shift.inicio).toLocaleDateString('pt-BR'),
            bruto: totalBruto.toFixed(2),
            custos: totalCustos.toFixed(2),
            liquido: liquido.toFixed(2),
            atual: {
                empresa: currentEmpresa.toFixed(2),
                motorista: currentMotorista.toFixed(2),
                percentual: liquido > 0 ? `${((currentEmpresa / liquido) * 100).toFixed(0)}/${((currentMotorista / liquido) * 100).toFixed(0)}` : 'N/A'
            },
            corrigido: {
                empresa: repasseEmpresaFinal.toFixed(2),
                motorista: repasseMotoristaFinal.toFixed(2),
                percentual: '60/40'
            }
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
                    repasse_motorista = ${repasseMotoristaFinal},
                    total_corridas = ${totalCorridas},
                    total_corridas_app = ${totalCorridasApp},
                    total_corridas_particular = ${totalCorridasParticular}
                WHERE id = ${shiftId}
            `);
        }

        corrected++;
    }

    return {
        success: true,
        dryRun,
        total: allShifts.rows.length,
        corrected,
        skipped,
        details: results.slice(0, 200)
    };
}

export async function getDebugShifts() {
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

    return {
        total: shifts.rows.length,
        errados: analyzed.filter(a => a.errado).length,
        turnos: analyzed
    };
}

export async function fixSingleShift(shiftId: string, dryRun: boolean) {
    const { db } = await import("../../core/db/connection.js");
    const { sql } = await import("drizzle-orm");

    // Buscar o turno pelo ID parcial
    const shiftResult = await db.execute(sql`
        SELECT id, status, total_bruto, total_custos, repasse_empresa, repasse_motorista, inicio
        FROM shifts 
        WHERE id LIKE ${shiftId + '%'}
        LIMIT 1
    `);

    if (shiftResult.rows.length === 0) {
        throw new Error("Turno não encontrado");
    }

    const shift = shiftResult.rows[0] as any;

    // Buscar corridas
    const ridesResult = await db.execute(sql`SELECT tipo, valor FROM rides WHERE shift_id = ${shift.id}`);
    const ridesData = ridesResult.rows as any[];

    // Calcular totais
    const totalApp = ridesData
        .filter(r => ['APP', 'APLICATIVO'].includes(String(r.tipo || '').toUpperCase()))
        .reduce((sum, r) => sum + Number(r.valor || 0), 0);

    const totalParticular = ridesData
        .filter(r => !['APP', 'APLICATIVO'].includes(String(r.tipo || '').toUpperCase()))
        .reduce((sum, r) => sum + Number(r.valor || 0), 0);

    const totalBruto = totalApp + totalParticular;
    const liquido = totalBruto;

    // Contar corridas
    const totalCorridasApp = ridesData.filter(r => ['APP', 'APLICATIVO'].includes(String(r.tipo || '').toUpperCase())).length;
    const totalCorridasParticular = ridesData.filter(r => !['APP', 'APLICATIVO'].includes(String(r.tipo || '').toUpperCase())).length;
    const totalCorridas = ridesData.length;

    // REGRA: SEMPRE 60% Empresa / 40% Motorista
    const novoEmpresa = parseFloat((liquido * 0.60).toFixed(2));
    const novoMotorista = parseFloat((liquido * 0.40).toFixed(2));

    const atualEmpresa = Number(shift.repasse_empresa || 0);
    const atualMotorista = Number(shift.repasse_motorista || 0);

    const result = {
        id: shift.id,
        data: new Date(shift.inicio).toLocaleDateString('pt-BR'),
        bruto: totalBruto.toFixed(2),
        liquido: liquido.toFixed(2),
        corridas: totalCorridas,
        atual: {
            empresa: atualEmpresa.toFixed(2),
            motorista: atualMotorista.toFixed(2)
        },
        novo: {
            empresa: novoEmpresa.toFixed(2),
            motorista: novoMotorista.toFixed(2)
        }
    };

    if (!dryRun) {
        await db.execute(sql`
            UPDATE shifts SET
                total_app = ${totalApp},
                total_particular = ${totalParticular},
                total_bruto = ${totalBruto},
                liquido = ${liquido},
                repasse_empresa = ${novoEmpresa},
                repasse_motorista = ${novoMotorista},
                total_corridas = ${totalCorridas},
                total_corridas_app = ${totalCorridasApp},
                total_corridas_particular = ${totalCorridasParticular}
            WHERE id = ${shift.id}
        `);
    }

    return {
        success: true,
        dryRun,
        message: dryRun ? "Simulação - nenhuma alteração feita" : "Turno corrigido com sucesso!",
        ...result
    };
}

export async function fixRideCounts(dryRun: boolean) {
    const { db } = await import("../../core/db/connection.js");
    const { sql } = await import("drizzle-orm");

    // Buscar TODOS os turnos finalizados
    const allShifts = await db.execute(sql`
        SELECT id, inicio, total_corridas, total_corridas_app, total_corridas_particular
        FROM shifts 
        WHERE status != 'em_andamento'
    `);

    const results: any[] = [];
    let corrected = 0;
    let skipped = 0;

    for (const shift of allShifts.rows as any[]) {
        const shiftId = shift.id;

        // Contar corridas do turno
        const ridesResult = await db.execute(sql`SELECT tipo FROM rides WHERE shift_id = ${shiftId}`);
        const ridesData = ridesResult.rows as any[];

        const totalCorridasApp = ridesData.filter(r => ['APP', 'APLICATIVO'].includes(String(r.tipo || '').toUpperCase())).length;
        const totalCorridasParticular = ridesData.filter(r => !['APP', 'APLICATIVO'].includes(String(r.tipo || '').toUpperCase())).length;
        const totalCorridas = ridesData.length;

        // Valores atuais no banco
        const currentTotal = Number(shift.total_corridas || 0);
        const currentApp = Number(shift.total_corridas_app || 0);
        const currentParticular = Number(shift.total_corridas_particular || 0);

        // Verificar se precisa corrigir (qualquer diferença)
        const needsCorrection =
            totalCorridas !== currentTotal ||
            totalCorridasApp !== currentApp ||
            totalCorridasParticular !== currentParticular;

        // Se turno não tem corridas E banco também está zerado, pula
        if (totalCorridas === 0 && currentTotal === 0) {
            skipped++;
            continue;
        }

        // Se já está correto, pula
        if (!needsCorrection) {
            skipped++;
            continue;
        }

        results.push({
            id: shiftId.substring(0, 8),
            data: new Date(shift.inicio).toLocaleDateString('pt-BR'),
            atual: currentTotal,
            correto: totalCorridas,
            app: totalCorridasApp,
            particular: totalCorridasParticular
        });

        if (!dryRun) {
            // APENAS atualiza contagem - NÃO MEXE em nada mais
            await db.execute(sql`
                UPDATE shifts SET
                    total_corridas = ${totalCorridas},
                    total_corridas_app = ${totalCorridasApp},
                    total_corridas_particular = ${totalCorridasParticular}
                WHERE id = ${shiftId}
            `);
        }

        corrected++;
    }

    return {
        success: true,
        dryRun,
        total: allShifts.rows.length,
        corrected,
        skipped,
        details: results.slice(0, 100)
    };
}

export async function fixSingleRideCount(shiftId: string) {
    const { db } = await import("../../core/db/connection.js");
    const { sql } = await import("drizzle-orm");

    // Buscar turno pelo ID parcial
    const shiftResult = await db.execute(sql`
        SELECT id, inicio, total_corridas, total_corridas_app, total_corridas_particular
        FROM shifts 
        WHERE id LIKE ${shiftId + '%'}
        LIMIT 1
    `);

    if (shiftResult.rows.length === 0) {
        throw new Error("Turno não encontrado");
    }

    const shift = shiftResult.rows[0] as any;

    // Contar corridas
    const ridesResult = await db.execute(sql`SELECT tipo FROM rides WHERE shift_id = ${shift.id}`);
    const ridesData = ridesResult.rows as any[];

    const totalCorridasApp = ridesData.filter(r => ['APP', 'APLICATIVO'].includes(String(r.tipo || '').toUpperCase())).length;
    const totalCorridasParticular = ridesData.filter(r => !['APP', 'APLICATIVO'].includes(String(r.tipo || '').toUpperCase())).length;
    const totalCorridas = ridesData.length;

    const antes = {
        total: Number(shift.total_corridas || 0),
        app: Number(shift.total_corridas_app || 0),
        particular: Number(shift.total_corridas_particular || 0)
    };

    // Atualizar
    await db.execute(sql`
        UPDATE shifts SET
            total_corridas = ${totalCorridas},
            total_corridas_app = ${totalCorridasApp},
            total_corridas_particular = ${totalCorridasParticular}
        WHERE id = ${shift.id}
    `);

    return {
        success: true,
        id: shift.id.substring(0, 8),
        data: new Date(shift.inicio).toLocaleDateString('pt-BR'),
        antes,
        depois: {
            total: totalCorridas,
            app: totalCorridasApp,
            particular: totalCorridasParticular
        }
    };
}

export async function checkDebugData() {
    const { db } = await import("../../core/db/connection.js");
    const { fixedCosts, fixedCostInstallments, costTypes, vehicles } = await import("../../../shared/schema.js");

    const recentCosts = await db.select().from(fixedCosts).limit(5);
    const recentInstallments = await db.select().from(fixedCostInstallments).limit(10);
    const allCostTypes = await db.select({ id: costTypes.id, name: costTypes.name }).from(costTypes);
    const allVehicles = await db.select({ id: vehicles.id, plate: vehicles.plate }).from(vehicles);

    return {
        fixedCostsCount: recentCosts.length,
        installmentsCount: recentInstallments.length,
        costTypesCount: allCostTypes.length,
        vehiclesCount: allVehicles.length,
        costTypes: allCostTypes,
        vehicles: allVehicles,
        recentCosts,
        recentInstallments
    };
}

export async function fixDbEmergency() {
    const { db } = await import("../../core/db/connection.js");
    const { sql } = await import("drizzle-orm");
    await db.execute(sql`ALTER TABLE cost_types ADD COLUMN IF NOT EXISTS icon text`);
    await db.execute(sql`ALTER TABLE cost_types ADD COLUMN IF NOT EXISTS color text`);
    await db.execute(sql`ALTER TABLE cost_types ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true`);
    return "DB Update: Columns icon and color added/verified successfully.";
}
