
import "dotenv/config";
import { db } from "../core/db/connection.js";
import { sql } from "drizzle-orm";

async function listTables() {
    try {
        const result = await db.execute(sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        `);
        console.log("📋 Tabelas:", result.rows.map(r => r.table_name).join(", "));
    } catch (error) {
        console.error(error);
    }
    process.exit(0);
}

listTables();
