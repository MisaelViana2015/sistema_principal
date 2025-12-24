# Migração de Produção - Custos Fixos

## ⚠️ INSTRUÇÕES PARA EXECUTAR NO RAILWAY

Após o deploy automático estar completo, execute os seguintes comandos no Railway CLI:

### 1. Criar as tabelas
```bash
railway run node server/scripts/db/create_fixed_costs_tables.js
```

### 2. Migrar os dados
```bash
railway run node server/scripts/db/migrate_vehicle_costs.js
```

### 3. Verificar a migração
```bash
railway run node server/scripts/db/verify_migration.js
```

## 🔍 Como verificar o deploy

1. Acesse o Railway Dashboard
2. Verifique se o deploy foi concluído com sucesso
3. Confira os logs para erros
4. Execute os scripts acima

## 📊 Resultado esperado

Após a migração:
- ✅ 3 Custos Fixos (Financiamentos)
- ✅ 179 Parcelas
- ✅ Status: 9 Pagas, 170 Pendentes

## ⚙️ Alternativa: Rodar localmente apontando para produção

Se preferir rodar da máquina local (mais seguro):

```bash
# 1. Exportar DATABASE_URL do Railway
export DATABASE_URL="postgresql://..." # Pegar do Railway

# 2. Executar os scripts
node server/scripts/db/create_fixed_costs_tables.js
node server/scripts/db/migrate_vehicle_costs.js
node server/scripts/db/verify_migration.js
```

## 🧹 Pós-migração (APENAS após validação)

Depois de confirmar que tudo está ok na UI de produção:

```sql
DELETE FROM vehicle_costs WHERE tipo ILIKE '%Prestação%';
```
