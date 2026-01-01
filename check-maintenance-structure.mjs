import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: 'postgresql://postgres:BDnSvDzpOoQcJsRPSvkZnoDfFOCCwbKR@turntable.proxy.rlwy.net:21162/railway',
    ssl: { rejectUnauthorized: false }
});

// Verificar estrutura das tabelas de manutenção
console.log('=== ESTRUTURA DA TABELA maintenances ===');
const res1 = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'maintenances' ORDER BY ordinal_position`);
res1.rows.forEach(row => console.log(`  ${row.column_name}: ${row.data_type}`));

console.log('\n=== ESTRUTURA DA TABELA preventive_maintenances ===');
const res2 = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'preventive_maintenances' ORDER BY ordinal_position`);
res2.rows.forEach(row => console.log(`  ${row.column_name}: ${row.data_type}`));

console.log('\n=== ALGUNS DADOS DE preventive_maintenances ===');
const res3 = await pool.query(`SELECT * FROM preventive_maintenances LIMIT 5`);
console.log(res3.rows);

await pool.end();
