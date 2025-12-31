import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

/**
 * Middleware de Auditoria
 * Registra metadados de operações críticas para fins de segurança e compliance.
 * Não salva dados sensíveis do body (senhas, tokens).
 * 
 * @param action - Ação semântica opcional (ex: 'CREATE_EXPENSE', 'FINISH_SHIFT')
 *                 Se não fornecida, usa o método + path como fallback.
 */
export function auditLog(action?: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;

        // Sanitização básica do body (remover campos sensíveis)
        const safeBody = { ...req.body };
        if (safeBody.password) safeBody.password = "[REDACTED]";
        if (safeBody.senha) safeBody.senha = "[REDACTED]";
        if (safeBody.token) safeBody.token = "[REDACTED]";

        // Hash do payload para rastreabilidade sem expor PII
        const payloadHash = req.method !== 'GET'
            ? crypto.createHash('sha256').update(JSON.stringify(req.body)).digest('hex').substring(0, 16)
            : undefined;

        const logEntry = {
            timestamp: new Date().toISOString(),
            eventType: "AUDIT_LOG",
            action: action || `${req.method}_${req.path.replace(/\//g, '_').toUpperCase()}`,
            userId: user?.userId || 'anonymous',
            userRole: user?.role || 'none',
            ip: req.headers['x-forwarded-for'] || req.ip,
            userAgent: req.get('user-agent'),
            method: req.method,
            path: req.path,
            params: Object.keys(req.params).length > 0 ? req.params : undefined,
            payloadHash, // Hash curto para identificar payload sem expor dados
        };

        // Em produção, isso iria para um arquivo de log estruturado ou serviço (Datadog, Logflare)
        console.log(JSON.stringify(logEntry));

        next();
    };
}

// Shorthand para uso sem parâmetro (retrocompatibilidade)
export const auditLogMiddleware = auditLog();


