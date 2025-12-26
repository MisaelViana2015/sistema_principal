import "dotenv/config";
import pkg from "pg";
const { Client } = pkg;

// --- CONFIG ---
const START_DATE_ISO = "2025-12-16T00:00:00.000Z";
const SOURCE_DB_URL = "postgresql://postgres:BDnSvDzpOoQcJsRPSvkZnoDfFOCCwbKR@turntable.proxy.rlwy.net:21162/railway";
const TARGET_DB_URL = process.env.DATABASE_URL;

if (!TARGET_DB_URL) {
    console.error("❌ DATABASE_URL is missing from environment.");
    process.exit(1);
}

async function migrate() {
    console.log("🚀 STARTING MIGRATION (Revised)...");

    // PHASE 1: SOURCE
    console.log("📦 Reading from Source...");
    const source = new Client({ connectionString: SOURCE_DB_URL });
    let sourceDrivers: any[] = [];
    let sourceShifts: any[] = [];
    let sourceRides: any[] = [];

    try {
        await source.connect();
        sourceDrivers = (await source.query("SELECT * FROM drivers")).rows;
        sourceShifts = (await source.query(`SELECT * FROM shifts WHERE inicio >= $1 ORDER BY inicio ASC`, [START_DATE_ISO])).rows;
        console.log(`   Source: ${sourceShifts.length} shifts.`);

        if (sourceShifts.length > 0) {
            const shiftIds = sourceShifts.map(s => `'${s.id}'`).join(",");
            sourceRides = (await source.query(`SELECT * FROM rides WHERE shift_id IN (${shiftIds})`)).rows;
            console.log(`   Source: ${sourceRides.length} rides.`);
        }
    } catch (e: any) {
        console.error("❌ Source Error:", e.message);
        return;
    } finally {
        await source.end();
    }

    // PHASE 2: TARGET
    console.log("\n💾 Writing to Target...");
    let target = new Client({ connectionString: TARGET_DB_URL });

    // Retry Connection Logic
    let connected = false;
    for (let i = 1; i <= 5; i++) {
        try {
            console.log(`   Connecting Target (Attempt ${i})...`);
            target = new Client({ connectionString: TARGET_DB_URL }); // Fresh instance
            await target.connect();
            connected = true;
            break;
        } catch (e: any) {
            console.warn(`   Retry ${i}: ${e.message}`);
            await new Promise(r => setTimeout(r, 2000));
        }
    }

    if (!connected) {
        console.error("❌ Could not connect to Target.");
        return;
    }

    try {
        const tgtDrivers = (await target.query("SELECT * FROM drivers")).rows;
        const driverMap = new Map<string, string>();

        // Map Drivers
        for (const srcD of sourceDrivers) {
            const match = tgtDrivers.find(t => t.name.trim().toLowerCase() === srcD.nome.trim().toLowerCase());
            if (match) driverMap.set(srcD.id, match.id);
        }

        let addedShifts = 0;
        let addedRides = 0;

        for (const s of sourceShifts) {
            const newDriverId = driverMap.get(s.driver_id);
            if (!newDriverId) continue;

            // Check Duplicate
            const dup = await target.query(`
                SELECT id FROM shifts 
                WHERE driver_id = $1 
                AND inicio BETWEEN $2::timestamp - interval '1 minute' AND $2::timestamp + interval '1 minute'
            `, [newDriverId, s.inicio]);

            if (dup.rows.length > 0) continue;

            // Insert Shift
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
            console.log(`   + Shift ${s.inicio}`);

            // Insert Rides
            const myRides = sourceRides.filter(r => r.shift_id === s.id);
            for (const r of myRides) {
                await target.query(`
                    INSERT INTO rides (shift_id, tipo, valor, hora)
                    VALUES ($1, $2, $3, $4)
                `, [newShiftId, r.tipo, r.valor, r.hora]);
            }
            addedRides += myRides.length;
        }

        console.log(`\n🎉 DONE! Added ${addedShifts} shifts and ${addedRides} rides.`);

    } catch (e: any) {
        console.error("❌ Target Error:", e.message);
    } finally {
        await target.end();
    }
}

migrate().catch(e => console.error("FATAL:", e));
