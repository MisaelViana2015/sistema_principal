
import { db } from "../core/db/connection.js";
import { sql } from "drizzle-orm";

async function checkAuditLogs() {
    console.log("🔍 Checking latest 20 audit logs in DB...");
    try {
        const logs = await db.execute(sql`
            SELECT 
                created_at, 
                action, 
                entity, 
                actor_type, 
                actor_id, 
                source 
            FROM audit_logs 
            ORDER BY created_at DESC 
            LIMIT 20
        `);

        console.table(logs.rows.map(row => ({
            time: new Date(row.created_at).toLocaleString('pt-BR'),
            action: row.action,
            entity: row.entity,
            actor: `${row.actor_type} (${row.actor_id})`,
            source: row.source
        })));

    } catch (error) {
        console.error("❌ Error querying audit logs:", error);
    }
    process.exit(0);
}

checkAuditLogs();
