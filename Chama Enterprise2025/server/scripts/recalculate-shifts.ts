import { db } from "../core/db/connection.js";
import { shifts, rides, drivers } from "../../shared/schema.js";
import { eq, and, gte, lte, isNull } from "drizzle-orm";

/**
 * Script para associar corridas aos turnos e recalcular totais
 */
export async function recalculateAllShifts() {
    console.log("🔄 Iniciando recálculo de turnos...");

    // Buscar todos os turnos finalizados
    const allShifts = await db
        .select()
        .from(shifts)
        .where(eq(shifts.status, 'finalizado'));

    console.log(`📊 Encontrados ${allShifts.length} turnos finalizados`);

    let updated = 0;
    let errors = 0;
    let ridesAssociated = 0;

    for (const shift of allShifts) {
        try {
            // PASSO 1: Associar corridas ao turno (se ainda não estiverem associadas)
            // Buscar corridas sem shiftId que estejam no período do turno
            const unassociatedRides = await db
                .select()
                .from(rides)
                .where(
                    and(
                        isNull(rides.shiftId),
                        gte(rides.hora, shift.inicio),
                        shift.fim ? lte(rides.hora, shift.fim) : undefined
                    )
                );

            // Associar essas corridas ao turno
            for (const ride of unassociatedRides) {
                await db
                    .update(rides)
                    .set({ shiftId: shift.id })
                    .where(eq(rides.id, ride.id));
                ridesAssociated++;
            }

            // PASSO 2: Buscar TODAS as corridas do turno (incluindo as recém-associadas)
            const ridesData = await db
                .select()
                .from(rides)
                .where(eq(rides.shiftId, shift.id));

            // Calcular totais
            const totalApp = ridesData
                .filter((r: any) => ['APP', 'APLICATIVO'].includes(r.tipo?.toUpperCase() || ''))
                .reduce((sum: number, r: any) => sum + Number(r.valor || 0), 0);

            const totalParticular = ridesData
                .filter((r: any) => !['APP', 'APLICATIVO'].includes(r.tipo?.toUpperCase() || ''))
                .reduce((sum: number, r: any) => sum + Number(r.valor || 0), 0);

            const totalCorridasApp = ridesData.filter((r: any) => ['APP', 'APLICATIVO'].includes(r.tipo?.toUpperCase() || '')).length;
            const totalCorridasParticular = ridesData.filter((r: any) => !['APP', 'APLICATIVO'].includes(r.tipo?.toUpperCase() || '')).length;

            const totalBruto = totalApp + totalParticular;
            const totalCorridas = ridesData.length;
            const totalCustos = 0; // Por enquanto

            // Calcular líquido e repasses
            const liquido = totalBruto - totalCustos;
            const repasseEmpresa = liquido * 0.5;
            const repasseMotorista = liquido * 0.5;

            // Atualizar turno
            await db
                .update(shifts)
                .set({
                    totalApp,
                    totalParticular,
                    totalBruto,
                    totalCorridas,
                    totalCorridasApp,
                    totalCorridasParticular,
                    totalCustos,
                    liquido,
                    repasseEmpresa,
                    repasseMotorista
                })
                .where(eq(shifts.id, shift.id));

            updated++;
            console.log(`✅ Turno ${shift.id}: ${unassociatedRides.length} corridas associadas, ${totalCorridas} total, R$ ${totalBruto.toFixed(2)}`);
        } catch (error) {
            errors++;
            console.error(`❌ Erro ao recalcular turno ${shift.id}:`, error);
        }
    }

    console.log(`\n✨ Recálculo concluído!`);
    console.log(`   ✅ Turnos atualizados: ${updated}`);
    console.log(`   🔗 Corridas associadas: ${ridesAssociated}`);
    console.log(`   ❌ Erros: ${errors}`);

    return { updated, errors, total: allShifts.length, ridesAssociated };
}
