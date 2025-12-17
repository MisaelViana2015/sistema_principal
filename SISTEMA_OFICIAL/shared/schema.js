"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.legacyShiftCostTypes = exports.legacyMaintenances = exports.expenses = exports.insertTireSchema = exports.tires = exports.fixedCosts = exports.costTypes = exports.rides = exports.shifts = exports.vehicles = exports.sessions = exports.drivers = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const crypto_1 = require("crypto");
exports.drivers = (0, pg_core_1.pgTable)("drivers", {
    id: (0, pg_core_1.varchar)("id", { length: 36 }).$defaultFn(() => (0, crypto_1.randomUUID)()).primaryKey().notNull(),
    nome: (0, pg_core_1.text)("nome").notNull(),
    email: (0, pg_core_1.text)("email").notNull(),
    telefone: (0, pg_core_1.text)("telefone"),
    senha: (0, pg_core_1.text)("senha").notNull(),
    role: (0, pg_core_1.varchar)("role", { length: 20 }).default('driver').notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
}, (table) => {
    return {
        driversEmailKey: (0, pg_core_1.unique)("drivers_email_key").on(table.email),
    };
});
exports.sessions = (0, pg_core_1.pgTable)("sessions", {
    id: (0, pg_core_1.varchar)("id", { length: 36 }).$defaultFn(() => (0, crypto_1.randomUUID)()).primaryKey().notNull(),
    driverId: (0, pg_core_1.varchar)("driver_id", { length: 36 }).notNull().references(() => exports.drivers.id, { onDelete: "cascade" }),
    token: (0, pg_core_1.text)("token").notNull(),
    ipAddress: (0, pg_core_1.text)("ip_address"),
    userAgent: (0, pg_core_1.text)("user_agent"),
    expiresAt: (0, pg_core_1.timestamp)("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => {
    return {
        sessionsTokenKey: (0, pg_core_1.unique)("sessions_token_key").on(table.token),
    };
});
exports.vehicles = (0, pg_core_1.pgTable)("vehicles", {
    id: (0, pg_core_1.varchar)("id").$defaultFn(() => (0, crypto_1.randomUUID)()).primaryKey().notNull(),
    plate: (0, pg_core_1.text)("plate").notNull(),
    modelo: (0, pg_core_1.text)("modelo").notNull(),
    motoristaPadraoId: (0, pg_core_1.varchar)("motorista_padrao_id"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    currentShiftId: (0, pg_core_1.varchar)("current_shift_id"),
    kmInicial: (0, pg_core_1.real)("km_inicial").notNull(),
    color: (0, pg_core_1.text)("color"),
    imageUrl: (0, pg_core_1.text)("image_url"),
}, (table) => {
    return {
        vehiclesPlateKey: (0, pg_core_1.unique)("vehicles_plate_key").on(table.plate),
    };
});
exports.shifts = (0, pg_core_1.pgTable)("shifts", {
    id: (0, pg_core_1.varchar)("id").$defaultFn(() => (0, crypto_1.randomUUID)()).primaryKey().notNull(),
    driverId: (0, pg_core_1.varchar)("driver_id").notNull(),
    vehicleId: (0, pg_core_1.varchar)("vehicle_id").notNull(),
    inicio: (0, pg_core_1.timestamp)("inicio").notNull(),
    fim: (0, pg_core_1.timestamp)("fim"),
    kmInicial: (0, pg_core_1.real)("km_inicial").notNull(),
    kmFinal: (0, pg_core_1.real)("km_final"),
    status: (0, pg_core_1.text)("status").default('em_andamento').notNull(),
    totalApp: (0, pg_core_1.real)("total_app").default(0),
    totalParticular: (0, pg_core_1.real)("total_particular").default(0),
    totalBruto: (0, pg_core_1.real)("total_bruto").default(0),
    totalCustos: (0, pg_core_1.real)("total_custos").default(0),
    totalCustosParticular: (0, pg_core_1.real)("total_custos_particular").default(0),
    liquido: (0, pg_core_1.real)("liquido").default(0),
    repasseEmpresa: (0, pg_core_1.real)("repasse_empresa").default(0),
    repasseMotorista: (0, pg_core_1.real)("repasse_motorista").default(0),
    totalCorridasApp: (0, pg_core_1.integer)("total_corridas_app").default(0),
    totalCorridasParticular: (0, pg_core_1.integer)("total_corridas_particular").default(0),
    totalCorridas: (0, pg_core_1.integer)("total_corridas").default(0),
    duracaoMin: (0, pg_core_1.integer)("duracao_min").default(0),
    valorKm: (0, pg_core_1.real)("valor_km").default(0),
});
exports.rides = (0, pg_core_1.pgTable)("rides", {
    id: (0, pg_core_1.varchar)("id").$defaultFn(() => (0, crypto_1.randomUUID)()).primaryKey().notNull(),
    shiftId: (0, pg_core_1.varchar)("shift_id").notNull(),
    tipo: (0, pg_core_1.text)("tipo").notNull(),
    valor: (0, pg_core_1.numeric)("valor", { precision: 12, scale: 2 }).notNull(),
    hora: (0, pg_core_1.timestamp)("hora").notNull(),
});
exports.costTypes = (0, pg_core_1.pgTable)("cost_types", {
    id: (0, pg_core_1.varchar)("id").$defaultFn(() => (0, crypto_1.randomUUID)()).primaryKey().notNull(),
    name: (0, pg_core_1.text)("name").notNull(),
    category: (0, pg_core_1.text)("category").default('Variável').notNull(), // 'Fixo' or 'Variável'
    description: (0, pg_core_1.text)("description"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    icon: (0, pg_core_1.text)("icon"),
    color: (0, pg_core_1.text)("color"),
});
exports.fixedCosts = (0, pg_core_1.pgTable)("fixed_costs", {
    id: (0, pg_core_1.varchar)("id").$defaultFn(() => (0, crypto_1.randomUUID)()).primaryKey().notNull(),
    name: (0, pg_core_1.text)("name").notNull(),
    value: (0, pg_core_1.numeric)("valor", { precision: 12, scale: 2 }).notNull(),
    frequency: (0, pg_core_1.text)("frequency").default('Mensal').notNull(),
    dueDay: (0, pg_core_1.integer)("due_day").default(5), // Day of month
});
exports.tires = (0, pg_core_1.pgTable)("tires", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    vehicleId: (0, pg_core_1.uuid)("vehicle_id").references(() => exports.vehicles.id),
    position: (0, pg_core_1.text)("position").notNull(), // Dianteiro Esq, etc
    brand: (0, pg_core_1.text)("brand").notNull(),
    model: (0, pg_core_1.text)("model").notNull(),
    status: (0, pg_core_1.text)("status").notNull(), // Novo, Meia Vida, etc
    installDate: (0, pg_core_1.timestamp)("install_date").notNull(),
    installKm: (0, pg_core_1.integer)("install_km").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertTireSchema = (0, drizzle_zod_1.createInsertSchema)(exports.tires);
exports.expenses = (0, pg_core_1.pgTable)("expenses", {
    id: (0, pg_core_1.varchar)("id").$defaultFn(() => (0, crypto_1.randomUUID)()).primaryKey().notNull(),
    driverId: (0, pg_core_1.varchar)("driver_id").references(() => exports.drivers.id), // Optional link to driver
    shiftId: (0, pg_core_1.varchar)("shift_id"), // Link to shift
    costTypeId: (0, pg_core_1.varchar)("cost_type_id").references(() => exports.costTypes.id).notNull(),
    value: (0, pg_core_1.numeric)("valor", { precision: 12, scale: 2 }).notNull(),
    date: (0, pg_core_1.timestamp)("date").notNull(),
    notes: (0, pg_core_1.text)("notes"),
    isParticular: (0, pg_core_1.boolean)("is_particular").default(false),
});
// Tabela Legacy recuperada do backup
exports.legacyMaintenances = (0, pg_core_1.pgTable)("maintenances", {
    id: (0, pg_core_1.varchar)("id").primaryKey(),
    vehicleId: (0, pg_core_1.varchar)("vehicle_id"),
    description: (0, pg_core_1.text)("descricao"), // Mapeando coluna 'descricao'
    notes: (0, pg_core_1.text)("observacao"), // Mapeando coluna 'observacao'
    type: (0, pg_core_1.text)("tipo"),
    value: (0, pg_core_1.numeric)("valor"),
    date: (0, pg_core_1.timestamp)("data"), // Mapeando coluna 'data'
    km: (0, pg_core_1.real)("km_atual"), // Mapeando coluna 'km_atual'
});
exports.legacyShiftCostTypes = (0, pg_core_1.pgTable)("shift_cost_types", {
    id: (0, pg_core_1.varchar)("id").primaryKey(),
    name: (0, pg_core_1.text)("name"),
    icon: (0, pg_core_1.text)("icon"),
    colorToken: (0, pg_core_1.text)("color_token"),
    isDefault: (0, pg_core_1.boolean)("is_default"),
    createdAt: (0, pg_core_1.timestamp)("created_at") // Note: Backup showed '2025-11-14...' format, might need care if string or timestamp. 
    // Postgres backup usually handles timestamp correctly if column type is timestamp.
});
