-- Migration: Add Fixed Cost Installments Support
-- Date: 2025-12-22
-- Description: Adds support for tracking installment-based fixed costs (loans, recurring payments)
-- Step 1: Add new columns to fixed_costs table
ALTER TABLE fixed_costs
ADD COLUMN IF NOT EXISTS cost_type_id VARCHAR REFERENCES cost_types(id),
    ADD COLUMN IF NOT EXISTS vehicle_id UUID REFERENCES vehicles(id),
    ADD COLUMN IF NOT EXISTS vendor TEXT,
    ADD COLUMN IF NOT EXISTS total_installments INTEGER,
    ADD COLUMN IF NOT EXISTS start_date TIMESTAMP,
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
-- Step 2: Create fixed_cost_installments table
CREATE TABLE IF NOT EXISTS fixed_cost_installments (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    fixed_cost_id VARCHAR NOT NULL REFERENCES fixed_costs(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    due_date TIMESTAMP NOT NULL,
    valor NUMERIC(12, 2) NOT NULL,
    status TEXT DEFAULT 'Pendente' NOT NULL,
    paid_amount NUMERIC(12, 2),
    paid_date TIMESTAMP,
    notes TEXT,
    CONSTRAINT fk_fixed_cost FOREIGN KEY (fixed_cost_id) REFERENCES fixed_costs(id) ON DELETE CASCADE
);
-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fixed_cost_installments_fixed_cost_id ON fixed_cost_installments(fixed_cost_id);
CREATE INDEX IF NOT EXISTS idx_fixed_cost_installments_due_date ON fixed_cost_installments(due_date);
CREATE INDEX IF NOT EXISTS idx_fixed_cost_installments_status ON fixed_cost_installments(status);
-- Step 4: Add comments
COMMENT ON TABLE fixed_cost_installments IS 'Tracks individual installment payments for fixed costs (loans, recurring expenses)';
COMMENT ON COLUMN fixed_cost_installments.status IS 'Payment status: Pendente, Pago, Atrasado';