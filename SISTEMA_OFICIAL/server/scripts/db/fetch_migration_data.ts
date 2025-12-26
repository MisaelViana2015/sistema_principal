import "dotenv/config";
import pkg from "pg";
import fs from "fs";
import path from "path";

const { Client } = pkg;
const START_DATE_ISO = "2025-12-16T00:00:00.000Z";
const SOURCE_DB_URL = "postgresql://postgres:BDnSvDzpOoQcJsRPSvkZnoDfFOCCwbKR@turntable.proxy.rlwy.net:21162/railway";

async function fetch() {
    console.log("📦 Fetching Data from Source...");
    const client = new Client({ connectionString: SOURCE_DB_URL });

    try {
        await client.connect();
        const drivers = (await client.query("SELECT * FROM drivers")).rows;
        const shifts = (await client.query(`SELECT * FROM shifts WHERE inicio >= $1 ORDER BY inicio ASC`, [START_DATE_ISO])).rows;

        let rides: any[] = [];
        if (shifts.length > 0) {
            const shiftIds = shifts.map(s => `'${s.id}'`).join(",");
            rides = (await client.query(`SELECT * FROM rides WHERE shift_id IN (${shiftIds})`)).rows;
        }

        const data = { drivers, shifts, rides };
        fs.writeFileSync("migration_data.json", JSON.stringify(data, null, 2));
        console.log(`✅ Saved ${shifts.length} shifts and ${rides.length} rides to migration_data.json`);

    } catch (e: any) {
        console.error("❌ Error:", e.message);
    } finally {
        await client.end();
    }
}

fetch();
