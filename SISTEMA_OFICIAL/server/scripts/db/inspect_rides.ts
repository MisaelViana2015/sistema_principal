import "dotenv/config";
import pkg from "pg";
const { Client } = pkg;
const SOURCE_DB_URL = "postgresql://postgres:BDnSvDzpOoQcJsRPSvkZnoDfFOCCwbKR@turntable.proxy.rlwy.net:21162/railway";
async function inspect() {
    const client = new Client({ connectionString: SOURCE_DB_URL });
    await client.connect();
    const res = await client.query("SELECT * FROM rides LIMIT 1");
    console.log("COLS RIDES:", res.fields.map(f => f.name));
    await client.end();
}
inspect();
