
import { pgTable, unique, varchar, text, boolean, timestamp, foreignKey, numeric, integer, jsonb, real, index, json, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export const drivers = pgTable("drivers", {
    id: varchar("id", { length: 36 }).$defaultFn(() => randomUUID()).primaryKey().notNull(),
    nome: text("nome").notNull(),
    email: text("email").notNull(),
    telefone: text("telefone"),
    senha: text("senha").notNull(),
    role: varchar("role", { length: 20 }).default('driver').notNull(),
    isActive: boolean("is_active").default(true).notNull(),
},
    (table: any) => {
        return {
            driversEmailKey: unique("drivers_email_key").on(table.email),
        }
    });

export const sessions = pgTable("sessions", {
    id: varchar("id", { length: 36 }).$defaultFn(() => randomUUID()).primaryKey().notNull(),
    driverId: varchar("driver_id", { length: 36 }).notNull().references(() => drivers.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
},
    (table: any) => {
        return {
            sessionsTokenKey: unique("sessions_token_key").on(table.token),
        }
    });

export const vehicles = pgTable("vehicles", {
    id: varchar("id").$defaultFn(() => randomUUID()).primaryKey().notNull(),
    plate: text("plate").notNull(),
    modelo: text("modelo").notNull(),
    motoristaPadraoId: varchar("motorista_padrao_id"),
    isActive: boolean("is_active").default(true).notNull(),
    currentShiftId: varchar("current_shift_id"),
    kmInicial: real("km_inicial").notNull(),
    color: text("color"),
    imageUrl: text("image_url"),
},
    (table: any) => {
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
    id: varchar("id").$defaultFn(() => randomUUID()).primaryKey().notNull(),
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
    totalCustosParticular: real("total_custos_particular").default(0),
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
    id: varchar("id").$defaultFn(() => randomUUID()).primaryKey().notNull(),
    shiftId: varchar("shift_id").notNull(),
    tipo: text("tipo").notNull(),
    valor: numeric("valor", { precision: 12, scale: 2 }).notNull(),
    hora: timestamp("hora").notNull(),
});

export type Shift = typeof shifts.$inferSelect;
export type NewShift = typeof shifts.$inferInsert;
export type Ride = typeof rides.$inferSelect;
export type NewRide = typeof rides.$inferInsert;

export const costTypes = pgTable("cost_types", {
    id: varchar("id").$defaultFn(() => randomUUID()).primaryKey().notNull(),
    name: text("name").notNull(),
    category: text("category").default('Variável').notNull(), // 'Fixo' or 'Variável'
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    icon: text("icon"),
    color: text("color"),
});

export const fixedCosts = pgTable("fixed_costs", {
    id: varchar("id").$defaultFn(() => randomUUID()).primaryKey().notNull(),
    name: text("name").notNull(),
    value: numeric("valor", { precision: 12, scale: 2 }).notNull(),
    frequency: text("frequency").default('Mensal').notNull(),
    dueDay: integer("due_day").default(5), // Day of month
});

export const tires = pgTable("tires", {
    id: uuid("id").defaultRandom().primaryKey(),
    vehicleId: uuid("vehicle_id").references(() => vehicles.id),
    position: text("position").notNull(), // Dianteiro Esq, etc
    brand: text("brand").notNull(),
    model: text("model").notNull(),
    status: text("status").notNull(), // Novo, Meia Vida, etc
    installDate: timestamp("install_date").notNull(),
    installKm: integer("install_km").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// @ts-ignore
export const insertTireSchema = createInsertSchema(tires) as any;
export type Tire = typeof tires.$inferSelect;
export type InsertTire = typeof tires.$inferInsert;

export const expenses = pgTable("expenses", {
    id: varchar("id").$defaultFn(() => randomUUID()).primaryKey().notNull(),
    driverId: varchar("driver_id").references(() => drivers.id), // Optional link to driver
    shiftId: varchar("shift_id"), // Link to shift
    costTypeId: varchar("cost_type_id").references(() => costTypes.id).notNull(),
    value: numeric("valor", { precision: 12, scale: 2 }).notNull(),
    date: timestamp("date").notNull(),
    notes: text("notes"),
    isParticular: boolean("is_particular").default(false),
});

// Tabela Legacy recuperada do backup
export const legacyMaintenances = pgTable("maintenances", {
    id: varchar("id").primaryKey(),
    vehicleId: varchar("vehicle_id"),
    description: text("descricao"), // Mapeando coluna 'descricao'
    notes: text("observacao"), // Mapeando coluna 'observacao'
    type: text("tipo"),
    value: numeric("valor"),
    date: timestamp("data"), // Mapeando coluna 'data'
    km: real("km_atual"), // Mapeando coluna 'km_atual'
});

export const legacyShiftCostTypes = pgTable("shift_cost_types", {
    id: varchar("id").primaryKey(),
    name: text("name"),
    icon: text("icon"),
    colorToken: text("color_token"),
    isDefault: boolean("is_default"),
    createdAt: timestamp("created_at") // Note: Backup showed '2025-11-14...' format, might need care if string or timestamp. 
    // Postgres backup usually handles timestamp correctly if column type is timestamp.
});

export type CostType = typeof costTypes.$inferSelect;
export type NewCostType = typeof costTypes.$inferInsert;
export type FixedCost = typeof fixedCosts.$inferSelect;
export type NewFixedCost = typeof fixedCosts.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type LegacyMaintenance = typeof legacyMaintenances.$inferSelect;
