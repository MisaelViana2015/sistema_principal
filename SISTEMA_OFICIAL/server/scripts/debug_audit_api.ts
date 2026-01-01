
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../../shared/schema";
import { auditLogs } from "../../shared/schema";

const { Pool } = pg;
const CONNECTION_STRING = "postgresql://postgres:QGtJKrxgQqoPYFDQraMZyXdBJxeuJuIM@crossover.proxy.rlwy.net:50382/railway";

async function main() {
    console.log("🔍 Debug API: Testando consulta de logs...");

    const pool = new Pool({
        connectionString: CONNECTION_STRING,
        ssl: { rejectUnauthorized: false }
    });

    const db = drizzle(pool, { schema });

    try {
        console.log("Querying logs...");
        // Tenta query básica igual ao controller
        const logs = await db.select().from(auditLogs).limit(5);

        console.log("✅ Query Sucesso!");
        console.log("Registros encontrados:", logs.length);
        if (logs.length > 0) {
            console.log("Exemplo:", logs[0]);
        }
    } catch (error: any) {
        console.error("❌ ERRO NA QUERY:", error);
        console.error("Detalhes:", error.message);
    } finally {
        await pool.end();
    }
}

main();
