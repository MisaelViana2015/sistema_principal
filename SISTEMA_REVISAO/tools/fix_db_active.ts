
import { db } from "../../server/core/db/connection.js";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Iniciando migração de emergência...");
    try {
        await db.execute(sql`ALTER TABLE cost_types ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true`);
        console.log("SUCESSO: Coluna 'is_active' adicionada/verificada em 'cost_types'.");

        // Verifica se vehicles também tem isActive (já deveria ter pelo schema, mas por segurança)
        // await db.execute(sql`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true`);
        // console.log("Verificado vehicles.is_active");

        process.exit(0);
    } catch (error) {
        console.error("ERRO na migração:", error);
        process.exit(1);
    }
}

main();
