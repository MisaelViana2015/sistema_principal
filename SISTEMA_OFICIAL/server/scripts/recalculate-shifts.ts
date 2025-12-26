import { db } from "../core/db/connection.js";
import { shifts, rides } from "../../shared/schema.js";
import { eq, sql } from "drizzle-orm";

/**
 * Script SEGURO para recalcular totais de turnos
 * - Preserva custos existentes
 * - Aplica regra 60/40 para turnos antes de 15/12/2024
 * - Aplica regra 50/50 para turnos novos
 * - Não associa corridas automaticamente (evita duplicação)
 */
export async function recalculateAllShifts() {
    console.log("🔄 Iniciando recálculo SEGURO de turnos...");

    // Buscar todos os turnos finalizados
    const allShifts = await db
        .select()
        .from(shifts)
        .where(eq(shifts.status, 'finalizado'));

    console.log(`📊 Encontrados ${allShifts.length} turnos finalizados`);

    let updated = 0;
    let errors = 0;

    for (const shift of allShifts) {
        try {
            // Buscar corridas do turno
            const ridesData = await db
                .select()
                .from(rides)
                .where(eq(rides.shiftId, shift.id));

            // Calcular totais das corridas
            const totalApp = ridesData
                .filter(r => ['APP', 'APLICATIVO'].includes(r.tipo?.toUpperCase() || ''))
                .reduce((sum, r) => sum + Number(r.valor || 0), 0);

            const totalParticular = ridesData
                .filter(r => !['APP', 'APLICATIVO'].includes(r.tipo?.toUpperCase() || ''))
                .reduce((sum, r) => sum + Number(r.valor || 0), 0);

            const totalCorridasApp = ridesData.filter(r => ['APP', 'APLICATIVO'].includes(r.tipo?.toUpperCase() || '')).length;
            const totalCorridasParticular = ridesData.filter(r => !['APP', 'APLICATIVO'].includes(r.tipo?.toUpperCase() || '')).length;
            const totalCorridas = ridesData.length;
            const totalBruto = totalApp + totalParticular;

            // PRESERVAR CUSTOS EXISTENTES DO BANCO
            // O script original zerava isso (totalCustos = 0), o que era perigoso.
            const totalCustos = Number(shift.totalCustos || 0);

            // Calcular líquido
            const liquido = totalBruto - totalCustos;

            // Determinar regra de repasse baseada na data
            // Antes de 15/12/2024: 60% Empresa / 40% Motorista
            // Depois: 50% / 50%
            const CUTOFF_DATE = new Date('2024-12-15T00:00:00');
            const shiftDate = new Date(shift.inicio);

            let repasseEmpresa = 0;
            let repasseMotorista = 0;

            if (shiftDate < CUTOFF_DATE) {
                // Regra Antiga (60/40)
                repasseEmpresa = liquido * 0.60;
                repasseMotorista = liquido * 0.40;
            } else {
                // Regra Nova (50/50)
                repasseEmpresa = liquido * 0.50;
                repasseMotorista = liquido * 0.50;
            }

            // Atualizar turno apenas com valores financeiros recalculados
            await db
                .update(shifts)
                .set({
                    totalApp: Number(totalApp.toFixed(2)),
                    totalParticular: Number(totalParticular.toFixed(2)),
                    totalBruto: Number(totalBruto.toFixed(2)),
                    totalCorridas,
                    totalCorridasApp,
                    totalCorridasParticular,
                    // Não alteramos totalCustos aqui, mantemos o original
                    liquido: Number(liquido.toFixed(2)),
                    repasseEmpresa: Number(repasseEmpresa.toFixed(2)),
                    repasseMotorista: Number(repasseMotorista.toFixed(2))
                })
                .where(eq(shifts.id, shift.id));

            updated++;
            // Log menos verboso para não poluir
        } catch (error) {
            errors++;
            console.error(`❌ Erro ao recalcular turno ${shift.id}:`, error);
        }
    }

    console.log(`\n✨ Recálculo concluído!`);
    console.log(`   ✅ Turnos atualizados: ${updated}`);
    console.log(`   ❌ Erros: ${errors}`);

    return { updated, errors, total: allShifts.length };
}
