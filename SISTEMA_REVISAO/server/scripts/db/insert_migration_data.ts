import "dotenv/config";
import pkg from "pg";
import fs from "fs";
import path from "path";

const { Client } = pkg;
const TARGET_DB_URL = process.env.DATABASE_URL;

if (!TARGET_DB_URL) {
    console.error("❌ DATABASE_URL missing.");
    process.exit(1);
}

async function insert() {
    console.log("💾 Loading Migration Data...");
    const data = JSON.parse(fs.readFileSync("migration_data.json", "utf-8"));
    const { drivers: sourceDrivers, shifts: sourceShifts, rides: sourceRides } = data;

    console.log(`   Loaded: ${sourceShifts.length} shifts, ${sourceRides.length} rides.`);

    const target = new Client({ connectionString: TARGET_DB_URL });

    try {
        console.log("   Connecting to Target...");
        await target.connect();
        console.log("   ✅ Connected!");

        // Map Drivers
        const tgtDrivers = (await target.query("SELECT * FROM drivers")).rows;

        console.log("   Target Driver Check:", tgtDrivers[0]);
        console.log("   Source Driver Check:", sourceDrivers[0]);

        const driverMap = new Map<string, string>();

        for (const srcD of sourceDrivers) {
            const sName = (srcD.nome || srcD.name || "").trim().toLowerCase();
            const match = tgtDrivers.find(t => (t.name || t.nome || "").trim().toLowerCase() === sName);

            if (match) driverMap.set(srcD.id, match.id);
        }

        let addedShifts = 0;
        let addedRides = 0;
        let skipped = 0;

        for (const s of sourceShifts) {
            const newDriverId = driverMap.get(s.driver_id);
            if (!newDriverId) {
                console.log(`   Skipping Shift ${s.id} (Driver unmapped)`);
                continue;
            }

            // Check Dup
            // Using a slightly wider window to be safe given timezone quirks
            const dup = await target.query(`
                SELECT id FROM shifts
                WHERE driver_id = $1
                AND inicio >= $2::timestamp - interval '2 minutes'
                AND inicio <= $2::timestamp + interval '2 minutes'
            `, [newDriverId, s.inicio]);

            if (dup.rows.length > 0) {
                skipped++;
                console.log(`   ⚠️ Skipped ${s.inicio} (Exists)`);
                continue;
            }

            const res = await target.query(`
                INSERT INTO shifts (
                    driver_id, vehicle_id, inicio, fim,
                    km_inicial, km_final, status,
                    total_app, total_particular, total_bruto,
                    total_custos, liquido, repasse_empresa, repasse_motorista,
                    total_corridas, duracao_min, valor_km
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                RETURNING id
            `, [
                newDriverId, s.vehicle_id, s.inicio, s.fim, s.km_inicial, s.km_final, s.status,
                s.total_app, s.total_particular, s.total_bruto, s.total_custos || 0, s.liquido,
                s.repasse_empresa, s.repasse_motorista, s.total_corridas, s.duracao_min || 0, s.valor_km || 0
            ]);

            const newShiftId = res.rows[0].id;
            addedShifts++;
            console.log(`   ✅ Added Shift: ${s.inicio}`);

            const myRides = sourceRides.filter((r: any) => r.shift_id === s.id);
            for (const r of myRides) {
                await target.query(`
                    INSERT INTO rides (shift_id, tipo, valor, hora)
                    VALUES ($1, $2, $3, $4)
                `, [newShiftId, r.tipo, r.valor, r.hora]);
            }
            addedRides += myRides.length;
        }

        console.log(`\n🎉 MIGRATION FINISHED!`);
        console.log(`   Shifts Added: ${addedShifts}`);
        console.log(`   Shifts Skipped: ${skipped}`);
        console.log(`   Rides Added: ${addedRides}`);

    } catch (e: any) {
        console.error("❌ Insert Error:", e.message);
    } finally {
        await target.end();
    }
}

insert();
