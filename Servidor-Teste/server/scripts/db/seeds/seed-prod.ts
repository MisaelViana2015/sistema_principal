
import "dotenv/config";
import { db } from "../../../core/db/connection.js";
import { drivers } from "../../../../shared/schema.js";
import { hashPassword } from "../../../core/security/hash.js";
import { eq } from "drizzle-orm";

async function seedProd() {
    try {
        console.log("🌱 SEED PROD - Iniciando criação de Admin...");

        // Verifica se admin já existe
        const existingAdmin = await db
            .select()
            .from(drivers)
            .where(eq(drivers.email, "admin@rotaverde.com"))
            .limit(1);

        if (existingAdmin.length > 0) {
            console.log("✅ Admin já existe:", existingAdmin[0].email);
            process.exit(0);
        }

        // Hash da senha
        const hashedPassword = await hashPassword("admin");

        // Cria admin
        const [newAdmin] = await db
            .insert(drivers)
            .values({
                nome: "Administrador",
                email: "admin@rotaverde.com",
                senha: hashedPassword,
                role: "admin",
                isActive: true,
            })
            .returning();

        console.log("✅ Admin criado com sucesso!");
        console.log(`ID: ${newAdmin.id} - Email: ${newAdmin.email}`);
        process.exit(0);

    } catch (error) {
        console.error("❌ Erro ao executar seed:", error);
        process.exit(1);
    }
}

seedProd();
