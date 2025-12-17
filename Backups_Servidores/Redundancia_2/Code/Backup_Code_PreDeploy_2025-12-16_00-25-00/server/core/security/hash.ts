import bcrypt from "bcryptjs";
import { SECURITY_CONFIG } from "../../../shared/constants.js";

/**
 * FUNÇÕES DE HASH E VERIFICAÇÃO DE SENHA
 * 
 * REGRA: NUNCA armazenar senhas em texto plano
 * Sempre usar bcrypt com rounds adequados (10 rounds = bom equilíbrio)
 */

/**
 * Gera hash bcrypt de uma senha
 */
export async function hashPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, SECURITY_CONFIG.BCRYPT_ROUNDS);
    return hash;
}

/**
 * Verifica se uma senha corresponde ao hash
 */
export async function verifyPassword(
    password: string,
    hash: string
): Promise<boolean> {
    const isValid = await bcrypt.compare(password, hash);
    return isValid;
}

/**
 * Valida força mínima da senha
 */
export function validatePasswordStrength(password: string): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
        errors.push(
            `Senha deve ter no mínimo ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} caracteres`
        );
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
