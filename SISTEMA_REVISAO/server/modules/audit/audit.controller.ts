import { Request, Response, NextFunction } from "express";
import { db } from "../../core/db/connection.js";
import { auditLogs, entityHistory } from "../../../shared/schema.js";
import { desc, eq, and, gte, lte, like, sql } from "drizzle-orm";

// Helper para sanitização de saída (Egress)
function sanitizeOutput(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    const sanitized = { ...obj };
    const sensitiveFields = ['password', 'senha', 'token', 'refreshToken', 'temp_password_hash', 'temp_password_expires_at', 'password_hash'];

    for (const field of sensitiveFields) {
        if (field in sanitized) sanitized[field] = '[REDACTED]';
    }

    // Recursão
    for (const key in sanitized) {
        if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
            sanitized[key] = sanitizeOutput(sanitized[key]);
        }
    }
    return sanitized;
}

export const auditController = {
    /**
     * GET /api/audit/logs
     * Retorna logs de auditoria com filtros e paginação
     */
    async getLogs(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                page = "1",
                limit = "50",
                entity,
                action,
                actorType,
                actorId,
                startDate,
                endDate,
                search
            } = req.query;

            const pageNum = Math.max(1, parseInt(page as string) || 1);
            const limitNum = Math.min(Math.max(1, parseInt(limit as string) || 50), 100);
            const offset = (pageNum - 1) * limitNum;

            // Construir filtros dinamicamente
            const conditions: any[] = [];

            if (entity) {
                conditions.push(eq(auditLogs.entity, entity as string));
            }
            if (action) {
                conditions.push(eq(auditLogs.action, action as string));
            }
            if (actorType) {
                conditions.push(eq(auditLogs.actorType, actorType as string));
            }
            if (actorId) {
                conditions.push(eq(auditLogs.actorId, actorId as string));
            }
            if (startDate) {
                conditions.push(gte(auditLogs.createdAt, new Date(startDate as string)));
            }
            if (endDate) {
                conditions.push(lte(auditLogs.createdAt, new Date(endDate as string)));
            }

            // TODO: Implementar busca textual global se necessário no futuro
            if (search) {
                // Placeholder para futura implementação de busca full-text
            }

            // Query com filtros
            const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

            const [logs, countResult] = await Promise.all([
                db.select()
                    .from(auditLogs)
                    .where(whereClause)
                    .orderBy(desc(auditLogs.createdAt))
                    .limit(limitNum)
                    .offset(offset),
                db.select({ count: sql<number>`count(*)` })
                    .from(auditLogs)
                    .where(whereClause)
            ]);

            const total = Number(countResult[0]?.count || 0);

            res.json({
                data: logs,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum)
                }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/audit/history/:entity/:entityId
     * Retorna histórico de alterações de uma entidade específica
     */
    async getEntityHistory(req: Request, res: Response) {
        try {
            const { entity, entityId } = req.params;
            const history = await db.select()
                .from(entityHistory)
                .where(and(eq(entityHistory.entity, entity), eq(entityHistory.entityId, entityId)))
                .orderBy(desc(entityHistory.createdAt));

            // Sanitizar dados históricos antes de enviar
            const sanitizedHistory = history.map(h => ({
                ...h,
                beforeData: h.beforeData ? sanitizeOutput(h.beforeData) : null,
                afterData: h.afterData ? sanitizeOutput(h.afterData) : null,
            }));

            res.json({ data: sanitizedHistory });
        } catch (error) {
            console.error("Error fetching history:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    /**
     * GET /api/audit/stats
     * Retorna estatísticas de auditoria
     */
    async getStats(req: Request, res: Response, next: NextFunction) {
        try {
            const [totalLogs, totalHistory, byEntity, byActor] = await Promise.all([
                db.select({ count: sql<number>`count(*)` }).from(auditLogs),
                db.select({ count: sql<number>`count(*)` }).from(entityHistory),
                db.select({
                    entity: auditLogs.entity,
                    count: sql<number>`count(*)`
                }).from(auditLogs).groupBy(auditLogs.entity),
                db.select({
                    actorType: auditLogs.actorType,
                    count: sql<number>`count(*)`
                }).from(auditLogs).groupBy(auditLogs.actorType)
            ]);

            res.json({
                totalLogs: Number(totalLogs[0]?.count || 0),
                totalHistory: Number(totalHistory[0]?.count || 0),
                byEntity: byEntity.map(e => ({ entity: e.entity, count: Number(e.count) })),
                byActor: byActor.map(a => ({ actorType: a.actorType, count: Number(a.count) }))
            });
        } catch (error) {
            next(error);
        }
    }
};
