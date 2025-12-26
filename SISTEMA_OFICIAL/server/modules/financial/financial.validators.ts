
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
    vehicleId: z.string().optional().transform(val => val === "" ? undefined : val),
    costTypeId: z.string().optional().transform(val => val === "" ? undefined : val),
    notes: z.string().optional().transform(val => val === "" ? undefined : val),
    vendor: z.string().optional().transform(val => val === "" ? undefined : val),
    description: z.string().optional().transform(val => val === "" ? undefined : val),
    totalInstallments: z.number().or(z.string()).transform(val => Number(val)).optional(),
    startDate: z.string().or(z.date()).transform(val => val ? new Date(val) : undefined).optional()
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
    status: z.enum(["Pago", "Pendente"]).optional(),
    paidDate: z.string().or(z.date()).nullable().optional().transform(val => val ? new Date(val) : null),
    paidAmount: z.number().or(z.string()).nullable().optional().transform(val => val != null ? String(val) : null),
    value: z.number().or(z.string()).optional().transform(val => val ? String(val) : undefined),
    dueDate: z.string().or(z.date()).optional().transform(val => val ? new Date(val) : undefined)
});
