-- ================================================================
-- MIGRAÇÃO 001: Criação de Índices de Performance
-- Sistema: Rota Verde
-- Data: 2025-12-30
-- ================================================================
-- Este arquivo é executado automaticamente pelo bootstrap.ts
-- IF NOT EXISTS garante idempotência (pode rodar várias vezes)
-- ================================================================
-- ========================
-- TABELA DE CONTROLE (se não existir)
-- ========================
CREATE TABLE IF NOT EXISTS _migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    executed_at TIMESTAMP DEFAULT NOW()
);
-- ========================
-- TABELA: shifts
-- ========================
CREATE INDEX IF NOT EXISTS idx_shifts_driver_id ON shifts(driver_id);
CREATE INDEX IF NOT EXISTS idx_shifts_vehicle_id ON shifts(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON shifts(status);
CREATE INDEX IF NOT EXISTS idx_shifts_inicio ON shifts(inicio);
-- ========================
-- TABELA: rides
-- ========================
CREATE INDEX IF NOT EXISTS idx_rides_shift_id ON rides(shift_id);
CREATE INDEX IF NOT EXISTS idx_rides_hora ON rides(hora);
-- ========================
-- TABELA: expenses
-- ========================
CREATE INDEX IF NOT EXISTS idx_expenses_driver_id ON expenses(driver_id);
CREATE INDEX IF NOT EXISTS idx_expenses_shift_id ON expenses(shift_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
-- ========================
-- TABELA: fixed_cost_installments
-- ========================
CREATE INDEX IF NOT EXISTS idx_fixed_cost_inst_id ON fixed_cost_installments(fixed_cost_id);
CREATE INDEX IF NOT EXISTS idx_fixed_cost_inst_due ON fixed_cost_installments(due_date);
CREATE INDEX IF NOT EXISTS idx_fixed_cost_inst_status ON fixed_cost_installments(status);
-- ========================
-- TABELA: fraud_events
-- ========================
CREATE INDEX IF NOT EXISTS idx_fraud_events_detected_at ON fraud_events(detected_at);
CREATE INDEX IF NOT EXISTS idx_fraud_events_driver_id ON fraud_events(driver_id);
CREATE INDEX IF NOT EXISTS idx_fraud_events_shift_id ON fraud_events(shift_id);
CREATE INDEX IF NOT EXISTS idx_fraud_events_status ON fraud_events(status);
-- ========================
-- TABELA: sessions
-- ========================
CREATE INDEX IF NOT EXISTS idx_sessions_driver_id ON sessions(driver_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
-- ========================
-- TABELA: fixed_costs
-- ========================
CREATE INDEX IF NOT EXISTS idx_fixed_costs_vehicle_id ON fixed_costs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fixed_costs_cost_type_id ON fixed_costs(cost_type_id);