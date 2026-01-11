/**
 * Tipos para o Sistema de Auditoria
 * Usados em todo o backend para garantir consistência
 */

/**
 * Tipo do ator que executou a ação
 */
export type ActorType = 'user' | 'admin' | 'ai' | 'system';

/**
 * Fonte da requisição
 */
export type SourceType = 'api' | 'web' | 'job' | 'ai';

/**
 * Tipo de operação no histórico
 */
export type OperationType = 'INSERT' | 'UPDATE' | 'DELETE';

/**
 * Contexto do ator para auditoria
 * Deve ser passado para todas as operações de escrita
 */
export interface AuditContext {
    actorType: ActorType;
    actorId: string | null;
    actorRole: string | null;
    source: SourceType;
    requestId: string;
    ip?: string;
    userAgent?: string;
}

/**
 * Parâmetros para logar uma ação
 */
export interface LogActionParams {
    action: string;
    entity: string;
    entityId?: string;
    context: AuditContext;
    meta?: Record<string, any>;
}

/**
 * Parâmetros para salvar histórico de entidade
 */
export interface SaveHistoryParams {
    entity: string;
    entityId: string;
    operation: OperationType;
    before: any | null;
    after: any | null;
    context: AuditContext;
    payloadHash?: string;
    meta?: Record<string, any>;
}

/**
 * Parâmetros para o wrapper withAudit
 */
export interface WithAuditParams<T> {
    action: string;
    entity: string;
    entityId: string;
    context: AuditContext;
    operation: OperationType;
    fetchBefore?: () => Promise<any>;
    execute: () => Promise<T>;
    fetchAfter?: (executionResult?: T) => Promise<any>;
    meta?: Record<string, any>;
}

/**
 * Constantes para ações semânticas padronizadas
 */
export const AUDIT_ACTIONS = {
    // Shifts
    START_SHIFT: 'START_SHIFT',
    UPDATE_SHIFT: 'UPDATE_SHIFT',
    FINISH_SHIFT: 'FINISH_SHIFT',
    CLOSE_SHIFT: 'CLOSE_SHIFT',
    DELETE_SHIFT: 'DELETE_SHIFT',

    // Rides
    CREATE_RIDE: 'CREATE_RIDE',
    UPDATE_RIDE: 'UPDATE_RIDE',
    DELETE_RIDE: 'DELETE_RIDE',

    // Expenses
    CREATE_EXPENSE: 'CREATE_EXPENSE',
    UPDATE_EXPENSE: 'UPDATE_EXPENSE',
    DELETE_EXPENSE: 'DELETE_EXPENSE',

    // Vehicles
    CREATE_VEHICLE: 'CREATE_VEHICLE',
    UPDATE_VEHICLE: 'UPDATE_VEHICLE',
    DELETE_VEHICLE: 'DELETE_VEHICLE',

    // Drivers
    CREATE_DRIVER: 'CREATE_DRIVER',
    UPDATE_DRIVER: 'UPDATE_DRIVER',
    DELETE_DRIVER: 'DELETE_DRIVER',
    DEACTIVATE_DRIVER: 'DEACTIVATE_DRIVER',

    // Financial
    CREATE_FIXED_COST: 'CREATE_FIXED_COST',
    UPDATE_FIXED_COST: 'UPDATE_FIXED_COST',
    DELETE_FIXED_COST: 'DELETE_FIXED_COST',
    PAY_INSTALLMENT: 'PAY_INSTALLMENT',

    // Admin
    RECALCULATE_TOTALS: 'RECALCULATE_TOTALS',
    ROLLBACK_ENTITY: 'ROLLBACK_ENTITY',

    // System
    JOB_CLEANUP: 'JOB_CLEANUP',
    JOB_RECALCULATE: 'JOB_RECALCULATE',

    // AI
    AI_AUTO_ADJUST: 'AI_AUTO_ADJUST',
} as const;
