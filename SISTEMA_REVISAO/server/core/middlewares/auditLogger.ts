import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { auditService } from "../audit/audit.service.js";
import type { AuditContext, ActorType, SourceType } from "../audit/audit.types.js";

/**
 * Middleware de Auditoria (Versão 2.0)
 *
 * Registra operações críticas no banco de dados (audit_logs).
 * Não salva dados sensíveis do body (senhas, tokens).
 *
 * IMPORTANTE: Este middleware loga a AÇÃO, não o histórico antes/depois.
 * Para histórico completo, use auditService.withAudit() nos services.
 *
 * @param action - Ação semântica (ex: 'CREATE_EXPENSE', 'FINISH_SHIFT')
 *                 Se não fornecida, usa o método + path como fallback.
 */
export function auditLog(action?: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;

        // Extrair entidade do path (ex: /api/shifts/123 -> shifts)
        const pathParts = req.path.split('/').filter(Boolean);
        const entity = pathParts[1] || 'unknown'; // [api, shifts, :id]
        const entityId = req.params.id || pathParts[2] || undefined;

        // Determinar tipo de ator
        const actorType: ActorType = user?.role === 'admin' || user?.role === 'supervisor'
            ? 'admin'
            : 'user';

        // Hash do payload para rastreabilidade
        const payloadHash = req.method !== 'GET'
            ? crypto.createHash('sha256').update(JSON.stringify(req.body)).digest('hex').substring(0, 16)
            : undefined;

        // Montar contexto
        const context: AuditContext = {
            actorType,
            actorId: user?.userId || null,
            actorRole: user?.role || null,
            source: 'api' as SourceType,
            requestId: (req as any).requestId || crypto.randomUUID(),
            ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip,
            userAgent: req.get('user-agent'),
        };

        // Determinar ação semântica
        const semanticAction = action || `${req.method}_${entity.toUpperCase()}`;

        // Log para console (debug/dev)
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[AUDIT] ${semanticAction} by ${context.actorType}:${context.actorId || 'anonymous'}`);
        }

        // Persistir no banco (async, não bloqueia)
        auditService.logAction({
            action: semanticAction,
            entity,
            entityId,
            context,
            meta: { payloadHash },
        }).catch((err: Error) => {
            console.error('[AUDIT] Failed to persist audit log:', err);
        });

        next();
    };
}

/**
 * Shorthand para uso sem parâmetro (retrocompatibilidade)
 */
export const auditLogMiddleware = auditLog();

/**
 * Middleware específico para ações críticas que DEVEM ser logadas
 * Falha silenciosamente se não conseguir logar (não bloqueia operação)
 */
export function criticalAudit(action: string) {
    return auditLog(action);
}
