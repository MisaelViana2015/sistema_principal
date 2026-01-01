import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: 'postgresql://postgres:BDnSvDzpOoQcJsRPSvkZnoDfFOCCwbKR@turntable.proxy.rlwy.net:21162/railway',
    ssl: { rejectUnauthorized: false }
});

const client = await pool.connect();

try {
    console.log("📋 Adicionando coluna current_km à tabela vehicles...\n");

    // Verificar se já existe
    const exists = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'vehicles' AND column_name = 'current_km'
    `);

    if (exists.rows.length === 0) {
        await client.query(`ALTER TABLE vehicles ADD COLUMN current_km REAL DEFAULT 0`);
        console.log("✅ Coluna current_km adicionada!");

        // Copiar km_inicial para current_km
        await client.query(`UPDATE vehicles SET current_km = COALESCE(km_inicial, 0)`);
        console.log("✅ Valores iniciais copiados de km_inicial para current_km!");
    } else {
        console.log("ℹ️ Coluna current_km já existe.");
    }

    // Mostrar veículos atualizados
    const vehicles = await client.query(`SELECT plate, km_inicial, current_km FROM vehicles WHERE is_active = true`);
    console.log("\n📊 Veículos atualizados:");
    vehicles.rows.forEach(v => console.log(`   ${v.plate}: km_inicial=${v.km_inicial}, current_km=${v.current_km}`));

} finally {
    client.release();
    await pool.end();
}
