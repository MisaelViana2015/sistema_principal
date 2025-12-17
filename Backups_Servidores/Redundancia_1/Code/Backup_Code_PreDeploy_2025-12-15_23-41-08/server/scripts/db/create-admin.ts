import "dotenv/config";
import postgres from "postgres";
import bcrypt from "bcryptjs";

/**
 * CRIAR ADMIN NO BANCO HML
 */

async function createAdmin() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error("❌ DATABASE_URL não definida");
        process.exit(1);
    }

    const client = postgres(connectionString);

    try {
        console.log("🔐 Criando usuário admin...");

        // Hash da senha
        const hashedPassword = await bcrypt.hash("admin", 10);

        // Verificar se admin já existe
        const existing = await client`
            SELECT * FROM drivers WHERE email = 'admin@rotaverde.com'
        `;

        if (existing.length > 0) {
            console.log("ℹ️  Admin já existe!");
            console.log(`   ID: ${existing[0].id}`);
            console.log(`   Nome: ${existing[0].nome}`);
            console.log(`   Email: ${existing[0].email}`);
            await client.end();
            return;
        }

        // Criar admin
        const result = await client`
            INSERT INTO drivers (nome, email, senha, telefone, role, is_active)
            VALUES ('Administrador', 'admin@rotaverde.com', ${hashedPassword}, NULL, 'admin', true)
            RETURNING *
        `;

        console.log("\n✅ Admin criado com sucesso!");
        console.log("=====================================");
        console.log(`ID: ${result[0].id}`);
        console.log(`Nome: ${result[0].nome}`);
        console.log(`Email: ${result[0].email}`);
        console.log(`Role: ${result[0].role}`);
        console.log("=====================================");
        console.log("\n🔐 CREDENCIAIS DE LOGIN:");
        console.log("   Email: admin@rotaverde.com");
        console.log("   Senha: admin");
        console.log("\n⚠️  ALTERE A SENHA APÓS PRIMEIRO LOGIN!\n");

    } catch (error) {
        console.error("❌ Erro:", error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

createAdmin();
