-- Migration: Add Performance Indexes
-- Description: Adds indexes to frequently queried columns to improve read performance
-- Created at: 2025-12-31
-- Index for Shifts filtering
CREATE INDEX IF NOT EXISTS idx_shifts_driver_status_inicio ON shifts(driver_id, status, inicio);
-- Index for Fraud Events filtering
CREATE INDEX IF NOT EXISTS idx_fraud_events_driver_status_detected ON fraud_events(driver_id, status, detected_at);
-- Index for Rides by Shift
CREATE INDEX IF NOT EXISTS idx_rides_shift_id ON rides(shift_id);