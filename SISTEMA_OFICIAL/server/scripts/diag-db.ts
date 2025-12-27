
import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function main() {
    console.log("🔍 Verificando banco de dados local...");

    try {
        // Count total shifts
        const total = await pool.query('SELECT COUNT(*) FROM shifts');
        console.log(`📊 Total de turnos no DB: ${total.rows[0].count}`);

        // Count shifts before Dec 15th
        const oldShifts = await pool.query("SELECT COUNT(*) FROM shifts WHERE inicio < '2024-12-15'");
        console.log(`📅 Turnos antes de 15/12/2024: ${oldShifts.rows[0].count}`);

        // Count shifts after Dec 15th
        const newShifts = await pool.query("SELECT COUNT(*) FROM shifts WHERE inicio >= '2024-12-15'");
        console.log(`📅 Turnos depois de 15/12/2024: ${newShifts.rows[0].count}`);

        // List a few sample dates
        const sample = await pool.query("SELECT inicio FROM shifts ORDER BY inicio ASC LIMIT 5");
        console.log("🗓️  Amostra de datas (5 primeiras):");
        sample.rows.forEach(r => console.log(`   - ${r.inicio}`));

    } catch (err) {
        console.error("❌ Erro:", err);
    } finally {
        await pool.end();
    }
}

main();
