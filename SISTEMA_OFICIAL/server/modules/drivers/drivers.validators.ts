
import { z } from "zod";

export const createDriverSchema = z.object({
    nome: z.string({ required_error: "Nome é obrigatório" }).min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string({ required_error: "Email é obrigatório" }).email("Email inválido"),
    senha: z.string({ required_error: "Senha é obrigatória" }).min(6, "Senha deve ter pelo menos 6 caracteres"),
    telefone: z.string().optional(),
    cnh: z.string().optional(),
    role: z.enum(["admin", "driver", "supervisor"]).default("driver").optional() // Added supervisor just in case
});

export const updateDriverSchema = createDriverSchema.partial(); // Email can be updated

export type CreateDriverInput = z.infer<typeof createDriverSchema>;
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>;
