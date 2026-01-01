import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: 'postgresql://postgres:BDnSvDzpOoQcJsRPSvkZnoDfFOCCwbKR@turntable.proxy.rlwy.net:21162/railway',
    ssl: { rejectUnauthorized: false }
});

const res = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`);
console.log('Tabelas no banco Railway:');
res.rows.forEach(row => console.log('  -', row.table_name));
await pool.end();
