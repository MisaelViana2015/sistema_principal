
import { z } from "zod";

export const startShiftSchema = z.object({
    vehicleId: z.string({ required_error: "Veículo é obrigatório" }),
    driverId: z.string().optional(), // Pode vir do token
    kmInicial: z.number({ required_error: "KM Inicial é obrigatório" }).min(0)
});

export const finishShiftSchema = z.object({
    kmFinal: z.number({ required_error: "KM Final é obrigatório" }).min(0)
});

export const updateShiftSchema = z.object({
    vehicleId: z.string().optional(),
    driverId: z.string().optional(),
    kmInicial: z.number().optional(),
    kmFinal: z.number().optional(),
    startTime: z.string().or(z.date()).optional().transform(val => val ? new Date(val) : undefined),
    endTime: z.string().or(z.date()).optional().transform(val => val ? new Date(val) : undefined),
    status: z.enum(["open", "closed"]).optional()
});
