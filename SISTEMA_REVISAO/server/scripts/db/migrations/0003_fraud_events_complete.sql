-- Migration: Completar schema da tabela fraud_events - VERSÃO CORRIGIDA
-- Adiciona todas as colunas necessárias para o sistema de detecção de fraudes
-- 1. Garantir que a coluna shift_id existe (falhou na execução anterior)
ALTER TABLE fraud_events
ADD COLUMN IF NOT EXISTS shift_id VARCHAR;
-- 2. Adicionar outras colunas faltantes
ALTER TABLE fraud_events
ADD COLUMN IF NOT EXISTS driver_id VARCHAR;
ALTER TABLE fraud_events
ADD COLUMN IF NOT EXISTS vehicle_id VARCHAR;
ALTER TABLE fraud_events
ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0;
ALTER TABLE fraud_events
ADD COLUMN IF NOT EXISTS risk_level VARCHAR DEFAULT 'low';
ALTER TABLE fraud_events
ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'pendente';
ALTER TABLE fraud_events
ADD COLUMN IF NOT EXISTS rules JSONB;
ALTER TABLE fraud_events
ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE fraud_events
ADD COLUMN IF NOT EXISTS detected_at TIMESTAMP DEFAULT NOW();
ALTER TABLE fraud_events
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
ALTER TABLE fraud_events
ADD COLUMN IF NOT EXISTS comment TEXT;
-- 3. Renomear coluna reason para type (se existir e ainda não foi renomeada)
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'fraud_events'
        AND column_name = 'reason'
) THEN
ALTER TABLE fraud_events
    RENAME COLUMN reason TO type;
END IF;
END $$;
-- 4. Criar índices para performance (agora deve funcionar pois shift_id existe)
CREATE INDEX IF NOT EXISTS idx_fraud_events_driver ON fraud_events(driver_id);
CREATE INDEX IF NOT EXISTS idx_fraud_events_vehicle ON fraud_events(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fraud_events_status ON fraud_events(status);
CREATE INDEX IF NOT EXISTS idx_fraud_events_detected ON fraud_events(detected_at);
CREATE INDEX IF NOT EXISTS idx_fraud_events_risk_level ON fraud_events(risk_level);
CREATE INDEX IF NOT EXISTS idx_fraud_events_shift ON fraud_events(shift_id);