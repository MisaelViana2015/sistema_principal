import "dotenv/config";
import pkg from "pg";
import fs from "fs";
const { Client } = pkg;

const NEON_DB_URL = "postgresql://neondb_owner:npg_svFb6cjwPY5f@ep-orange-night-a6gk9al8.us-west-2.aws.neon.tech/neondb?sslmode=require";

async function fetch() {
    console.log("📦 Fetching Neon DB Data (17/12)...");
    const client = new Client({ connectionString: NEON_DB_URL });

    try {
        await client.connect();

        // Fetch Drivers for Mapping
        const drivers = (await client.query("SELECT * FROM drivers")).rows;

        // Fetch Shifts
        const start = "2025-12-17T00:00:00.000Z";
        const end = "2025-12-18T00:00:00.000Z";
        const shifts = (await client.query(`SELECT * FROM shifts WHERE inicio >= $1 AND inicio < $2`, [start, end])).rows;

        let rides: any[] = [];
        if (shifts.length > 0) {
            const shiftIds = shifts.map(s => `'${s.id}'`).join(",");
            rides = (await client.query(`SELECT * FROM rides WHERE shift_id IN (${shiftIds})`)).rows;
        }

        const data = { drivers, shifts, rides };
        fs.writeFileSync("neon_17.json", JSON.stringify(data, null, 2));
        console.log(`✅ Saved ${shifts.length} shifts and ${rides.length} rides to neon_17.json`);

    } catch (e: any) {
        console.error("❌ Error:", e.message);
    } finally {
        await client.end();
    }
}

fetch();
