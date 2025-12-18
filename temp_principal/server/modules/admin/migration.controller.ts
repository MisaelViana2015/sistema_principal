
import { Request, Response } from "express";
import { db } from "../../core/db/connection.js";
import { sql } from "drizzle-orm";

export const migrationController = {
    async runMigration(req: Request, res: Response) {
        try {
            console.log("🚀 Rodando migração de emergência...");
            const logs = [];

            // 1. Shifts: total_custos_particular
            try {
                await db.execute(sql`
                    ALTER TABLE "shifts" 
                    ADD COLUMN IF NOT EXISTS "total_custos_particular" real DEFAULT 0;
                `);
                logs.push("✅ Coluna 'total_custos_particular' verificada em 'shifts'.");
            } catch (e: any) {
                logs.push(`❌ Erro em shifts: ${e.message}`);
            }

            // 2. Expenses: is_particular e create table
            try {
                await db.execute(sql`
                    CREATE TABLE IF NOT EXISTS "expenses" (
                        "id" varchar PRIMARY KEY NOT NULL,
                        "driver_id" varchar,
                        "shift_id" varchar,
                        "cost_type_id" varchar NOT NULL,
                        "valor" numeric(12, 2) NOT NULL,
                        "date" timestamp NOT NULL,
                        "notes" text,
                        "is_particular" boolean DEFAULT false
                    );
                `);
                logs.push("✅ Tabela 'expenses' verificada.");

                // Adicionar coluna se tabela já existia mas sem coluna
                await db.execute(sql`
                    ALTER TABLE "expenses" 
                    ADD COLUMN IF NOT EXISTS "is_particular" boolean DEFAULT false;
                `);
                logs.push("✅ Coluna 'is_particular' verificada em 'expenses'.");

            } catch (e: any) {
                logs.push(`❌ Erro em expenses: ${e.message}`);
            }

            // 3. Cost Types
            try {
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
                logs.push("✅ Tabela 'cost_types' verificada.");

                // Defaults
                const countRes = await db.execute(sql`SELECT count(*) as count FROM cost_types`);
                const count = Number(countRes.rows[0].count);
                if (count === 0) {
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
                    logs.push("✅ Defaults inseridos em 'cost_types'.");
                }
            } catch (e: any) {
                logs.push(`❌ Erro em cost_types: ${e.message}`);
            }

            res.json({ message: "Migração executada", logs });
        } catch (error: any) {
            console.error("Migration fatal error:", error);
            res.status(500).json({ message: "Erro fatal na migração", error: error.message });
        }
    }
};
