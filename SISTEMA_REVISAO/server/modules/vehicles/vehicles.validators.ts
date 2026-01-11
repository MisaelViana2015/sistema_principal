
import { z } from "zod";

/**
 * SCHEMAS DE VALIDAÇÃO - MÓDULO VEHICLES
 *
 * REGRA: Toda entrada de dados deve ser validada com Zod
 * antes de chegar no service ou repository
 */

export const createVehicleSchema = z.object({
    placa: z
        .string({ required_error: "Placa é obrigatória" })
        .min(7, "Placa deve ter 7 caracteres")
        .max(8, "Placa deve ter no máximo 8 caracteres")
        .trim()
        .toUpperCase(),
    modelo: z
        .string({ required_error: "Modelo é obrigatório" })
        .min(2, "Modelo deve ter pelo menos 2 caracteres")
        .trim(),
    kmInicial: z
        .preprocess((val) => Number(val), z.number({ required_error: "KM Inicial é obrigatório" }).min(0, "KM não pode ser negativo")),
    motoristaPadraoId: z
        .string()
        .optional()
        .nullable(),
    color: z
        .string()
        .optional()
        .nullable(),
    imageUrl: z
        .string()
        .url("URL da imagem inválida")
        .or(z.literal(""))
        .optional()
        .nullable(),
    isActive: z
        .boolean()
        .optional()
        .default(true),
    status: z
        .enum(['ativo', 'manutencao', 'indisponivel'])
        .optional()
        .default('ativo'),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
