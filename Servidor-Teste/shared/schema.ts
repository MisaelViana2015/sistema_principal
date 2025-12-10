import { pgTable, text, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * SCHEMA OFICIAL DO SISTEMA ROTA VERDE
 * 
 * REGRAS ABSOLUTAS:
 * - Este é a ÚNICA fonte de verdade do banco
 * - Nomes de tabelas: plural, snake_case, inglês
 * - IDs: sempre UUID (gen_random_uuid())
 * - Booleans: sempre is_* ou has_*
 * - Datas: sempre timestamp with time zone
 * - Nunca alterar sem documentar em /docs/alteracoes_maiores/
 */

// ============================================
// TABELA: DRIVERS (Motoristas)
// ============================================
export const drivers = pgTable("drivers", {
    id: varchar("id", { length: 36 })
        .primaryKey()
        .default(sql`gen_random_uuid()`),

    nome: text("nome").notNull(),
    email: text("email").notNull().unique(),
    telefone: text("telefone"),
    senha: text("senha").notNull(), // bcrypt hash

    // Controle de acesso
    role: varchar("role", { length: 20 }).notNull().default("driver"), // "admin" | "driver"
    is_active: boolean("is_active").notNull().default(true),

    // Auditoria
    created_at: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

// ============================================
// TABELA: SESSIONS (Sessões de Login)
// ============================================
export const sessions = pgTable("sessions", {
    id: varchar("id", { length: 36 })
        .primaryKey()
        .default(sql`gen_random_uuid()`),

    driver_id: varchar("driver_id", { length: 36 })
        .notNull()
        .references(() => drivers.id, { onDelete: "cascade" }),

    token: text("token").notNull().unique(),
    ip_address: text("ip_address"),
    user_agent: text("user_agent"),

    expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),

    created_at: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

// ============================================
// TIPOS TYPESCRIPT (inferidos do schema)
// ============================================
export type Driver = typeof drivers.$inferSelect;
export type NewDriver = typeof drivers.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
