
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: 'postgresql://postgres:BDnSvDzpOoQcJsRPSvkZnoDfFOCCwbKR@turntable.proxy.rlwy.net:21162/railway',
    ssl: { rejectUnauthorized: false }
});

async function updateName() {
    console.log("🛠️ Corrigindo nome da configuração...");
    const client = await pool.connect();

    try {
        await client.query(`
            UPDATE maintenance_configs 
            SET name = 'Revisão Periódica' 
            WHERE name LIKE '%Revisão%'
        `);
        console.log("✅ Nome atualizado para 'Revisão Periódica' (removeu Óleo/Filtros)");
    } finally {
        client.release();
        await pool.end();
    }
}

updateName();
