-- ================================================================
-- ROTA VERDE - CRIAÇÃO DE ÍNDICES DE PERFORMANCE
-- Executar uma única vez no banco de produção (Neon)
-- Data: 2025-12-30
-- ================================================================
-- Usar IF NOT EXISTS para ser idempotente (pode rodar várias vezes sem erro)
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
-- TABELA: sessions (para limpeza de sessões expiradas)
-- ========================
CREATE INDEX IF NOT EXISTS idx_sessions_driver_id ON sessions(driver_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
-- ========================
-- TABELA: fixed_costs
-- ========================
CREATE INDEX IF NOT EXISTS idx_fixed_costs_vehicle_id ON fixed_costs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fixed_costs_cost_type_id ON fixed_costs(cost_type_id);
-- ========================
-- VERIFICAÇÃO
-- ========================
-- Listar todos os índices criados:
SELECT tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
ORDER BY tablename,
    indexname;