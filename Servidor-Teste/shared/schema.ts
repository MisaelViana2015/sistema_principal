
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

export const shifts = pgTable("shifts", {
    id: varchar("id").default(sql`gen_random_uuid()`).primaryKey().notNull(),
    driverId: varchar("driver_id").notNull(),
    vehicleId: varchar("vehicle_id").notNull(),
    inicio: timestamp("inicio").notNull(),
    fim: timestamp("fim"),
    kmInicial: real("km_inicial").notNull(),
    kmFinal: real("km_final"),
    status: text("status").default('em_andamento').notNull(),
    totalApp: real("total_app").default(0),
    totalParticular: real("total_particular").default(0),
    totalBruto: real("total_bruto").default(0),
    totalCustos: real("total_custos").default(0),
    liquido: real("liquido").default(0),
    repasseEmpresa: real("repasse_empresa").default(0),
    repasseMotorista: real("repasse_motorista").default(0),
    totalCorridasApp: integer("total_corridas_app").default(0),
    totalCorridasParticular: integer("total_corridas_particular").default(0),
    totalCorridas: integer("total_corridas").default(0),
    duracaoMin: integer("duracao_min").default(0),
    valorKm: real("valor_km").default(0),
});

export const rides = pgTable("rides", {
    id: varchar("id").default(sql`gen_random_uuid()`).primaryKey().notNull(),
    shiftId: varchar("shift_id").notNull(),
    tipo: text("tipo").notNull(),
    valor: numeric("valor", { precision: 12, scale: 2 }).notNull(),
    hora: timestamp("hora").notNull(),
});

export type Shift = typeof shifts.$inferSelect;
export type NewShift = typeof shifts.$inferInsert;
export type Ride = typeof rides.$inferSelect;
export type NewRide = typeof rides.$inferInsert;
