-- Migration: Create indexes for Fraud Intelligence V2 performance
-- Index for filtering fraud events by driver (HistoryAgent, Heatmap)
CREATE INDEX IF NOT EXISTS idx_fraud_events_driver_id ON fraud_events (driver_id);
-- Index for filtering fraud events by shift (Orchestrator, Deduplication)
CREATE INDEX IF NOT EXISTS idx_fraud_events_shift_id ON fraud_events (shift_id);
-- Index for filtering fraud events by date/timestamp (Dashboard, Scheduler)
CREATE INDEX IF NOT EXISTS idx_fraud_events_detected_at ON fraud_events (detected_at DESC);
-- Index for filtering shifts by status (Scheduler looking for 'em_andamento')
CREATE INDEX IF NOT EXISTS idx_shifts_status_inicio ON shifts (status, inicio DESC);
-- Index for querying rides within a shift (AgentContext)
CREATE INDEX IF NOT EXISTS idx_rides_shift_id_hora ON rides (shift_id, hora);
-- Index for querying expenses within a shift (AgentContext)
CREATE INDEX IF NOT EXISTS idx_expenses_shift_id ON expenses (shift_id);