import { z } from "zod";
import { SECURITY_CONFIG } from "../../../shared/constants.js";

/**
 * SCHEMAS DE VALIDAÇÃO - MÓDULO AUTH
 * 
 * REGRA: Toda entrada de dados deve ser validada com Zod
 * antes de chegar no service ou repository
 */

/**
 * Schema para login
 */
export const loginSchema = z.object({
    email: z
        .string()
        .email("Email inválido")
        .toLowerCase()
        .trim(),
    senha: z
        .string()
        .min(SECURITY_CONFIG.PASSWORD_MIN_LENGTH,
            `Senha deve ter no mínimo ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} caracteres`
        ),
});

/**
 * Schema para criar novo driver/usuário
 */
export const createDriverSchema = z.object({
    nome: z
        .string()
        .min(3, "Nome deve ter no mínimo 3 caracteres")
        .trim(),
    email: z
        .string()
        .email("Email inválido")
        .toLowerCase()
        .trim(),
    senha: z
        .string()
        .min(SECURITY_CONFIG.PASSWORD_MIN_LENGTH,
            `Senha deve ter no mínimo ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} caracteres`
        ),
    telefone: z
        .string()
        .optional(),
    role: z
        .enum(["admin", "driver"])
        .optional()
        .default("driver"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateDriverInput = z.infer<typeof createDriverSchema>;
