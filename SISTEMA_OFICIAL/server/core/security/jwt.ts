import jwt from "jsonwebtoken";
import { SECURITY_CONFIG } from "../../../shared/constants.js";
import { UserRole } from "../../../shared/types.js";

/**
 * FUNÇÕES DE JWT (JSON Web Token)
 * 
 * REGRA: Tokens devem ter tempo de expiração
 * NUNCA armazenar informações sensíveis no payload
 */

// Validação do JWT_SECRET
if (!process.env.JWT_SECRET) {
    throw new Error("❌ JWT_SECRET não definido no .env");
}

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Payload do token JWT
 */
export interface JwtPayload {
    userId: string;
    email: string;
    role: UserRole;
}

/**
 * Gera um token JWT
 */
export function generateToken(payload: JwtPayload): string {
    // FASE 1: TTL de 2h para evitar quebra de sessão
    // Futuro (v1.7): Reduzir para 30m quando refresh token estiver ativo
    const expiresIn = process.env.ACCESS_TOKEN_TTL || "2h";

    const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: expiresIn as any, // Cast to avoid TS overload confusion with dynamic string
    });

    return token;
}

/**
 * Verifica e decodifica um token JWT
 */
export function verifyToken(token: string): JwtPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        return decoded;
    } catch (error) {
        // Token inválido ou expirado
        return null;
    }
}

/**
 * Decodifica token sem verificar (útil para debug)
 */
export function decodeToken(token: string): JwtPayload | null {
    try {
        const decoded = jwt.decode(token) as JwtPayload;
        return decoded;
    } catch (error) {
        return null;
    }
}
