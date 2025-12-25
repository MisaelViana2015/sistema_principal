import "dotenv/config";
import pkg from "pg";
const { Client } = pkg;

const SOURCE_DB_URL = "postgresql://postgres:BDnSvDzpOoQcJsRPSvkZnoDfFOCCwbKR@turntable.proxy.rlwy.net:21162/railway";

async function inspectSchema() {
    const client = new Client({ connectionString: SOURCE_DB_URL });
    try {
        await client.connect();

        // Peek columns for SHIFTS
        const res = await client.query("SELECT * FROM shifts LIMIT 1");
        console.log("DATA SHIFTS:", res.rows[0]);
        console.log("COLS SHIFTS:", res.fields.map(f => f.name));

    } catch (err: any) {
        console.error(err);
    } finally {
        await client.end();
    }
}

inspectSchema();
