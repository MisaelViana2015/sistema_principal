import { db } from "../core/db/connection.js";
import { shifts, rides } from "../../shared/schema.js";
import { eq } from "drizzle-orm";
import { fileURLToPath } from 'url';

/**
 * Script para recalcular totais de turnos
 * CORREÇÃO SEGURA:
 * 1. Removemos a associação mágica de corridas (perigoso)
 * 2. Aplicamos regra de data para split 60/40 vs 50/50
 * 3. Preservamos o totalCustos original do banco
 */
export async function recalculateAllShifts() {
    console.log("🔄 Iniciando recálculo seguro de turnos...");

    // Buscar todos os turnos finalizados
    const allShifts = await db
        .select()
        .from(shifts)
        .where(eq(shifts.status, 'finalizado'));

    console.log(`📊 Encontrados ${allShifts.length} turnos finalizados`);

    let updated = 0;
    let errors = 0;
    let ridesAssociated = 0; // Mantido nos retornos por compatibilidade, mas será sempre 0

    // Data de corte para mudança de regra (15/12/2024)
    // Antes dessa data: 60% Empresa / 40% Motorista
    // Depois dessa data: 50% Empresa / 50% Motorista
    const CUTOFF_DATE = new Date('2024-12-15T00:00:00');

    for (const shift of allShifts) {
        try {
            // PASSO 1: Buscar APENAS corridas JÁ associadas ao turno
            // Não tentamos associar nada magicamente para evitar duplicidade ou erros
            const ridesData = await db
                .select()
                .from(rides)
                .where(eq(rides.shiftId, shift.id));

            // Calcular totais brutos
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

            // PRESERVAR CUSTOS DO BANCO
            // Não zeramos custos!! Usamos o que já está lá salvo.
            const totalCustos = Number(shift.totalCustos || 0);

            // Calcular líquido
            const liquido = totalBruto - totalCustos;

            // DEFINIR REPASSE BASEADO NA DATA
            let repasseEmpresa = 0;
            let repasseMotorista = 0;

            const dataInicio = new Date(shift.inicio);

            // Regra Híbrida
            if (dataInicio < CUTOFF_DATE) {
                // ANTES DE 15/12: 60% Empresa / 40% Motorista
                repasseEmpresa = liquido * 0.60;
                repasseMotorista = liquido * 0.40;
                // Ajuste fino para centavos
                repasseMotorista = liquido - Number(repasseEmpresa.toFixed(2));
            } else {
                // DEPOIS DE 15/12: 50% / 50%
                repasseEmpresa = liquido * 0.50;
                repasseMotorista = liquido * 0.50;
            }

            // Atualizar turno com valores corrigidos
            // Convertendo para fixed(2) e depois Number para garantir formato monetário
            await db
                .update(shifts)
                .set({
                    totalApp,
                    totalParticular,
                    totalBruto,
                    totalCorridas,
                    totalCorridasApp,
                    totalCorridasParticular,
                    // totalCustos, // Não atualizamos custos, pois já lemos eles
                    liquido,
                    repasseEmpresa: Number(repasseEmpresa.toFixed(2)),
                    repasseMotorista: Number(repasseMotorista.toFixed(2))
                })
                .where(eq(shifts.id, shift.id));

            updated++;

            // Log discreto a cada 50 updates para não poluir terminal
            if (updated % 50 === 0) {
                console.log(`✅ Processados ${updated}/${allShifts.length}...`);
            }

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

// Auto-run se executado via CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    recalculateAllShifts()
        .then(() => process.exit(0))
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}
