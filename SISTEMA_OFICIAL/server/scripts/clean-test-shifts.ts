
import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function main() {
    console.log("🧹 Limpando dados de teste...");

    try {
        // Deletar os turnos criados pelo seed-raw.ts
        const res = await pool.query(`
            DELETE FROM shifts 
            WHERE inicio IN ('2024-11-01 08:00:00', '2024-12-20 08:00:00')
        `);

        console.log(`✅ ${res.rowCount} turnos de teste removidos.`);

    } catch (err) {
        console.error("❌ Erro ao limpar:", err);
    } finally {
        await pool.end();
    }
}

main();
