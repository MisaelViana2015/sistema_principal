import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: 'postgresql://postgres:BDnSvDzpOoQcJsRPSvkZnoDfFOCCwbKR@turntable.proxy.rlwy.net:21162/railway',
    ssl: { rejectUnauthorized: false }
});

const client = await pool.connect();

try {
    console.log("🔍 Investigação Profunda TQU0H17...\n");

    // Buscar ID do veículo pela placa (assumindo TQU0H17 da imagem)
    const vehicle = await client.query(`SELECT id, plate, current_km FROM vehicles WHERE plate LIKE '%TQU0H17%'`);
    if (vehicle.rows.length === 0) {
        console.log("❌ Veículo TQU0H17 não encontrado!");
    } else {
        const v = vehicle.rows[0];
        console.log(`🚗 Veículo: ${v.plate} (ID: ${v.id}) | KM Atual: ${v.current_km}`);

        // Buscar TODAS as manutenções vinculadas
        const maintenances = await client.query(`
            SELECT vm.id, mc.name, mc.interval_km, vm.next_due_km, vm.last_performed_km
            FROM vehicle_maintenances vm
            JOIN maintenance_configs mc ON vm.config_id = mc.id
            WHERE vm.vehicle_id = $1
        `, [v.id]);

        console.log("\n📋 Manutenções Vinculadas:");
        maintenances.rows.forEach(m => {
            console.log(`   - Config: "${m.name}" (Intervalo: ${m.interval_km})`);
            console.log(`     Next Due: ${m.next_due_km} | Last: ${m.last_performed_km}`);
            console.log(`     Diff (Next - Current): ${m.next_due_km - v.current_km}`);
        });
    }

    console.log("\n📋 Todas Configs Disponíveis:");
    const separateConfigs = await client.query(`SELECT id, name, interval_km FROM maintenance_configs`);
    separateConfigs.rows.forEach(c => console.log(`   [${c.id}] ${c.name}`));

} finally {
    client.release();
    await pool.end();
}
