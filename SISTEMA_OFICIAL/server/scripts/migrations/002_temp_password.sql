-- Adicionar colunas na tabela drivers
ALTER TABLE drivers
ADD COLUMN IF NOT EXISTS temp_password_hash VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS temp_password_expires_at TIMESTAMPTZ NULL,
    ADD COLUMN IF NOT EXISTS must_reset_password BOOLEAN NOT NULL DEFAULT false;