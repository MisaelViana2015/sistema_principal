
import "dotenv/config";
import { db } from "../core/db/connection.js";
import { sql } from "drizzle-orm";

async function createCostTypesTable() {
    try {
        console.log("🛠️ Verificando tabela 'cost_types'...");

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "cost_types" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" text NOT NULL,
                "category" text DEFAULT 'Variável' NOT NULL,
                "description" text,
                "is_active" boolean DEFAULT true NOT NULL,
                "icon" text,
                "color" text
            );
        `);

        console.log("✅ Tabela 'cost_types' verificada/criada.");

        // Verificar se tem dados
        const result = await db.execute(sql`SELECT count(*) as count FROM cost_types`);
        const count = Number(result.rows[0].count);
        console.log(`📊 Total de tipos de custo: ${count}`);

        if (count === 0) {
            console.log("⚠️ Tabela vazia. Populando defaults...");
            // Inserir defaults básicos para não quebrar o frontend
            await db.execute(sql`
                INSERT INTO "cost_types" ("id", "name", "category", "icon", "color") VALUES
                (gen_random_uuid()::text, 'Combustível', 'Variável', 'fuel', 'orange'),
                (gen_random_uuid()::text, 'Pedágio', 'Variável', 'ticket', 'yellow'),
                (gen_random_uuid()::text, 'Limpeza', 'Variável', 'droplet', 'blue'),
                (gen_random_uuid()::text, 'Alimentação', 'Variável', 'utensils', 'green'),
                (gen_random_uuid()::text, 'Manutenção', 'Variável', 'wrench', 'red'),
                (gen_random_uuid()::text, 'Outros', 'Variável', 'dollar-sign', 'gray'),
                (gen_random_uuid()::text, 'Recarga APP', 'Variável', 'zap', 'blue'),
                (gen_random_uuid()::text, 'Recarga Carro', 'Variável', 'car', 'green');
            `);
            console.log("✅ Defaults inseridos.");
        }

    } catch (error) {
        console.error("❌ Erro ao lidar com cost_types:", error);
    }
    process.exit(0);
}

createCostTypesTable();
