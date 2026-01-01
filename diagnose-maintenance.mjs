import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: 'postgresql://postgres:BDnSvDzpOoQcJsRPSvkZnoDfFOCCwbKR@turntable.proxy.rlwy.net:21162/railway',
    ssl: { rejectUnauthorized: false }
});

const client = await pool.connect();

try {
    console.log("🔍 Diagnóstico de Manutenção...\n");

    // 1. Configs
    console.log("📋 Tabela: maintenance_configs");
    const configs = await client.query(`SELECT id, name, interval_km FROM maintenance_configs`);
    configs.rows.forEach(c => console.log(`   [${c.id}] ${c.name} (${c.interval_km} km)`));

    // 2. Registros de Manutenção
    console.log("\n📋 Tabela: vehicle_maintenances (Top 10)");
    const recs = await client.query(`
        SELECT vm.id, v.plate, mc.name, vm.last_performed_km, vm.next_due_km, vm.status 
        FROM vehicle_maintenances vm
        JOIN vehicles v ON vm.vehicle_id = v.id
        JOIN maintenance_configs mc ON vm.config_id = mc.id
        ORDER BY vm.last_performed_at DESC
        LIMIT 10
    `);

    recs.rows.forEach(r => {
        console.log(`   Veículo ${r.plate} | ${r.name}`);
        console.log(`      Última: ${r.last_performed_km} km | Próxima: ${r.next_due_km} km | Status: ${r.status}`);
    });

} finally {
    client.release();
    await pool.end();
}
