import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function verify() {
    console.log("🔍 Verificando dados migrados...\n");

    try {
        // 1. Contar fixed_costs
        const costsRes = await pool.query(`SELECT COUNT(*) as count FROM fixed_costs`);
        console.log(`📊 Fixed Costs: ${costsRes.rows[0].count} registros`);

        // 2. Contar installments
        const instRes = await pool.query(`SELECT COUNT(*) as count FROM fixed_cost_installments`);
        console.log(`📊 Installments: ${instRes.rows[0].count} registros`);

        // 3. Listar os custos fixos
        const costsListRes = await pool.query(`
            SELECT fc.id, fc.name, fc.valor, fc.total_installments, v.plate
            FROM fixed_costs fc
            LEFT JOIN vehicles v ON fc.vehicle_id = v.id
            ORDER BY fc.name
        `);

        console.log(`\n📋 Custos Fixos Migrados:\n`);
        for (const cost of costsListRes.rows) {
            console.log(`   - ${cost.name} (${cost.plate || 'N/A'}): R$ ${cost.valor}/mês x ${cost.total_installments} parcelas`);
        }

        // 4. Verificar status das parcelas
        const statusRes = await pool.query(`
            SELECT status, COUNT(*) as count
            FROM fixed_cost_installments
            GROUP BY status
        `);

        console.log(`\n📊 Status das Parcelas:`);
        for (const row of statusRes.rows) {
            console.log(`   - ${row.status}: ${row.count} parcelas`);
        }

        console.log("\n✅ Verificação concluída!");
        process.exit(0);

    } catch (e) {
        console.error("❌ Erro:", e);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

verify();
