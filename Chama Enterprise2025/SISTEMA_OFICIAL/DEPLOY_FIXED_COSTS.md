# Fixed Costs Enhancement - Deployment Guide

## Changes Deployed
- ✅ Enhanced `fixed_costs` table with installment tracking
- ✅ New `fixed_cost_installments` table
- ✅ Backend logic for automatic installment generation
- ✅ New API endpoint: `GET /api/financial/fixed-cost-installments`

## Railway Deployment Steps

### 1. Monitor Build
Check Railway dashboard for build status at:
https://railway.app/project/[your-project-id]

### 2. Run Migration (REQUIRED)
After successful build, run the migration:

```bash
# Connect to Railway PostgreSQL
railway connect [database-service-name]

# Or use the Railway CLI
railway run psql $DATABASE_URL -f server/migrations/add_fixed_cost_installments.sql
```

### 3. Verify Migration
```sql
-- Check if new table exists
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'fixed_cost_installments';

-- Check new columns in fixed_costs
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'fixed_costs';
```

## Testing After Deploy

### Test 1: Create Fixed Cost with Installments
```bash
curl -X POST https://your-app.railway.app/api/financial/fixed-costs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Empréstimo Veículo",
    "value": 893.00,
    "frequency": "Mensal",
    "dueDay": 10,
    "totalInstallments": 60,
    "startDate": "2025-01-01T00:00:00Z",
    "vendor": "Banco XYZ"
  }'
```

### Test 2: Get Installments
```bash
curl https://your-app.railway.app/api/financial/fixed-cost-installments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Rollback Plan
If issues occur:
```sql
-- Drop new table
DROP TABLE IF EXISTS fixed_cost_installments CASCADE;

-- Remove new columns
ALTER TABLE fixed_costs 
DROP COLUMN IF EXISTS cost_type_id,
DROP COLUMN IF EXISTS vehicle_id,
DROP COLUMN IF EXISTS vendor,
DROP COLUMN IF EXISTS total_installments,
DROP COLUMN IF EXISTS start_date,
DROP COLUMN IF EXISTS description,
DROP COLUMN IF EXISTS is_active;
```

## Notes
- Migration is backward compatible (uses IF NOT EXISTS)
- Existing fixed_costs data remains unchanged
- New features are opt-in (totalInstallments can be NULL)
