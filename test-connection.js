import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
    connectionString: 'postgresql://postgres:BDnSvDzpOoQcJsRPSvkZnoDfFOCCwbKR@turntable.proxy.rlwy.net:21162/railway',
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 15000
});

async function testConnection() {
    try {
        console.log('🔌 Tentando conectar ao banco Railway...');
        await client.connect();
        console.log('✅ Conectado com sucesso!\n');

        const result = await client.query('SELECT COUNT(*) as total FROM shifts WHERE status = $1', ['fechado']);
        console.log(`📊 Total de turnos fechados: ${result.rows[0].total}`);

        await client.end();
        console.log('\n✅ Teste concluído!');
    } catch (error) {
        console.error('❌ Erro na conexão:', error.message);
        console.error('Código:', error.code);
    }
}

testConnection();
