import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

async function testConnection() {
    console.log('🔍 Testando conexão com Railway PostgreSQL...\n');

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        const client = await pool.connect();
        console.log('✅ Conexão estabelecida com sucesso!');

        const result = await client.query('SELECT NOW()');
        console.log('✅ Teste de query bem-sucedido:', result.rows[0].now);

        // Verifica se as tabelas existem
        const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

        console.log('\n📋 Tabelas existentes no banco:');
        tables.rows.forEach(row => console.log(`   - ${row.table_name}`));

        client.release();
        await pool.end();

        console.log('\n✅ Teste completo!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro na conexão:', error.message);
        await pool.end();
        process.exit(1);
    }
}

testConnection();
