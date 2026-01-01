/**
 * Script para corrigir intervalos de manutenção no banco Railway
 * - Revisão Periódica: 20.000 km
 * - Rodízio de Pneus: 5.000 km
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

async function fixMaintenanceIntervals() {
    console.log("🔧 Corrigindo intervalos de manutenção...\n");

    const client = await pool.connect();

    try {
        // 1. Verificar configs atuais
        const currentConfigs = await client.query(`
            SELECT id, name, interval_km FROM maintenance_configs ORDER BY name
        `);

        console.log("📋 Configurações ANTES:");
        currentConfigs.rows.forEach(c => {
            console.log(`   - ${c.name}: ${c.interval_km} km`);
        });
        console.log("");

        // 2. Atualizar Revisão para 20.000 km
        const res1 = await client.query(`
            UPDATE maintenance_configs 
            SET interval_km = 20000 
            WHERE name ILIKE '%Revisão%' OR name ILIKE '%Óleo%'
            RETURNING id, name, interval_km
        `);
        console.log(`✅ ${res1.rowCount} configuração(ões) de Revisão atualizadas para 20.000 km`);

        // 3. Atualizar Pneus para 5.000 km
        const res2 = await client.query(`
            UPDATE maintenance_configs 
            SET interval_km = 5000 
            WHERE name ILIKE '%Pneu%' OR name ILIKE '%Rodízio%'
            RETURNING id, name, interval_km
        `);
        console.log(`✅ ${res2.rowCount} configuração(ões) de Pneus atualizadas para 5.000 km`);

        // 4. Verificar configs atuais
        const updatedConfigs = await client.query(`
            SELECT id, name, interval_km FROM maintenance_configs ORDER BY name
        `);

        console.log("\n📋 Configurações DEPOIS:");
        updatedConfigs.rows.forEach(c => {
            console.log(`   - ${c.name}: ${c.interval_km.toLocaleString()} km`);
        });

        console.log("\n✅ Intervalos corrigidos com sucesso!");

    } catch (error) {
        console.error("❌ Erro:", error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Executar
fixMaintenanceIntervals()
    .then(() => {
        console.log("\n🏁 Script finalizado!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Erro fatal:", error);
        process.exit(1);
    });
