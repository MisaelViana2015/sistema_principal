# 💻 CÓDIGO FONTE PRINCIPAL - Sistema de Frota Elétrica

Este arquivo contém os códigos-fonte dos arquivos principais do sistema para análise.

---

## 📄 shared/schema.ts (Schema do Banco de Dados)

\`\`\`typescript
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, real, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Driver (motorista)
export const drivers = pgTable("drivers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  senha: text("senha").notNull(),
  telefone: text("telefone"),
  veiculoFavoritoId: varchar("veiculo_favorito_id"),
  isActive: boolean("is_active").notNull().default(true),
  role: text("role").notNull().default("driver"), // "driver" | "admin"
});

// Vehicle (veículo)
export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  plate: text("plate").notNull().unique(),
  modelo: text("modelo").notNull(),
  motoristaPadraoId: varchar("motorista_padrao_id"),
  isActive: boolean("is_active").notNull().default(true),
  currentShiftId: varchar("current_shift_id"),
});

// Shift (turno)
export const shifts = pgTable("shifts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  driverId: varchar("driver_id").notNull(),
  vehicleId: varchar("vehicle_id").notNull(),
  inicio: timestamp("inicio").notNull(),
  fim: timestamp("fim"),
  kmInicial: real("km_inicial").notNull(),
  kmFinal: real("km_final"),
  status: text("status").notNull().default("em_andamento"), // "em_andamento" | "finalizado"
  
  // Agregados (preenchidos no encerramento)
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

// Ride (corrida)
export const rides = pgTable("rides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shiftId: varchar("shift_id").notNull(),
  tipo: text("tipo").notNull(), // "App" | "Particular"
  valor: real("valor").notNull(),
  hora: timestamp("hora").notNull(),
});

// Cost (custo)
export const costs = pgTable("costs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shiftId: varchar("shift_id").notNull(),
  tipo: text("tipo").notNull(), // "Recarga APP" | "Recarga Carro" | "Outros"
  valor: real("valor").notNull(),
  observacao: text("observacao"),
  hora: timestamp("hora").notNull(),
});

// Log (auditoria)
export const logs = pgTable("logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  acao: text("acao").notNull(),
  entidade: text("entidade").notNull(),
  referenciaId: varchar("referencia_id").notNull(),
  payload: json("payload"),
  data: timestamp("data").notNull().default(sql`now()`),
});

// Insert schemas
export const insertDriverSchema = createInsertSchema(drivers).omit({ id: true });
export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true, currentShiftId: true });
export const insertShiftSchema = createInsertSchema(shifts).omit({ 
  id: true, 
  fim: true, 
  kmFinal: true, 
  totalApp: true,
  totalParticular: true,
  totalBruto: true,
  totalCustos: true,
  liquido: true,
  repasseEmpresa: true,
  repasseMotorista: true,
  totalCorridasApp: true,
  totalCorridasParticular: true,
  totalCorridas: true,
  duracaoMin: true,
  valorKm: true,
});
export const insertRideSchema = createInsertSchema(rides).omit({ id: true });
export const insertCostSchema = createInsertSchema(costs).omit({ id: true });
export const insertLogSchema = createInsertSchema(logs).omit({ id: true, data: true });

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(1, "Senha obrigatória"),
});

// Types
export type Driver = typeof drivers.$inferSelect;
export type InsertDriver = z.infer<typeof insertDriverSchema>;
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Shift = typeof shifts.$inferSelect;
export type InsertShift = z.infer<typeof insertShiftSchema>;
export type Ride = typeof rides.$inferSelect;
export type InsertRide = z.infer<typeof insertRideSchema>;
export type Cost = typeof costs.$inferSelect;
export type InsertCost = z.infer<typeof insertCostSchema>;
export type Log = typeof logs.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;
export type Login = z.infer<typeof loginSchema>;

// Extended types for API responses
export type DriverWithVehicle = Driver & {
  veiculoFavorito?: Vehicle | null;
};

export type VehicleWithDriver = Vehicle & {
  motoristaPadrao?: Driver | null;
};

export type ShiftWithDetails = Shift & {
  driver?: Driver;
  vehicle?: Vehicle;
  rides?: Ride[];
  costs?: Cost[];
};

export type LogWithUser = Log & {
  user?: Driver;
};
\`\`\`

---

## 📄 server/db.ts (Configuração Drizzle)

\`\`\`typescript
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Usa a URL correta (produção ou desenvolvimento)
const connectionString =
  process.env.DATABASE_URL_PROD || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL não foi definida! Verifique os secrets.");
}

export const pool = new Pool({ connectionString });
export const db = drizzle({ client: pool, schema });
\`\`\`

---

## 📄 server/storage.ts (DatabaseStorage - CRUD)

\`\`\`typescript
import { randomUUID } from "crypto";
import { db } from "./db";
import {
  drivers,
  vehicles,
  shifts,
  rides,
  costs,
  logs,
  type Driver,
  type InsertDriver,
  type Vehicle,
  type InsertVehicle,
  type Shift,
  type InsertShift,
  type Ride,
  type InsertRide,
  type Cost,
  type InsertCost,
  type Log,
  type InsertLog,
  type DriverWithVehicle,
  type VehicleWithDriver,
  type ShiftWithDetails,
  type LogWithUser,
} from "@shared/schema";
import { eq, and, gte, lte, isNull } from "drizzle-orm";

// Storage interface
export interface IStorage {
  // Drivers
  getDriver(id: string): Promise<Driver | undefined>;
  getDriverByEmail(email: string): Promise<Driver | undefined>;
  getDriverWithVehicle(id: string): Promise<DriverWithVehicle | undefined>;
  getAllDrivers(): Promise<Driver[]>;
  getAllDriversWithVehicles(): Promise<DriverWithVehicle[]>;
  createDriver(driver: InsertDriver): Promise<Driver>;
  updateDriver(id: string, driver: Partial<Driver>): Promise<Driver | undefined>;

  // Vehicles
  getVehicle(id: string): Promise<Vehicle | undefined>;
  getVehicleWithDriver(id: string): Promise<VehicleWithDriver | undefined>;
  getAllVehicles(): Promise<Vehicle[]>;
  getAllVehiclesWithDrivers(): Promise<VehicleWithDriver[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle | undefined>;

  // Shifts
  getShift(id: string): Promise<Shift | undefined>;
  getShiftWithDetails(id: string): Promise<ShiftWithDetails | undefined>;
  getActiveShiftByDriver(driverId: string): Promise<ShiftWithDetails | null>;
  getAllShifts(filters?: {
    driverId?: string;
    status?: string;
    from?: Date;
    to?: Date;
  }): Promise<ShiftWithDetails[]>;
  createShift(shift: InsertShift): Promise<Shift>;
  updateShift(id: string, shift: Partial<Shift>): Promise<Shift | undefined>;

  // Rides
  getRidesByShift(shiftId: string): Promise<Ride[]>;
  createRide(ride: InsertRide): Promise<Ride>;

  // Costs
  getCostsByShift(shiftId: string): Promise<Cost[]>;
  createCost(cost: InsertCost): Promise<Cost>;

  // Logs
  getAllLogs(filters?: {
    userId?: string;
    acao?: string;
    entidade?: string;
    from?: Date;
    to?: Date;
  }): Promise<LogWithUser[]>;
  createLog(log: InsertLog): Promise<Log>;
}

// Database storage implementation using Drizzle ORM
export class DatabaseStorage implements IStorage {

  // Drivers
  async getDriver(id: string): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.id, id));
    return driver || undefined;
  }

  async getDriverByEmail(email: string): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.email, email));
    return driver || undefined;
  }

  async getDriverWithVehicle(id: string): Promise<DriverWithVehicle | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.id, id));
    if (!driver) return undefined;

    let veiculoFavorito: Vehicle | null = null;
    if (driver.veiculoFavoritoId) {
      const [vehicle] = await db
        .select()
        .from(vehicles)
        .where(eq(vehicles.id, driver.veiculoFavoritoId));
      veiculoFavorito = vehicle || null;
    }

    return {
      ...driver,
      veiculoFavorito,
    };
  }

  async getAllDrivers(): Promise<Driver[]> {
    return db.select().from(drivers);
  }

  async getAllDriversWithVehicles(): Promise<DriverWithVehicle[]> {
    const allDrivers = await db.select().from(drivers);
    return Promise.all(
      allDrivers.map(async (d) => {
        const withVehicle = await this.getDriverWithVehicle(d.id);
        return withVehicle!;
      })
    );
  }

  async createDriver(insertDriver: InsertDriver): Promise<Driver> {
    const [driver] = await db.insert(drivers).values(insertDriver).returning();
    return driver;
  }

  async updateDriver(id: string, updates: Partial<Driver>): Promise<Driver | undefined> {
    const [updated] = await db
      .update(drivers)
      .set(updates)
      .where(eq(drivers.id, id))
      .returning();
    return updated || undefined;
  }

  // Vehicles
  async getVehicle(id: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle || undefined;
  }

  async getVehicleWithDriver(id: string): Promise<VehicleWithDriver | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    if (!vehicle) return undefined;

    let motoristaPadrao: Driver | null = null;
    if (vehicle.motoristaPadraoId) {
      const [driver] = await db
        .select()
        .from(drivers)
        .where(eq(drivers.id, vehicle.motoristaPadraoId));
      motoristaPadrao = driver || null;
    }

    return {
      ...vehicle,
      motoristaPadrao,
    };
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    return db.select().from(vehicles);
  }

  async getAllVehiclesWithDrivers(): Promise<VehicleWithDriver[]> {
    const allVehicles = await db.select().from(vehicles);
    return Promise.all(
      allVehicles.map(async (v) => {
        const withDriver = await this.getVehicleWithDriver(v.id);
        return withDriver!;
      })
    );
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db.insert(vehicles).values(insertVehicle).returning();
    return vehicle;
  }

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const [updated] = await db
      .update(vehicles)
      .set(updates)
      .where(eq(vehicles.id, id))
      .returning();
    return updated || undefined;
  }

  // Shifts
  async getShift(id: string): Promise<Shift | undefined> {
    const [shift] = await db.select().from(shifts).where(eq(shifts.id, id));
    return shift || undefined;
  }

  async getShiftWithDetails(id: string): Promise<ShiftWithDetails | undefined> {

// ... resto do arquivo (métodos de Shifts, Rides, Costs, Logs)
// Ver arquivo completo em server/storage.ts

\`\`\`

---

## 📄 client/src/lib/calc.ts (Cálculos Financeiros)

\`\`\`typescript
import { round2 } from "./format";
import type { Ride, Cost } from "@shared/schema";

export interface ShiftCalculations {
  totalApp: number;
  totalParticular: number;
  totalBruto: number;
  totalCustos: number;
  liquido: number;
  repasseEmpresa: number;
  repasseMotorista: number;
  totalCorridasApp: number;
  totalCorridasParticular: number;
  totalCorridas: number;
  duracaoMin: number;
  valorKm: number;
  ticketMedioApp: number;
  ticketMedioParticular: number;
  ticketMedioGeral: number;
  kmRodado: number;
}

export function calculateShiftTotals(
  rides: Ride[],
  costs: Cost[],
  kmInicial: number,
  kmFinal: number,
  inicio: Date,
  fim: Date
): ShiftCalculations {
  // Totais por tipo
  const totalApp = round2(
    rides
      .filter((r) => r.tipo === "App")
      .reduce((sum, r) => sum + (r.valor || 0), 0)
  );

  const totalParticular = round2(
    rides
      .filter((r) => r.tipo === "Particular")
      .reduce((sum, r) => sum + (r.valor || 0), 0)
  );

  const totalBruto = round2(totalApp + totalParticular);

  // Custos
  const totalCustos = round2(
    costs.reduce((sum, c) => sum + (c.valor || 0), 0)
  );

  // Líquido
  const liquido = round2(totalBruto - totalCustos);

  // Repasses (60% empresa, 40% motorista)
  const repasseEmpresa = round2(liquido * 0.6);
  const repasseMotorista = round2(liquido * 0.4);

  // Contagens
  const totalCorridasApp = rides.filter((r) => r.tipo === "App").length;
  const totalCorridasParticular = rides.filter((r) => r.tipo === "Particular").length;
  const totalCorridas = rides.length;

  // KM
  const kmRodado = round2(kmFinal - kmInicial);
  const valorKm = kmRodado > 0 ? round2(liquido / kmRodado) : 0;

  // Duração em minutos
  const duracaoMin = Math.floor((fim.getTime() - inicio.getTime()) / 1000 / 60);

  // Tickets médios
  const ticketMedioApp =
    totalCorridasApp > 0 ? round2(totalApp / totalCorridasApp) : 0;
  const ticketMedioParticular =
    totalCorridasParticular > 0
      ? round2(totalParticular / totalCorridasParticular)
      : 0;
  const ticketMedioGeral =
    totalCorridas > 0 ? round2(totalBruto / totalCorridas) : 0;

  return {
    totalApp,
    totalParticular,
    totalBruto,
    totalCustos,
    liquido,
    repasseEmpresa,
    repasseMotorista,
    totalCorridasApp,
    totalCorridasParticular,
    totalCorridas,
    duracaoMin,
    valorKm,
    ticketMedioApp,
    ticketMedioParticular,
    ticketMedioGeral,
    kmRodado,
  };
}
\`\`\`

---

## 📄 client/src/lib/format.ts (Formatação)

\`\`\`typescript
import { format as dateFnsFormat } from "date-fns";
import { ptBR } from "date-fns/locale";

// Formata moeda em BRL
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// Formata data e hora no formato 24h pt-BR
export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return dateFnsFormat(d, "dd/MM/yyyy HH:mm", { locale: ptBR });
}

// Formata apenas hora no formato 24h
export function formatTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return dateFnsFormat(d, "HH:mm", { locale: ptBR });
}

// Formata apenas data
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return dateFnsFormat(d, "dd/MM/yyyy", { locale: ptBR });
}

// Formata KM com separador de milhares
export function formatKm(km: number | null | undefined): string {
  if (km === null || km === undefined) return "0 km";
  return `${new Intl.NumberFormat("pt-BR").format(km)} km`;
}

// Formata duração em minutos para "Xh Ymin"
export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes) return "0 min";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

// Arredonda para 2 casas decimais
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

// Formata placa de veículo (uppercase)
export function formatPlate(plate: string): string {
  return plate.toUpperCase();
}
\`\`\`

---

## 📄 client/src/contexts/AuthContext.tsx (Autenticação)

\`\`\`typescript
import { createContext, useContext, useState, useEffect } from "react";
import type { Driver } from "@shared/schema";

interface AuthContextType {
  user: Driver | null;
  setUser: (user: Driver | null) => void;
  isAdmin: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Driver | null>(null);

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };
    checkAuth();
  }, []);

  const logout = () => {
    setUser(null);
    fetch("/api/auth/logout", { method: "POST" });
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, setUser, isAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
\`\`\`

---

## 📄 Arquivos de Configuração

### package.json

\`\`\`json
{
  "name": "rest-express",
  "version": "1.0.0",
  "type": "module",
  "license": "MIT",
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@jridgewell/trace-mapping": "^0.3.25",
    "@neondatabase/serverless": "^0.10.4",
    "@radix-ui/react-accordion": "^1.2.4",
    "@radix-ui/react-alert-dialog": "^1.1.7",
    "@radix-ui/react-aspect-ratio": "^1.1.3",
    "@radix-ui/react-avatar": "^1.1.4",
    "@radix-ui/react-checkbox": "^1.1.5",
    "@radix-ui/react-collapsible": "^1.1.4",
    "@radix-ui/react-context-menu": "^2.2.7",
    "@radix-ui/react-dialog": "^1.1.7",
    "@radix-ui/react-dropdown-menu": "^2.1.7",
    "@radix-ui/react-hover-card": "^1.1.7",
    "@radix-ui/react-label": "^2.1.3",
    "@radix-ui/react-menubar": "^1.1.7",
    "@radix-ui/react-navigation-menu": "^1.2.6",
    "@radix-ui/react-popover": "^1.1.7",
    "@radix-ui/react-progress": "^1.1.3",
    "@radix-ui/react-radio-group": "^1.2.4",
    "@radix-ui/react-scroll-area": "^1.2.4",
    "@radix-ui/react-select": "^2.1.7",
    "@radix-ui/react-separator": "^1.1.3",
    "@radix-ui/react-slider": "^1.2.4",
    "@radix-ui/react-slot": "^1.2.0",
    "@radix-ui/react-switch": "^1.1.4",
    "@radix-ui/react-tabs": "^1.1.4",
    "@radix-ui/react-toast": "^1.2.7",
    "@radix-ui/react-toggle": "^1.1.3",
    "@radix-ui/react-toggle-group": "^1.1.3",
    "@radix-ui/react-tooltip": "^1.2.0",
    "@tanstack/react-query": "^5.60.5",
    "@types/bcryptjs": "^2.4.6",
    "@types/uuid": "^10.0.0",
    "bcryptjs": "^3.0.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "connect-pg-simple": "^10.0.0",
    "cors": "^2.8.5",
    "date-fns": "^3.6.0",
    "drizzle-orm": "^0.39.1",
    "drizzle-zod": "^0.7.0",
    "embla-carousel-react": "^8.6.0",
    "express": "^4.21.2",
    "express-session": "^1.18.1",
    "framer-motion": "^11.13.1",
    "input-otp": "^1.4.2",
    "lucide-react": "^0.453.0",
    "memorystore": "^1.6.7",
    "next-themes": "^0.4.6",
    "passport": "^0.7.0",
    "passport-local": "^1.0.0",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.55.0",
    "react-icons": "^5.4.0",
    "react-resizable-panels": "^2.1.7",
    "recharts": "^2.15.2",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "tw-animate-css": "^1.2.5",
    "uuid": "^13.0.0",
    "vaul": "^1.1.2",
    "wouter": "^3.3.5",
    "ws": "^8.18.0",
    "zod": "^3.24.2",
    "zod-validation-error": "^3.4.0"
  },
  "devDependencies": {
    "@replit/vite-plugin-cartographer": "^0.4.1",
    "@replit/vite-plugin-dev-banner": "^0.1.1",
    "@replit/vite-plugin-runtime-error-modal": "^0.0.3",
    "@tailwindcss/typography": "^0.5.15",
    "@tailwindcss/vite": "^4.1.3",
    "@types/connect-pg-simple": "^7.0.3",
    "@types/express": "4.17.21",
    "@types/express-session": "^1.18.0",
    "@types/node": "20.16.11",
    "@types/passport": "^1.0.16",
    "@types/passport-local": "^1.0.38",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "@types/ws": "^8.5.13",
    "@vitejs/plugin-react": "^4.7.0",
    "autoprefixer": "^10.4.20",
    "drizzle-kit": "^0.31.4",
    "esbuild": "^0.25.0",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.17",
    "tsx": "^4.20.5",
    "typescript": "5.6.3",
    "vite": "^5.4.20"
  },
  "optionalDependencies": {
    "bufferutil": "^4.0.8"
  }
}
\`\`\`

### drizzle.config.ts

\`\`\`typescript
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
\`\`\`

### tailwind.config.ts

\`\`\`typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: ".5625rem", /* 9px */
        md: ".375rem", /* 6px */
        sm: ".1875rem", /* 3px */
      },
      colors: {
        // Flat / base colors (regular buttons)
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
          border: "hsl(var(--card-border) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
          border: "hsl(var(--popover-border) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
          border: "var(--primary-border)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
          border: "var(--secondary-border)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
          border: "var(--muted-border)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
          border: "var(--accent-border)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
          border: "var(--destructive-border)",
        },
        ring: "hsl(var(--ring) / <alpha-value>)",
        chart: {
          "1": "hsl(var(--chart-1) / <alpha-value>)",
          "2": "hsl(var(--chart-2) / <alpha-value>)",
          "3": "hsl(var(--chart-3) / <alpha-value>)",
          "4": "hsl(var(--chart-4) / <alpha-value>)",
          "5": "hsl(var(--chart-5) / <alpha-value>)",
        },
        sidebar: {
          ring: "hsl(var(--sidebar-ring) / <alpha-value>)",
          DEFAULT: "hsl(var(--sidebar) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
          border: "hsl(var(--sidebar-border) / <alpha-value>)",
        },
        "sidebar-primary": {
          DEFAULT: "hsl(var(--sidebar-primary) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-primary-foreground) / <alpha-value>)",
          border: "var(--sidebar-primary-border)",
        },
        "sidebar-accent": {
          DEFAULT: "hsl(var(--sidebar-accent) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-accent-foreground) / <alpha-value>)",
          border: "var(--sidebar-accent-border)"
        },
        status: {
          online: "rgb(34 197 94)",
          away: "rgb(245 158 11)",
          busy: "rgb(239 68 68)",
          offline: "rgb(156 163 175)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
```

---

**Nota:** Este arquivo contém os principais arquivos de código-fonte. Para ver todos os componentes React e rotas da API, consulte o repositório completo ou a DOCUMENTACAO_SISTEMA.md.

