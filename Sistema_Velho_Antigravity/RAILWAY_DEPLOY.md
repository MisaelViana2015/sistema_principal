# 🚀 Deploy no Railway - Guia Rápido

## 📋 Pré-requisitos

1. Conta no Railway
2. Banco de dados Supabase configurado
3. Variáveis de ambiente prontas

## 🔧 Configuração das Variáveis de Ambiente no Railway

Adicione as seguintes variáveis no painel do Railway:

```bash
DATABASE_URL=postgresql://postgres:IcSwODHDspcXBNf@db.dnmyuiqbrhaomfliyjrq.supabase.co:5432/postgres?sslmode=require&pgbouncer=true

SESSION_SECRET=SUAE8V4966CMWrXygWqF+K0ZQL2N1q7vh4vtQPXGJ7/4klbJEm2RbVw7ycSZzR2WyEJbZdVCk6mdf6rcLBsy2A==

JWT_SECRET=SUAE8V4966CMWrXygWqF+K0ZQL2N1q7vh4vtQPXGJ7/4klbJEm2RbVw7ycSZzR2WyEJbZdVCk6mdf6rcLBsy2A==

NODE_ENV=production

# ⚠️ CRÍTICO: Força IPv4 para evitar erro ENETUNREACH
NODE_OPTIONS=--dns-result-order=ipv4first

PORT=10000
```

## 🚀 Deploy Automático

O Railway irá automaticamente:
1. ✅ Instalar dependências (`npm install`)
2. ✅ Fazer build do frontend (`npm run build`)
3. ✅ Fazer push do schema no banco (`npx drizzle-kit push`)
4. ✅ Iniciar o servidor (`npm run start`)

**⚠️ IMPORTANTE:** O seed do banco **NÃO** roda automaticamente no deploy.

## 🌱 Populando o Banco de Dados (Seed)

Após o primeiro deploy bem-sucedido, execute o seed **manualmente** via Railway CLI:

```bash
# Instale o Railway CLI (se ainda não tiver)
npm install -g @railway/cli

# Faça login
railway login

# Conecte ao projeto
railway link

# Execute o seed
railway run npm run db:seed
```

**Alternativa:** Use o terminal do Railway Dashboard:
1. Acesse o projeto no Railway Dashboard
2. Vá em "Settings" → "Deploy"
3. Clique em "Open Terminal"
4. Execute: `npm run db:seed`

## 🔍 Verificação

Após o deploy, verifique:
- ✅ Build concluído sem erros
- ✅ Servidor rodando na porta correta
- ✅ Conexão com banco de dados funcionando
- ✅ Login funcionando (após seed)

## 🐛 Troubleshooting

### Erro: `ENETUNREACH` ou `IPv6`
- ✅ **Solução:** Já configurado! Verifique se `NODE_OPTIONS=--dns-result-order=ipv4first` está nas variáveis de ambiente.

### Erro: `Failed query` durante seed
- ⚠️ **Causa:** Seed rodando durante o build
- ✅ **Solução:** Execute o seed manualmente após o deploy (veja seção acima)

### Erro: `DATABASE_URL não definida`
- ⚠️ **Causa:** Variável de ambiente não configurada
- ✅ **Solução:** Adicione todas as variáveis listadas acima no Railway Dashboard

## 📝 Notas Importantes

1. **IPv4 Forçado:** O projeto está configurado para usar IPv4 via DNS, resolvendo problemas de conectividade com Supabase.
2. **Seed Manual:** Por segurança e performance, o seed não roda automaticamente. Execute manualmente após o primeiro deploy.
3. **Porta Dinâmica:** O Railway define a porta automaticamente via variável `PORT`.
