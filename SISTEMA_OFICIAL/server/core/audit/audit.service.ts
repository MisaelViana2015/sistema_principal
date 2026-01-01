/**
 * Serviço Central de Auditoria
 * 
 * Responsável por:
 * 1. Registrar todas as ações (audit_logs)
 * 2. Salvar histórico antes/depois (entity_history)
 * 3. Fornecer wrapper para operações auditadas (withAudit)
 * 
 * REGRAS OBRIGATÓRIAS:
 * - withAudit executa tudo dentro de uma transação
 * - beforeData e afterData são deep copies (structuredClone)
 * - DELETE sempre salva beforeData, afterData = null
 * - Nenhum log contém senha/token
 */

import { db } from "../db/connection.js";
import { auditLogs, entityHistory } from "../../../shared/schema.js";
import crypto from "crypto";
import type {
    AuditContext,
    LogActionParams,
    SaveHistoryParams,
    WithAuditParams,
    OperationType,
} from "./audit.types.js";

/**
 * Gera hash do payload para rastreabilidade
 * Remove campos voláteis (timestamp, nonce)
 */
function generatePayloadHash(payload: any): string {
    if (!payload) return '';

    // Remover campos voláteis
    const sanitized = { ...payload };
    delete sanitized.timestamp;
    delete sanitized.nonce;
    delete sanitized.createdAt;
    delete sanitized.updatedAt;

    return crypto
        .createHash('sha256')
        .update(JSON.stringify(sanitized))
        .digest('hex')
        .substring(0, 16);
}

/**
 * Cria deep copy de um objeto (snapshot imutável)
 */
function deepClone<T>(obj: T): T {
    if (obj === null || obj === undefined) return obj;

    // Usar structuredClone se disponível (Node 17+)
    if (typeof structuredClone === 'function') {
        return structuredClone(obj);
    }

    // Fallback para JSON parse/stringify
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Remove campos sensíveis do objeto antes de logar
 */
function sanitizeForLog(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized = { ...obj };
    const sensitiveFields = ['password', 'senha', 'token', 'refreshToken', 'temp_password_hash'];

    for (const field of sensitiveFields) {
        if (field in sanitized) {
            sanitized[field] = '[REDACTED]';
        }
    }

    return sanitized;
}

export const auditService = {
    /**
     * Registra uma ação no audit_logs
     */
    async logAction(params: LogActionParams): Promise<void> {
        const { action, entity, entityId, context, meta } = params;

        try {
            await db.insert(auditLogs).values({
                actorType: context.actorType,
                actorId: context.actorId,
                actorRole: context.actorRole,
                action,
                entity,
                entityId,
                source: context.source,
                requestId: context.requestId,
                ip: context.ip,
                userAgent: context.userAgent,
                meta: meta || {},
            });
        } catch (error) {
            // Log error but don't throw - audit should not break operations
            console.error('[AUDIT] Failed to log action:', error);
        }
    },

    /**
     * Salva histórico de alteração (antes/depois)
     */
    async saveHistory(params: SaveHistoryParams): Promise<void> {
        const { entity, entityId, operation, before, after, context, payloadHash, meta } = params;

        try {
            await db.insert(entityHistory).values({
                entity,
                entityId,
                operation,
                beforeData: before ? sanitizeForLog(deepClone(before)) : null,
                afterData: after ? sanitizeForLog(deepClone(after)) : null,
                actorType: context.actorType,
                actorId: context.actorId,
                actorRole: context.actorRole,
                source: context.source,
                requestId: context.requestId,
                payloadHash: payloadHash || null,
                meta: meta || {},
            });
        } catch (error) {
            console.error('[AUDIT] Failed to save history:', error);
        }
    },

    /**
     * Wrapper para operações auditadas
     * Executa tudo dentro de uma transação única
     * 
     * @example
     * const result = await auditService.withAudit({
     *     action: 'UPDATE_SHIFT',
     *     entity: 'shifts',
     *     entityId: shiftId,
     *     operation: 'UPDATE',
     *     context: req.auditContext,
     *     fetchBefore: () => getShiftById(shiftId),
     *     execute: () => updateShift(shiftId, data),
     *     fetchAfter: () => getShiftById(shiftId),
     * });
     */
    async withAudit<T>(params: WithAuditParams<T>): Promise<T> {
        const {
            action,
            entity,
            entityId,
            operation,
            context,
            fetchBefore,
            execute,
            fetchAfter,
            meta,
        } = params;

        // Determinar se precisa de before/after baseado na operação
        const needsBefore = operation === 'UPDATE' || operation === 'DELETE';
        const needsAfter = operation === 'INSERT' || operation === 'UPDATE';

        return await db.transaction(async (tx) => {
            // 1. Capturar estado anterior (deep copy)
            let before: any = null;
            if (needsBefore && fetchBefore) {
                before = deepClone(await fetchBefore());
            }

            // 2. Executar operação principal
            const result = await execute();

            // 3. Capturar estado posterior (deep copy)
            let after: any = null;
            if (needsAfter && fetchAfter) {
                after = deepClone(await fetchAfter());
            }

            // 4. Gerar hash do payload
            const payloadHash = generatePayloadHash(after || before);

            // 5. Registrar audit log
            await db.insert(auditLogs).values({
                actorType: context.actorType,
                actorId: context.actorId,
                actorRole: context.actorRole,
                action,
                entity,
                entityId,
                source: context.source,
                requestId: context.requestId,
                ip: context.ip,
                userAgent: context.userAgent,
                meta: meta || {},
            });

            // 6. Salvar histórico
            await db.insert(entityHistory).values({
                entity,
                entityId,
                operation,
                beforeData: before ? sanitizeForLog(before) : null,
                afterData: after ? sanitizeForLog(after) : null,
                actorType: context.actorType,
                actorId: context.actorId,
                actorRole: context.actorRole,
                source: context.source,
                requestId: context.requestId,
                payloadHash,
                meta: meta || {},
            });

            return result;
        });
    },

    /**
     * Cria contexto para operações de sistema (jobs, scripts)
     */
    createSystemContext(jobName: string): AuditContext {
        return {
            actorType: 'system',
            actorId: jobName,
            actorRole: 'scheduled-job',
            source: 'job',
            requestId: crypto.randomUUID(),
        };
    },

    /**
     * Cria contexto para operações de IA
     */
    createAIContext(aiEngine: string = 'rota-verde-ai'): AuditContext {
        return {
            actorType: 'ai',
            actorId: aiEngine,
            actorRole: 'ai-engine',
            source: 'ai',
            requestId: crypto.randomUUID(),
        };
    },
};
