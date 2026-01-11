/**
 * Script de Correção de Turnos Antigos
 *
 * Problema: Turnos antes de 15/12/2024 têm repasses calculados como 50/50 ao invés de 60/40
 * Solução: Recalcular todos os turnos finalizados antes dessa data
 *
 * USO:
 *   npx tsx scripts/db/fix-legacy-shift-totals.ts --dry-run   # Apenas mostra o que seria alterado
 *   npx tsx scripts/db/fix-legacy-shift-totals.ts             # Executa as correções
 */

import { db } from "../../core/db/connection.js";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

const DRY_RUN = process.argv.includes("--dry-run");
const CUTOFF_DATE = "2024-12-15";

interface ShiftBackup {
    id: string;
    before: { repasseEmpresa: number; repasseMotorista: number };
    after: { repasseEmpresa: number; repasseMotorista: number };
}

async function main() {
    console.log("======================================");
    console.log("  CORREÇÃO DE TURNOS ANTIGOS (60/40)  ");
    console.log("======================================");
    console.log(`Modo: ${DRY_RUN ? "🔍 DRY-RUN (simulação)" : "⚠️ EXECUÇÃO REAL"}`);
    console.log(`Data de corte: ${CUTOFF_DATE}`);
    console.log("");

    // 1. Buscar turnos finalizados antes da data de corte (usando SQL raw)
    const legacyShifts = await db.execute(sql`
        SELECT id, total_app, total_particular, total_bruto, total_custos, liquido,
               repasse_empresa, repasse_motorista
        FROM shifts
        WHERE status = 'finalizado'
          AND inicio < ${CUTOFF_DATE}::timestamp
    `);

    console.log(`📦 Turnos encontrados: ${legacyShifts.rows.length}`);
    console.log("");

    if (legacyShifts.rows.length === 0) {
        console.log("✅ Nenhum turno antigo para corrigir.");
        return;
    }

    const backups: ShiftBackup[] = [];
    let corrected = 0;
    let skipped = 0;

    for (const shift of legacyShifts.rows as any[]) {
        const shiftId = shift.id;

        // Buscar corridas deste turno
        const ridesResult = await db.execute(sql`
            SELECT id, tipo, valor FROM rides WHERE shift_id = ${shiftId}
        `);
        const ridesData = ridesResult.rows as any[];

        // Buscar despesas deste turno
        const expensesResult = await db.execute(sql`
            SELECT id, valor, is_split_cost FROM expenses WHERE shift_id = ${shiftId}
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

        // Custos normais: descontados 100% da empresa
        repasseEmpresaFinal -= totalCustosNormais;

        // Custos divididos: 50% de cada
        const discountCompany = totalCustosDivididos * 0.50;
        const discountDriver = totalCustosDivididos * 0.50;
        repasseEmpresaFinal -= discountCompany;
        repasseMotoristaFinal -= discountDriver;

        // Verificar se precisa corrigir (diferença > R$0.01)
        const currentEmpresa = Number(shift.repasse_empresa || 0);
        const currentMotorista = Number(shift.repasse_motorista || 0);

        const needsCorrection =
            Math.abs(currentEmpresa - repasseEmpresaFinal) > 0.01 ||
            Math.abs(currentMotorista - repasseMotoristaFinal) > 0.01;

        if (!needsCorrection) {
            skipped++;
            continue;
        }

        // Salvar backup
        backups.push({
            id: shiftId,
            before: { repasseEmpresa: currentEmpresa, repasseMotorista: currentMotorista },
            after: { repasseEmpresa: repasseEmpresaFinal, repasseMotorista: repasseMotoristaFinal }
        });

        console.log(`\n🔄 Turno ${String(shiftId).substring(0, 8)}...`);
        console.log(`   Corridas: ${ridesData.length} | Custos: ${expensesData.length}`);
        console.log(`   Bruto: R$ ${totalBruto.toFixed(2)}`);
        console.log(`   ANTES: Empresa=${currentEmpresa.toFixed(2)} | Motorista=${currentMotorista.toFixed(2)}`);
        console.log(`   DEPOIS: Empresa=${repasseEmpresaFinal.toFixed(2)} | Motorista=${repasseMotoristaFinal.toFixed(2)}`);

        if (!DRY_RUN) {
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

    // Salvar backup em arquivo
    const backupPath = path.join(process.cwd(), `backup_shifts_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(backups, null, 2));
    console.log(`\n📁 Backup salvo em: ${backupPath}`);

    console.log("\n======================================");
    console.log(`  RESUMO  `);
    console.log("======================================");
    console.log(`Total de turnos: ${legacyShifts.rows.length}`);
    console.log(`Corrigidos: ${corrected}`);
    console.log(`Já estavam corretos: ${skipped}`);
    console.log(DRY_RUN ? "\n⚠️ MODO DRY-RUN - Nenhuma alteração foi salva!" : "\n✅ Correções aplicadas com sucesso!");
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("❌ Erro fatal:", err);
        process.exit(1);
    });
