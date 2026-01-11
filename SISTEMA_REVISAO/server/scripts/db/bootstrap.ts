
import { db } from "../../core/db/connection.js";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

/**
 * BOOTSTRAP DO BANCO DE DADOS
 *
 * Responsável por criar a estrutura inicial (tabelas) e dados essenciais (seeds).
 *
 * REGRAS DE SEGURANÇA:
 * 1. Não roda automaticamente em produção (trava de NODE_ENV).
 * 2. É idempotente (pode rodar várias vezes sem erro).
 * 3. Deve ser executado manualmente via 'npm run db:setup'.
 */

export async function bootstrapDatabase() {
    console.log("🛠️ Iniciando Bootstrap do Banco de Dados...");

    // TRAVA DE SEGURANÇA DE AMBIENTE
    // Impede execução acidental em produção, a menos que forçado explicitamente
    if (process.env.NODE_ENV === "production" && process.env.FORCE_BOOTSTRAP !== "true") {
        console.error("❌ ERRO: Bootstrap bloqueado em ambiente de PRODUÇÃO.");
        console.error("   Para forçar, use: FORCE_BOOTSTRAP=true npm run db:setup");
        process.exit(1);
    }

    try {
        // 1. Remover dependência de pgcrypto (gerar UUID na aplicação)
        // await db.execute(sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

        // 2. Garantir tabela drivers (ID gerado pela aplicação)
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS drivers (
                id varchar(36) PRIMARY KEY,
                nome text NOT NULL,
                email text NOT NULL UNIQUE,
                telefone text,
                senha text NOT NULL,
                role varchar(20) DEFAULT 'driver' NOT NULL,
                is_active boolean DEFAULT true NOT NULL
            );
        `);
        console.log("✅ Tabela 'drivers' verificada.");

        // 3. Garantir tabela sessions
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS sessions (
                id varchar(36) PRIMARY KEY,
                driver_id varchar(36) NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
                token text NOT NULL UNIQUE,
                ip_address text,
                user_agent text,
                expires_at timestamp with time zone NOT NULL,
                created_at timestamp with time zone DEFAULT now() NOT NULL
            );
        `);
        console.log("✅ Tabela 'sessions' verificada.");

        // 3.1 Garantir tabela cost_types (Tipos de Custo)
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS cost_types (
                id varchar(36) PRIMARY KEY,
                name text NOT NULL,
                category text DEFAULT 'Variável' NOT NULL,
                description text
            );
        `);
        console.log("✅ Tabela 'cost_types' verificada.");

        // SEED: Tipos de Custo Padrão
        const costCountRes = await db.execute(sql`SELECT count(*) as count FROM cost_types`);
        const costCount = costCountRes.rows[0].count;

        if (Number(costCount) === 0) {
            console.log("🌱 Seed: Criando Tipos de Custo Padrão...");
            const defaults = [
                { name: 'Recarga Carro', category: 'Variável', desc: 'Padrão' },
                { name: 'Pedágio', category: 'Variável', desc: 'Padrão' },
                { name: 'Recarga APP', category: 'Variável', desc: 'Padrão' },
                { name: 'Outros', category: 'Variável', desc: 'Padrão' },
                { name: 'Alimentação', category: 'Variável', desc: 'Padrão' },
                { name: 'Manutenção', category: 'Variável', desc: 'Padrão' }
            ];

            for (const type of defaults) {
                const id = randomUUID();
                await db.execute(sql`
                    INSERT INTO cost_types (id, name, category, description)
                    VALUES (${id}, ${type.name}, ${type.category}, ${type.desc})
                `);
            }
            console.log("✅ Seed de 'cost_types' concluído.");
        }

        // 3.2 Garantir tabela expenses
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS expenses (
                id varchar(36) PRIMARY KEY,
                driver_id varchar(36) REFERENCES drivers(id),
                shift_id varchar(36),
                cost_type_id varchar(36) NOT NULL REFERENCES cost_types(id),
                valor numeric(12, 2) NOT NULL,
                date timestamp NOT NULL,
                notes text
            );
        `);
        console.log("✅ Tabela 'expenses' verificada.");

        // Migração manual: Garantir coluna shift_id
        try {
            await db.execute(sql`ALTER TABLE expenses ADD COLUMN IF NOT EXISTS shift_id varchar(36);`);
        } catch (e) {
            console.log("ℹ️ Coluna shift_id já existe ou erro ignorável ao adicionar.");
        }

        // 3.3 Garantir tabela fixed_costs
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS fixed_costs (
                id varchar(36) PRIMARY KEY,
                name text NOT NULL,
                valor numeric(12, 2) NOT NULL,
                frequency text DEFAULT 'Mensal' NOT NULL,
                due_day integer DEFAULT 5
            );
        `);
        console.log("✅ Tabela 'fixed_costs' verificada.");

        // 4. Seed Admin User (se não existir)
        const result = await db.execute(sql`SELECT count(*) as count FROM drivers`);
        const count = result.rows[0].count;

        if (Number(count) === 0) {
            console.log("🌱 Seed: Criando Usuário Admin...");
            const salt = await bcrypt.genSalt(10);
            const adminPassword = process.env.ADMIN_PASSWORD || 'admin_dev_password'; // Em produção, SEMPRE use a variável de ambiente

            if (process.env.NODE_ENV === "production" && adminPassword === 'admin_dev_password') {
                console.error("❌ ERRO: Em ambiente de PRODUÇÃO, a senha do admin deve ser definida via ADMIN_PASSWORD.");
                process.exit(1);
            }

            const hashedPassword = await bcrypt.hash(adminPassword, salt);
            const adminId = randomUUID();

            await db.execute(sql`
                INSERT INTO drivers (id, nome, email, senha, role, is_active)
                VALUES (${adminId}, 'Administrador', 'programacao1215@hotmail.com', ${hashedPassword}, 'admin', true)
            `);
            console.log(`✅ Admin criado: programacao1215@hotmail.com / ${adminPassword === 'admin_dev_password' ? 'admin_dev_password (APENAS PARA DESENVOLVIMENTO)' : 'senha definida via ADMIN_PASSWORD'}`);
        }

        console.log("✅ BOOTSTRAP FINALIZADO COM SUCESSO!");

    } catch (e) {
        console.error("⚠️ ERRO CRÍTICO NO BOOTSTRAP:", e);
        throw e;
    }
}

// EXECUÇÃO EXPLÍCITA
// Verifica se o arquivo está sendo executado diretamente pelo Node
if (process.argv[1] === import.meta.filename || process.argv[1].endsWith('bootstrap.ts')) {
    bootstrapDatabase()
        .then(() => process.exit(0))
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}
