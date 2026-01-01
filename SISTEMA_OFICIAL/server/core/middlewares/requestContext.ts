/**
 * Middleware de Contexto de Requisição
 * 
 * Responsável por:
 * 1. Gerar requestId único para cada requisição
 * 2. Montar AuditContext baseado no usuário autenticado
 * 3. Anexar ao req para uso nos services
 */

import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import type { AuditContext, ActorType, SourceType } from "../audit/audit.types.js";

// Extensão do Request do Express
declare global {
    namespace Express {
        interface Request {
            requestId: string;
            auditContext: AuditContext;
        }
    }
}

/**
 * Determina o tipo de ator baseado no role do usuário
 */
function determineActorType(role?: string): ActorType {
    if (!role) return 'user';

    const adminRoles = ['admin', 'supervisor'];
    if (adminRoles.includes(role)) {
        return 'admin';
    }

    return 'user';
}

/**
 * Extrai IP real considerando proxies
 */
function extractRealIP(req: Request): string {
    const forwardedFor = req.headers['x-forwarded-for'];

    if (forwardedFor) {
        // x-forwarded-for pode ter múltiplos IPs separados por vírgula
        const ips = Array.isArray(forwardedFor)
            ? forwardedFor[0]
            : forwardedFor.split(',')[0];
        return ips.trim();
    }

    return req.ip || 'unknown';
}

/**
 * Middleware para adicionar contexto de auditoria a cada requisição
 */
export function requestContext(req: Request, res: Response, next: NextFunction) {
    // Gerar ID único para a requisição
    req.requestId = crypto.randomUUID();

    // Extrair usuário do middleware de autenticação
    const user = (req as any).user;

    // Montar contexto de auditoria
    req.auditContext = {
        actorType: determineActorType(user?.role),
        actorId: user?.userId || null,
        actorRole: user?.role || null,
        source: 'api' as SourceType,
        requestId: req.requestId,
        ip: extractRealIP(req),
        userAgent: req.get('user-agent'),
    };

    // Adicionar requestId ao header da resposta para correlação
    res.setHeader('X-Request-ID', req.requestId);

    next();
}

/**
 * Cria contexto para rotas públicas (não autenticadas)
 */
export function publicRequestContext(req: Request, res: Response, next: NextFunction) {
    req.requestId = crypto.randomUUID();

    req.auditContext = {
        actorType: 'user',
        actorId: null,
        actorRole: null,
        source: 'api',
        requestId: req.requestId,
        ip: extractRealIP(req),
        userAgent: req.get('user-agent'),
    };

    res.setHeader('X-Request-ID', req.requestId);

    next();
}
