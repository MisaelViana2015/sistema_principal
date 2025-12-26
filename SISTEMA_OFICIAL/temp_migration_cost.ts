
import { db } from "./server/core/db/connection.js";
import { sql } from "drizzle-orm";

async function migrate() {
    try {
        console.log("Adding cost column to tires table...");
        await db.execute(sql`ALTER TABLE tires ADD COLUMN IF NOT EXISTS cost NUMERIC(10, 2) DEFAULT 0;`);
        console.log("Migration successful!");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
