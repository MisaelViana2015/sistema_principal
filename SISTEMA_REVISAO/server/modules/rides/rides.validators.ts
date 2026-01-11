
import { z } from "zod";

export const createRideSchema = z.object({
    shiftId: z.string({ required_error: "ID do turno é obrigatório" }),
    tipo: z.enum(["APP", "PARTICULAR"], { required_error: "Tipo da corrida é obrigatório (APP ou PARTICULAR)" }),
    valor: z.number().min(0, "Valor não pode ser negativo").or(z.string()).transform(val => String(val)),
    hora: z.string().or(z.date()).optional().transform(val => val ? new Date(val) : new Date())
});

export const updateRideSchema = createRideSchema.partial();
