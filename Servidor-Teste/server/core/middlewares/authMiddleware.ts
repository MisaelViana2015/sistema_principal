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

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedError("Token não fornecido");
        }

        const token = authHeader.substring(7); // Remove "Bearer "

        // Verifica token
        const payload = verifyToken(token);

        if (!payload) {
            throw new UnauthorizedError("Token inválido ou expirado");
        }

        // Adiciona dados do usuário na request
        req.user = payload;

        next();
    } catch (error) {
        next(error);
    }
}

/**
 * Middleware que exige role de ADMIN
 * Deve ser usado APÓS requireAuth
 */
export function requireAdmin(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        if (!req.user) {
            throw new UnauthorizedError("Usuário não autenticado");
        }

        if (req.user.role !== UserRole.ADMIN) {
            throw new ForbiddenError("Acesso restrito a administradores");
        }

        next();
    } catch (error) {
        next(error);
    }
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
