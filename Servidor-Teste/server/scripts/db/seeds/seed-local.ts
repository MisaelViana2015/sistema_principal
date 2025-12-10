import "dotenv/config";
import { db } from "../../../core/db/connection.js";
import { drivers } from "../../../../shared/schema.js";
import { hashPassword } from "../../../core/security/hash.js";
import { eq } from "drizzle-orm";
import * as readline from "readline";

/**
 * SEED LOCAL - CRIAR ADMIN INICIAL
 * 
 * REGRAS ABSOLUTAS:
 * - NUNCA rodar automaticamente
 * - SEMPRE verificar ambiente antes de executar
 * - SEMPRE pedir confirmação
 * - NUNCA sobrescrever dados existentes sem avisar
 * - Logar qual banco está sendo usado
 */

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function question(query: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
}

async function seedLocal() {
    try {
        console.log("🌱 SEED LOCAL - Sistema Rota Verde");
        console.log("=====================================\n");

        // Verificação de ambiente
        const env = process.env.NODE_ENV || "development";
        const appEnv = process.env.APP_ENV || "local";
        const dbUrl = process.env.DATABASE_URL || "";

        console.log(`📍 NODE_ENV: ${env}`);
        console.log(`📍 APP_ENV: ${appEnv}`);
        console.log(`📍 DATABASE_URL: ${dbUrl.substring(0, 30)}...`);

        // Proteção: não rodar em produção sem confirmação explícita
        if (env === "production" || appEnv === "production") {
            console.log("\n⚠️  ATENÇÃO: Você está em ambiente de PRODUÇÃO!");
            const confirm = await question(
                "Tem CERTEZA que deseja rodar seed em produção? (digite 'SIM TENHO CERTEZA'): "
            );

            if (confirm !== "SIM TENHO CERTEZA") {
                console.log("❌ Seed cancelado por segurança.");
                rl.close();
                process.exit(0);
            }
        }

        // Confirmação final
        console.log("\n📋 Este seed irá:");
        console.log("   1. Criar usuário admin (se não existir)");
        console.log("   2. Email: admin@rotaverde.com");
        console.log("   3. Senha: admin");
        console.log("\n⚠️  IMPORTANTE: Altere a senha após primeiro login!\n");

        const proceed = await question("Deseja continuar? (s/n): ");

        if (proceed.toLowerCase() !== "s") {
            console.log("❌ Seed cancelado.");
            rl.close();
            process.exit(0);
        }

        console.log("\n🚀 Iniciando seed...\n");

        // Verifica se admin já existe
        const existingAdmin = await db
            .select()
            .from(drivers)
            .where(eq(drivers.email, "admin@rotaverde.com"))
            .limit(1);

        if (existingAdmin.length > 0) {
            console.log("ℹ️  Admin já existe no banco de dados.");
            console.log(`   ID: ${existingAdmin[0].id}`);
            console.log(`   Nome: ${existingAdmin[0].nome}`);
            console.log(`   Email: ${existingAdmin[0].email}`);

            const overwrite = await question("\nDeseja sobrescrever? (s/n): ");

            if (overwrite.toLowerCase() !== "s") {
                console.log("✅ Seed finalizado sem alterações.");
                rl.close();
                process.exit(0);
            }

            // Deleta admin existente
            await db.delete(drivers).where(eq(drivers.id, existingAdmin[0].id));
            console.log("🗑️  Admin anterior removido.");
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
                telefone: null,
                role: "admin",
                is_active: true,
            })
            .returning();

        console.log("\n✅ Admin criado com sucesso!");
        console.log("=====================================");
        console.log(`ID: ${newAdmin.id}`);
        console.log(`Nome: ${newAdmin.nome}`);
        console.log(`Email: ${newAdmin.email}`);
        console.log(`Role: ${newAdmin.role}`);
        console.log("=====================================");
        console.log("\n🔐 CREDENCIAIS DE LOGIN:");
        console.log("   Email: admin@rotaverde.com");
        console.log("   Senha: admin");
        console.log("\n⚠️  ALTERE A SENHA APÓS PRIMEIRO LOGIN!\n");

        rl.close();
        process.exit(0);
    } catch (error) {
        console.error("\n❌ Erro ao executar seed:", error);
        rl.close();
        process.exit(1);
    }
}

// Executa seed
seedLocal();
