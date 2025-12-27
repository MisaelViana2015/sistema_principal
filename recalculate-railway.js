/**
 * Script para recalcular turnos conectando diretamente no banco Railway
 */

import pkg from 'pg';
const { Pool } = pkg;

// URL de conexão da Railway
const DATABASE_URL = 'postgresql://postgres:BDnSvDzpOoQcJsRPSvkZnoDfFOCCwbKR@turntable.proxy.rlwy.net:21162/railway';

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function recalculateShifts() {
    console.log("🔄 Iniciando recálculo de turnos...\n");

    const client = await pool.connect();

    try {
        // Data de corte
        const CUTOFF_DATE = new Date('2024-12-15T00:00:00');

        // Buscar todos os turnos finalizados
        const shiftsResult = await client.query(`
            SELECT id, inicio, total_bruto, total_custos, liquido, 
                   repasse_empresa, repasse_motorista, status
            FROM shifts 
            WHERE status = 'fechado' OR status = 'finalizado'
            ORDER BY inicio
        `);

        console.log(`📊 Total de turnos encontrados: ${shiftsResult.rows.length}\n`);

        let updated = 0;
        let skipped = 0;

        for (const shift of shiftsResult.rows) {
            const dataInicio = new Date(shift.inicio);
            const totalBruto = parseFloat(shift.total_bruto) || 0;
            const totalCustos = parseFloat(shift.total_custos) || 0;
            const liquido = totalBruto - totalCustos;

            // Calcular repasse correto baseado na data
            let repasseEmpresa = 0;
            let repasseMotorista = 0;

            if (dataInicio < CUTOFF_DATE) {
                // ANTES DE 15/12/2024: 60% Empresa / 40% Motorista
                repasseEmpresa = liquido * 0.60;
                repasseMotorista = liquido * 0.40;
            } else {
                // DEPOIS DE 15/12/2024: 50% / 50%
                repasseEmpresa = liquido * 0.50;
                repasseMotorista = liquido * 0.50;
            }

            // Arredondar para 2 casas decimais
            repasseEmpresa = parseFloat(repasseEmpresa.toFixed(2));
            repasseMotorista = parseFloat(repasseMotorista.toFixed(2));

            // Verificar se precisa atualizar (diferença > R$ 0.01)
            const currentEmpresa = parseFloat(shift.repasse_empresa) || 0;
            const currentMotorista = parseFloat(shift.repasse_motorista) || 0;

            const needsUpdate =
                Math.abs(currentEmpresa - repasseEmpresa) > 0.01 ||
                Math.abs(currentMotorista - repasseMotorista) > 0.01;

            if (needsUpdate) {
                console.log(`🔄 Turno ${shift.id.substring(0, 8)}... (${dataInicio.toLocaleDateString('pt-BR')})`);
                console.log(`   Bruto: R$ ${totalBruto.toFixed(2)} | Líquido: R$ ${liquido.toFixed(2)}`);
                console.log(`   ANTES: Empresa R$ ${currentEmpresa.toFixed(2)} | Motorista R$ ${currentMotorista.toFixed(2)}`);
                console.log(`   DEPOIS: Empresa R$ ${repasseEmpresa.toFixed(2)} | Motorista R$ ${repasseMotorista.toFixed(2)}`);
                console.log(`   Regra: ${dataInicio < CUTOFF_DATE ? '60/40' : '50/50'}\n`);

                await client.query(`
                    UPDATE shifts 
                    SET 
                        liquido = $1,
                        repasse_empresa = $2,
                        repasse_motorista = $3
                    WHERE id = $4
                `, [liquido, repasseEmpresa, repasseMotorista, shift.id]);

                updated++;
            } else {
                skipped++;
            }
        }

        console.log("\n======================================");
        console.log("  RESUMO  ");
        console.log("======================================");
        console.log(`Total de turnos: ${shiftsResult.rows.length}`);
        console.log(`Atualizados: ${updated}`);
        console.log(`Já estavam corretos: ${skipped}`);
        console.log("\n✅ Recálculo concluído com sucesso!");

    } catch (error) {
        console.error("❌ Erro:", error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Executar
recalculateShifts()
    .then(() => {
        console.log("\n✅ Script finalizado!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Erro fatal:", error);
        process.exit(1);
    });
