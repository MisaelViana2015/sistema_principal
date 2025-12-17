
import "dotenv/config";
import { db } from "../../../core/db/connection.js";
import { drivers } from "../../../../shared/schema.js";
import { hashPassword } from "../../../core/security/hash.js";
import { eq } from "drizzle-orm";

async function seedFix() {
    try {
        console.log("🌱 SEED FIX - Criando usuário Misael (programacao1215)...");

        const email = "programacao1215@hotmail.com";
        const passwordPlain = "senha123";

        // Verifica se já existe
        const existing = await db
            .select()
            .from(drivers)
            .where(eq(drivers.email, email))
            .limit(1);

        if (existing.length > 0) {
            console.log("✅ Usuário Misael já existe!", existing[0].id);
            process.exit(0);
        }

        const hashedPassword = await hashPassword(passwordPlain);

        const [newUser] = await db
            .insert(drivers)
            .values({
                nome: "Misael Viana",
                email: email,
                senha: hashedPassword,
                role: "admin",
                isActive: true,
            })
            .returning();

        console.log("✅ Usuário Misael criado com sucesso!");
        console.log(`ID: ${newUser.id}`);
        console.log(`Email: ${newUser.email}`);
        process.exit(0);

    } catch (error) {
        console.error("❌ Erro ao criar usuário:", error);
        process.exit(1);
    }
}

seedFix();
