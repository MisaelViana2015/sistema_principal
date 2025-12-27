
import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function main() {
    console.log("Iniciando Seed (Modo Raw SQL)...");

    try {
        // 1. Pegar IDs
        const driverRes = await pool.query('SELECT id FROM drivers LIMIT 1');
        const vehicleRes = await pool.query('SELECT id FROM vehicles LIMIT 1');

        if (driverRes.rows.length === 0 || vehicleRes.rows.length === 0) {
            console.error("❌ Erro: Precisa de driver/veiculo.");
            process.exit(1);
        }

        const driverId = driverRes.rows[0].id;
        const vehicleId = vehicleRes.rows[0].id;

        // 2. Inserir Turno Antigo (60/40)
        await pool.query(`
            INSERT INTO shifts (
                id, driver_id, vehicle_id, status, inicio, fim, 
                km_inicial, km_final, total_bruto, total_app, total_particular, 
                total_custos, liquido, repasse_empresa, repasse_motorista
            ) VALUES (
                gen_random_uuid(), $1, $2, 'concluido', '2024-11-01 08:00:00', '2024-11-01 18:00:00',
                1000, 1200, 200, 100, 100, 
                0, 200, 120, 80
            )
        `, [driverId, vehicleId]);
        console.log("✅ Turno Antigo Inserido (2024-11-01) - 60/40");

        // 3. Inserir Turno Novo (50/50)
        await pool.query(`
            INSERT INTO shifts (
                id, driver_id, vehicle_id, status, inicio, fim, 
                km_inicial, km_final, total_bruto, total_app, total_particular, 
                total_custos, liquido, repasse_empresa, repasse_motorista
            ) VALUES (
                gen_random_uuid(), $1, $2, 'concluido', '2024-12-20 08:00:00', '2024-12-20 18:00:00',
                2000, 2200, 300, 150, 150, 
                0, 300, 150, 150
            )
        `, [driverId, vehicleId]);
        console.log("✅ Turno Novo Inserido (2024-12-20) - 50/50");

    } catch (err) {
        console.error("❌ Erro:", err);
    } finally {
        await pool.end();
    }
}

main();
