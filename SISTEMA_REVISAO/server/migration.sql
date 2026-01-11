-- Migration: Add Audit System Tables
-- Date: 2026-01-01
-- Description: Creates audit_logs and entity_history tables for complete system traceability
-- ============================================
-- AUDIT_LOGS - Registro de todas as ações
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Identificação do Ator
    actor_type TEXT NOT NULL,
    -- 'user' | 'admin' | 'ai' | 'system'
    actor_id VARCHAR(36),
    actor_role TEXT,
    -- Ação Semântica
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id VARCHAR(36),
    -- Contexto da Request
    source TEXT DEFAULT 'api',
    request_id VARCHAR(36),
    ip TEXT,
    user_agent TEXT,
    -- Metadata
    meta JSONB DEFAULT '{}'::jsonb
);
-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs (entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs (actor_type, actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);
-- ============================================
-- ENTITY_HISTORY - Histórico antes/depois
-- ============================================
CREATE TABLE IF NOT EXISTS entity_history (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Entidade Afetada
    entity TEXT NOT NULL,
    entity_id VARCHAR(36) NOT NULL,
    operation TEXT NOT NULL,
    -- 'INSERT' | 'UPDATE' | 'DELETE'
    -- Snapshots
    before_data JSONB,
    after_data JSONB,
    -- Identificação do Ator
    actor_type TEXT NOT NULL,
    actor_id VARCHAR(36),
    actor_role TEXT,
    -- Contexto
    source TEXT DEFAULT 'api',
    request_id VARCHAR(36),
    payload_hash TEXT,
    -- Metadata
    meta JSONB DEFAULT '{}'::jsonb
);
-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_entity_history_created_at ON entity_history (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_entity_history_entity ON entity_history (entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_history_actor ON entity_history (actor_type, actor_id);