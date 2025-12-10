
import { db } from "../../core/db/connection.js";
import { drivers } from "../../../shared/schema.js";
import { eq } from "drizzle-orm";

async function verify() {
    try {
        console.log("🔍 Verificando usuário Misael no banco de dados...");

        const result = await db.select().from(drivers).where(eq(drivers.email, 'programacao1215@hotmail.com'));

        if (result.length > 0) {
            console.log("✅ Usuário ENCONTRADO:");
            console.log(JSON.stringify(result[0], null, 2));
        } else {
            console.error("❌ Usuário NÃO encontrado!");
        }

        process.exit(0);
    } catch (error) {
        console.error("Erro na verificação:", error);
        process.exit(1);
    }
}

verify();
