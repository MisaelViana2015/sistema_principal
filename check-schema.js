import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
    connectionString: 'postgresql://postgres:BDnSvDzpOoQcJsRPSvkZnoDfFOCCwbKR@turntable.proxy.rlwy.net:21162/railway',
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 15000
});

async function checkSchema() {
    try {
        console.log('🔌 Conectando ao banco Railway...');
        await client.connect();
        console.log('✅ Conectado!\n');

        // Verificar estrutura da tabela shifts
        const schemaResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'shifts'
      ORDER BY ordinal_position
    `);

        console.log('📋 Estrutura da tabela shifts:\n');
        schemaResult.rows.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type}`);
        });

        await client.end();
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

checkSchema();
