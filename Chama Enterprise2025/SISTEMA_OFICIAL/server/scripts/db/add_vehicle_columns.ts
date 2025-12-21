
import { db } from "../../core/db/connection.js";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Adding columns to vehicles table...");
    try {
        // Adiciona coluna color
        await db.execute(sql`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS color text`);
        console.log("Column 'color' added (or already exists).");

        // Adiciona coluna image_url
        await db.execute(sql`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS image_url text`);
        console.log("Column 'image_url' added (or already exists).");

        console.log("✅ Update complete.");
    } catch (error) {
        console.error("❌ Error adding columns:", error);
    }
    process.exit(0);
}

main();
