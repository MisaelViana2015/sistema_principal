-- Migration: Fix fraud_events.metadata column type
-- Description: Converts metadata column from text to jsonb to match Schema
-- Created at: 2025-12-31
ALTER TABLE fraud_events
ALTER COLUMN metadata TYPE jsonb USING metadata::jsonb;