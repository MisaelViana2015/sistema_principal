import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: 'postgresql://postgres:BDnSvDzpOoQcJsRPSvkZnoDfFOCCwbKR@turntable.proxy.rlwy.net:21162/railway',
    ssl: { rejectUnauthorized: false }
});

const client = await pool.connect();

try {
    console.log("📋 Inicializando manutenções para veículos existentes...\n");

    const vehiclesRes = await client.query(`SELECT id, plate, km_inicial FROM vehicles WHERE is_active = true`);
    const configsRes = await client.query(`SELECT id, name, interval_km FROM maintenance_configs WHERE is_active = true`);

    console.log(`Veículos ativos: ${vehiclesRes.rows.length}`);
    console.log(`Configs de manutenção: ${configsRes.rows.length}\n`);

    let initialized = 0;
    for (const v of vehiclesRes.rows) {
        for (const c of configsRes.rows) {
            const exists = await client.query(`
                SELECT id FROM vehicle_maintenances 
                WHERE vehicle_id = $1 AND config_id = $2
            `, [v.id, c.id]);

            if (exists.rows.length === 0) {
                const currentKm = v.km_inicial || 0;
                const nextKm = currentKm + c.interval_km;
                await client.query(`
                    INSERT INTO vehicle_maintenances (vehicle_id, config_id, last_performed_km, next_due_km, status, last_performed_at)
                    VALUES ($1, $2, $3, $4, 'ok', NOW())
                `, [v.id, c.id, currentKm, nextKm]);
                console.log(`  ✅ ${v.plate}: ${c.name} → próxima em ${nextKm.toLocaleString()} km`);
                initialized++;
            }
        }
    }

    console.log(`\n✅ ${initialized} registros de manutenção inicializados!`);

    // Mostrar resumo
    console.log("\n📊 Resumo das configurações:");
    const summary = await client.query(`SELECT name, interval_km FROM maintenance_configs`);
    summary.rows.forEach(c => console.log(`   - ${c.name}: a cada ${c.interval_km.toLocaleString()} km`));

} finally {
    client.release();
    await pool.end();
}
