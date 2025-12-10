
import { pgTable, unique, varchar, text, boolean, timestamp, foreignKey, numeric, integer, jsonb, real, index, json } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const drivers = pgTable("drivers", {
    id: varchar("id", { length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
    nome: text("nome").notNull(),
    email: text("email").notNull(),
    telefone: text("telefone"),
    senha: text("senha").notNull(),
    role: varchar("role", { length: 20 }).default('driver').notNull(),
    isActive: boolean("is_active").default(true).notNull(),
},
    (table) => {
        return {
            driversEmailKey: unique("drivers_email_key").on(table.email),
        }
    });

export const sessions = pgTable("sessions", {
    id: varchar("id", { length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
    driverId: varchar("driver_id", { length: 36 }).notNull().references(() => drivers.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
},
    (table) => {
        return {
            sessionsTokenKey: unique("sessions_token_key").on(table.token),
        }
    });

export const vehicles = pgTable("vehicles", {
    id: varchar("id").default(sql`gen_random_uuid()`).primaryKey().notNull(),
    plate: text("plate").notNull(),
    modelo: text("modelo").notNull(),
    motoristaPadraoId: varchar("motorista_padrao_id"),
    isActive: boolean("is_active").default(true).notNull(),
    currentShiftId: varchar("current_shift_id"),
    kmInicial: real("km_inicial").notNull(),
},
    (table) => {
        return {
            vehiclesPlateKey: unique("vehicles_plate_key").on(table.plate),
        }
    });

// Types
export type Driver = typeof drivers.$inferSelect;
export type NewDriver = typeof drivers.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;
