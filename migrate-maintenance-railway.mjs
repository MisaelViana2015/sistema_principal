/**
 * Script para criar tabelas de manutenção e configurar intervalos
 * - Cria maintenance_configs com Revisão (20.000 km) e Pneus (5.000 km)
 * - Cria vehicle_maintenances para rastrear status por veículo
 */

import pkg from 'pg';
const { Pool } = pkg;

const DATABASE_URL = 'postgresql://postgres:BDnSvDzpOoQcJsRPSvkZnoDfFOCCwbKR@turntable.proxy.rlwy.net:21162/railway';

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log("🚀 Iniciando migração do sistema de manutenção...\n");

    const client = await pool.connect();

    try {
        // 1. Criar tabela maintenance_configs
        console.log("📋 Criando tabela maintenance_configs...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS maintenance_configs (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
                name TEXT NOT NULL,
                interval_km INTEGER NOT NULL,
                is_active BOOLEAN DEFAULT true
            )
        `);
        console.log("   ✅ Tabela maintenance_configs criada");

        // 2. Inserir configs padrão (se não existirem)
        console.log("📋 Inserindo configurações padrão...");

        // Revisão
        const existsRevisao = await client.query(`SELECT id FROM maintenance_configs WHERE name ILIKE '%Revisão%' LIMIT 1`);
        if (existsRevisao.rows.length === 0) {
            await client.query(`
                INSERT INTO maintenance_configs (name, interval_km, is_active)
                VALUES ('Revisão Periódica (Óleo/Filtros)', 20000, true)
            `);
            console.log("   ✅ Revisão Periódica: 20.000 km");
        } else {
            await client.query(`UPDATE maintenance_configs SET interval_km = 20000 WHERE name ILIKE '%Revisão%'`);
            console.log("   ✅ Revisão Periódica atualizada para 20.000 km");
        }

        // Pneus
        const existsPneus = await client.query(`SELECT id FROM maintenance_configs WHERE name ILIKE '%Pneu%' OR name ILIKE '%Rodízio%' LIMIT 1`);
        if (existsPneus.rows.length === 0) {
            await client.query(`
                INSERT INTO maintenance_configs (name, interval_km, is_active)
                VALUES ('Rodízio de Pneus', 5000, true)
            `);
            console.log("   ✅ Rodízio de Pneus: 5.000 km");
        } else {
            await client.query(`UPDATE maintenance_configs SET interval_km = 5000 WHERE name ILIKE '%Pneu%' OR name ILIKE '%Rodízio%'`);
            console.log("   ✅ Rodízio de Pneus atualizado para 5.000 km");
        }

        // 3. Criar tabela vehicle_maintenances
        console.log("\n📋 Criando tabela vehicle_maintenances...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS vehicle_maintenances (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
                vehicle_id VARCHAR NOT NULL REFERENCES vehicles(id),
                config_id VARCHAR NOT NULL REFERENCES maintenance_configs(id),
                last_performed_at TIMESTAMP,
                last_performed_km REAL DEFAULT 0,
                next_due_km REAL NOT NULL,
                status TEXT DEFAULT 'ok'
            )
        `);
        console.log("   ✅ Tabela vehicle_maintenances criada");

        // 4. Verificar configs finais
        console.log("\n📊 Configurações atuais:");
        const configs = await client.query(`SELECT name, interval_km FROM maintenance_configs`);
        configs.rows.forEach(c => console.log(`   - ${c.name}: ${c.interval_km.toLocaleString()} km`));

        console.log("\n✅ Migração concluída com sucesso!");

        // 5. Inicializar registros para todos os veículos
        console.log("\n📋 Inicializando manutenções para veículos existentes...");

        const vehiclesRes = await client.query(`SELECT id, plate, current_km FROM vehicles WHERE is_active = true`);
        const configsRes = await client.query(`SELECT id, interval_km FROM maintenance_configs WHERE is_active = true`);

        let initialized = 0;
        for (const v of vehiclesRes.rows) {
            for (const c of configsRes.rows) {
                const exists = await client.query(`
                    SELECT id FROM vehicle_maintenances 
                    WHERE vehicle_id = $1 AND config_id = $2
                `, [v.id, c.id]);

                if (exists.rows.length === 0) {
                    const currentKm = v.current_km || 0;
                    await client.query(`
                        INSERT INTO vehicle_maintenances (vehicle_id, config_id, last_performed_km, next_due_km, status, last_performed_at)
                        VALUES ($1, $2, $3, $4, 'ok', NOW())
                    `, [v.id, c.id, currentKm, currentKm + c.interval_km]);
                    initialized++;
                }
            }
        }
        console.log(`   ✅ ${initialized} registros de manutenção inicializados`);

    } catch (error) {
        console.error("❌ Erro:", error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

migrate()
    .then(() => {
        console.log("\n🏁 Script finalizado!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Erro fatal:", error);
        process.exit(1);
    });
