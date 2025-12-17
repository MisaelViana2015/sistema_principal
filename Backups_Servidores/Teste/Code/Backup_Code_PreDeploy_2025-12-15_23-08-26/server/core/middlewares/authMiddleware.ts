import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../security/jwt.js";
import { UnauthorizedError, ForbiddenError } from "../errors/AppError.js";
import { UserRole } from "../../../shared/types.js";

/**
 * MIDDLEWARES DE AUTENTICAÇÃO E AUTORIZAÇÃO
 * 
 * REGRA: Proteger rotas que exigem login
 * Verificar permissões baseadas em roles
 */

// Estende o tipo Request do Express para incluir user
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

/**
 * Middleware que exige autenticação
 * Verifica se o token JWT é válido
 */
export function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        // Busca token do header Authorization
        const authHeader = req.headers.authorization;

        // DEBUG: Rastrear origem do erro "Token não fornecido"
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.warn(`[AuthMiddleware] Header inválido ou ausente. Recebido: '${authHeader}'`);
            throw new UnauthorizedError("Token não fornecido");
        }

        const token = authHeader.substring(7); // Remove "Bearer "

        // Verifica token
        const payload = verifyToken(token);

        if (!payload) {
            console.warn(`[AuthMiddleware] verifyToken retornou null. Token scan (10 chars): ${token.substring(0, 10)}...`);
            throw new UnauthorizedError("Token inválido ou expirado");
        }

        // Adiciona dados do usuário na request
        req.user = payload;

        next();
    } catch (error: any) {
        console.error(`[AuthMiddleware] Erro capturado: ${error.message}`, error);
        next(error);
    }
}

/**
 * Middleware que exige role de ADMIN
 * Deve ser usado APÓS requireAuth
 */
type Role = "admin" | "driver" | "supervisor";

/**
 * Middleware que controla acesso por Role (RBAC Granular)
 * Exemplo: requireRole("admin", "supervisor")
 */
export const requireRole = (...roles: Role[]) =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw new UnauthorizedError("Usuário não autenticado");
            }

            if (!roles.includes(req.user.role as Role)) {
                throw new ForbiddenError("Sem permissão para este recurso");
            }

            next();
        } catch (error) {
            next(error);
        }
    };

/**
 * Middleware que exige role de ADMIN
 * (Mantido por compatibilidade, mas o ideal é migrar para requireRole)
 */
export function requireAdmin(
    req: Request,
    res: Response,
    next: NextFunction
) {
    return requireRole("admin")(req, res, next);
}

/**
 * Middleware opcional de autenticação
 * Não bloqueia se não houver token, mas adiciona user se houver
 */
export function optionalAuth(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.substring(7);
            const payload = verifyToken(token);

            if (payload) {
                req.user = payload;
            }
        }

        next();
    } catch (error) {
        // Ignora erros em auth opcional
        next();
    }
}
