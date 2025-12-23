
import { z } from "zod";

// --- EXPENSES ---
export const createExpenseSchema = z.object({
    driverId: z.string().optional(),
    shiftId: z.string().optional(),
    costTypeId: z.string({ required_error: "Tipo de custo é obrigatório" }),
    value: z.number().or(z.string()).transform(val => String(val)), // Accept number or string, convert to string
    date: z.string().or(z.date()).transform(val => new Date(val)),
    notes: z.string().optional(),
    isParticular: z.boolean().default(false).optional()
});

export const updateExpenseSchema = createExpenseSchema.partial();

// --- FIXED COSTS ---
export const createFixedCostSchema = z.object({
    name: z.string({ required_error: "Nome é obrigatório" }),
    value: z.number().or(z.string()).transform(val => String(val)),
    frequency: z.enum(["Mensal", "Semanal", "Anual", "Único"]).default("Mensal"),
    dueDay: z.number().min(1).max(31).default(5),
    vehicleId: z.string().optional(),
    notes: z.string().optional()
});

export const updateFixedCostSchema = createFixedCostSchema.partial();

// --- COST TYPES ---
export const createCostTypeSchema = z.object({
    name: z.string({ required_error: "Nome é obrigatório" }),
    category: z.enum(["Fixo", "Variável"]).default("Variável"),
    description: z.string().optional(),
    icon: z.string().optional(),
    color: z.string().optional()
});

export const updateCostTypeSchema = createCostTypeSchema.partial();

// --- INSTALLMENTS ---
export const updateInstallmentSchema = z.object({
    status: z.enum(["paid", "pending"]),
    paymentDate: z.string().or(z.date()).optional().transform(val => val ? new Date(val) : undefined),
    value: z.number().or(z.string()).optional().transform(val => val ? String(val) : undefined)
});
