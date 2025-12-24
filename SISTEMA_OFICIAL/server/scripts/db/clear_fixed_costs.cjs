
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function clearData() {
    console.log("🧹 Limpando APENAS dados de Custos Fixos (Análise > Custos Fixos) em PRODUÇÃO...");
    console.log("   - Tabela: fixed_costs");
    console.log("   - Tabela: fixed_cost_installments");

    await client.connect();

    try {
        await client.query(`TRUNCATE TABLE fixed_cost_installments, fixed_costs CASCADE;`);
        console.log("✅ Dados removidos com sucesso! A aba 'Custos Fixos' deve estar vazia agora.");
    } catch (e) {
        console.error("❌ Erro ao limpar dados:", e);
    } finally {
        await client.end();
    }
}

clearData();
