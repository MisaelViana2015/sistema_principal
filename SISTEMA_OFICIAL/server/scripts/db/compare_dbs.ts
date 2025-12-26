import "dotenv/config";
import pkg from "pg";
import path from "path";
import dotenv from "dotenv";

// Load Target (Prod)
dotenv.config({ path: path.resolve(process.cwd(), ".env.backup") });
// If not in .env.backup, try normal .env (but we know we set up backup)
const TARGET_DB_URL = process.env.DATABASE_URL;

const SOURCE_DB_URL = "postgresql://postgres:BDnSvDzpOoQcJsRPSvkZnoDfFOCCwbKR@turntable.proxy.rlwy.net:21162/railway";
const { Client } = pkg;

async function compare() {
    console.log("🕵️ Comparing Databases for Merge Compatibility...");

    const source = new Client({ connectionString: SOURCE_DB_URL });
    const target = new Client({ connectionString: TARGET_DB_URL });

    try {
        await source.connect();
        await target.connect();

        // 1. Compare Drivers
        const srcDrivers = (await source.query("SELECT id, nome FROM drivers")).rows;
        const tgtDrivers = (await target.query("SELECT id, nome FROM drivers")).rows;

        console.log(`\n🚙 DRIVERS CHECK:`);
        console.log(`Source: ${srcDrivers.length} | Target: ${tgtDrivers.length}`);

        // Find matching names
        for (const srcD of srcDrivers) {
            const matchName = tgtDrivers.find(t => t.nome === srcD.nome);
            if (matchName) {
                if (matchName.id === srcD.id) {
                    console.log(`✅ [MATCH] ${srcD.nome} (ID Identical)`);
                } else {
                    console.log(`⚠️ [DIFF ID] ${srcD.nome} (Source: ${srcD.id} | Target: ${matchName.id}) -> NEEDS REMAP`);
                }
            } else {
                console.log(`❌ [MISSING] ${srcD.nome} not found in Target`);
            }
        }

        // 2. Compare Vehicles
        console.log(`\n🚗 VEHICLES CHECK:`);
        const srcVehicles = (await source.query("SELECT id, plate FROM vehicles")).rows;
        const tgtVehicles = (await target.query("SELECT id, plate FROM vehicles")).rows;

        for (const srcV of srcVehicles) {
            const matchPlate = tgtVehicles.find(t => t.plate === srcV.plate);
            if (matchPlate) {
                if (matchPlate.id === srcV.id) {
                    console.log(`✅ [MATCH] ${srcV.plate} (ID Identical)`);
                } else {
                    console.log(`⚠️ [DIFF ID] ${srcV.plate} (Source: ${srcV.id} | Target: ${matchPlate.id}) -> NEEDS REMAP`);
                }
            } else {
                console.log(`❌ [MISSING] ${srcV.plate} not found in Target`);
            }
        }

        // 3. Check Volume to Import
        const start = "2025-12-18T00:00:00.000Z";
        const res = await source.query("SELECT count(*) as qtd FROM shifts WHERE inicio >= $1", [start]);
        const resRides = await source.query("SELECT count(*) as qtd FROM rides WHERE timestamp >= $1", [start]);

        console.log(`\n📦 DATA TO IMPORT (Since 18/12):`);
        console.log(`- Connects to ${res.rows[0].qtd} shifts`);
        console.log(`- Connects to ${resRides.rows[0].qtd} rides`);

    } catch (err: any) {
        console.error("Error:", err.message);
    } finally {
        await source.end();
        await target.end();
    }
}

compare();
