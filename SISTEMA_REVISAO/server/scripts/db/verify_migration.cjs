
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function verify() {
    console.log("🔍 Verificando PRODUÇÃO...\n");
    await client.connect();

    try {
        // 1. Contar fixed_costs
        const costsRes = await client.query(`SELECT COUNT(*) as count FROM fixed_costs`);
        console.log(`📊 Fixed Costs: ${costsRes.rows[0].count} registros`);

        // 2. Contar installments
        const instRes = await client.query(`SELECT COUNT(*) as count FROM fixed_cost_installments`);
        console.log(`📊 Installments: ${instRes.rows[0].count} registros`);

        // 3. Listar os custos fixos
        const costsListRes = await client.query(`
            SELECT fc.id, fc.name, fc.valor, fc.total_installments, v.plate
            FROM fixed_costs fc
            LEFT JOIN vehicles v ON fc.vehicle_id = v.id
            ORDER BY fc.name
        `);

        console.log(`\n📋 Custos Fixos em Produção:\n`);
        for (const cost of costsListRes.rows) {
            console.log(`   - ${cost.name} (${cost.plate || 'N/A'}): R$ ${cost.valor}/mês x ${cost.total_installments} parcelas`);
        }

        console.log("\n✅ Verificação OK!");

    } catch (e) {
        console.error("❌ Erro:", e);
    } finally {
        await client.end();
    }
}

verify();
