import { db } from "../core/db/connection.js";
import { shifts, rides, expenses } from "../../shared/schema.js";
import { eq, inArray } from "drizzle-orm";
import { fileURLToPath } from 'url';
import { FinancialCalculator } from "../modules/financial/FinancialCalculator.js";

/**
 * Script para recalcular totais de turnos
 * OTIMIZAÇÃO DE PERFORMANCE (BATCH PROCESSING):
 * 1. Processa em lotes de 50 turnos para não estourar memória
 * 2. Faz fetch de corridas e despesas em BULK para evitar N+1
 * 3. Usa FinancialCalculator para garantir consistência
 */
export async function recalculateAllShifts() {
    console.log("🔄 Iniciando recálculo OTIMIZADO de turnos...");

    // Buscar todos os turnos finalizados
    const allShifts = await db
        .select()
        .from(shifts)
        .where(eq(shifts.status, 'finalizado'));

    console.log(`📊 Encontrados ${allShifts.length} turnos finalizados`);

    let updated = 0;
    let errors = 0;
    const BATCH_SIZE = 50;

    // Processar em Lotes
    for (let i = 0; i < allShifts.length; i += BATCH_SIZE) {
        const batch = allShifts.slice(i, i + BATCH_SIZE);
        const batchIds = batch.map(s => s.id);

        try {
            // 1. Fetch de DADOS em Lote (Evita N+1 queries)
            // Buscamos todas as corridas e despesas de todos os turnos do lote de uma vez
            const ridesData = await db.select().from(rides).where(inArray(rides.shiftId, batchIds));
            const expensesData = await db.select().from(expenses).where(inArray(expenses.shiftId, batchIds));

            // Agrupar em Mapas por ShiftID para acesso O(1)
            const ridesMap = new Map<string, typeof ridesData>();
            const expensesMap = new Map<string, typeof expensesData>();

            for (const r of ridesData) {
                if (!r.shiftId) continue;
                if (!ridesMap.has(r.shiftId)) ridesMap.set(r.shiftId, []);
                ridesMap.get(r.shiftId)?.push(r);
            }

            for (const e of expensesData) {
                if (!e.shiftId) continue;
                if (!expensesMap.has(e.shiftId)) expensesMap.set(e.shiftId, []);
                expensesMap.get(e.shiftId)?.push(e);
            }

            // 2. Processar cada turno do lote (Cálculo em memória)
            const updates = batch.map(async (shift) => {
                const shiftRides = ridesMap.get(shift.id) || [];
                const shiftExpenses = expensesMap.get(shift.id) || [];

                // Validar dados
                const totalApp = shiftRides
                    .filter(r => ['APP', 'APLICATIVO'].includes(r.tipo?.toUpperCase() || ''))
                    .reduce((sum, r) => sum + Number(r.valor || 0), 0);

                const totalParticular = shiftRides
                    .filter(r => !['APP', 'APLICATIVO'].includes(r.tipo?.toUpperCase() || ''))
                    .reduce((sum, r) => sum + Number(r.valor || 0), 0);

                // Preparar despesas
                const normalExpenses = shiftExpenses.filter(e => !e.isSplitCost);
                const splitExpenses = shiftExpenses.filter(e => e.isSplitCost);

                const totalCustosNormais = normalExpenses.reduce((sum, e) => sum + Number(e.value || 0), 0);
                const totalCustosDivididos = splitExpenses.reduce((sum, e) => sum + Number(e.value || 0), 0);
                const totalCustosParticular = shiftExpenses.filter(e => e.isParticular).reduce((sum, e) => sum + Number(e.value || 0), 0); // Aproximação, schema expenses pode variar

                // Usar Calculadora Central
                const result = FinancialCalculator.calculateShiftResult({
                    totalApp,
                    totalParticular,
                    totalCustosNormais,
                    totalCustosDivididos,
                    shiftDate: shift.inicio || new Date() // Fallback
                });

                // Executar Update
                await db.update(shifts)
                    .set({
                        totalApp,
                        totalParticular,
                        totalBruto: result.totalBruto,
                        totalCorridas: shiftRides.length,
                        totalCorridasApp: shiftRides.filter(r => ['APP', 'APLICATIVO'].includes(r.tipo?.toUpperCase() || '')).length,
                        totalCorridasParticular: shiftRides.filter(r => !['APP', 'APLICATIVO'].includes(r.tipo?.toUpperCase() || '')).length,
                        totalCustos: result.totalCustos,
                        totalCustosParticular, // Mantemos o cálculo local se a calculator não retornar detalhado
                        liquido: result.liquido,
                        repasseEmpresa: result.repasseEmpresa,
                        repasseMotorista: result.repasseMotorista,
                        discountCompany: result.discountCompany,
                        discountDriver: result.discountDriver
                    })
                    .where(eq(shifts.id, shift.id));

                updated++;
            });

            await Promise.all(updates);

            console.log(`✅ Lote ${Math.floor(i / BATCH_SIZE) + 1} processado (${batch.length} turnos)`);

        } catch (err) {
            console.error(`❌ Erro no lote ${i}:`, err);
            errors += batch.length; // Assume erro no lote todo
        }
    }

    console.log(`\n✨ Recálculo concluído!`);
    console.log(`   ✅ Turnos atualizados: ${updated}`);
    console.log(`   ❌ Erros: ${errors}`);

    return { updated, errors, total: allShifts.length };
}

// Auto-run se executado via CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    recalculateAllShifts()
        .then(() => process.exit(0))
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}
