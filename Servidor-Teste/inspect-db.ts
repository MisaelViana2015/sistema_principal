
import "dotenv/config";
import { db } from "./server/core/db/connection.js";
import { sql } from "drizzle-orm";

async function inspect() {
    try {
        console.log("Inspecting 'drivers' table...");
        const res = await db.execute(sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'drivers'`);
        console.table(res.rows);
        process.exit(0);
    } catch (e) {
        console.error("Error inspecting DB:", e);
        process.exit(1);
    }
}

inspect();
