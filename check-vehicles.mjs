import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: 'postgresql://postgres:BDnSvDzpOoQcJsRPSvkZnoDfFOCCwbKR@turntable.proxy.rlwy.net:21162/railway',
    ssl: { rejectUnauthorized: false }
});

// Verificar colunas da tabela vehicles
const res = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'vehicles' ORDER BY ordinal_position`);
console.log('Colunas da tabela vehicles:');
res.rows.forEach(row => console.log('  -', row.column_name));
await pool.end();
