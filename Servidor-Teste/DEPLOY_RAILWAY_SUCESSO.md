# 🚀 Deploy Rota Verde - Railway - SUCESSO

**Data do Deploy:** 06/12/2024  
**Status:** ✅ OPERACIONAL

---

## 📋 Informações do Deploy

### URLs do Sistema
- **Aplicação Principal:** https://rt-frontend.up.railway.app
- **URL Alternativa:** https://rota-verde-production-f157.up.railway.app
- **Health Check:** https://rt-frontend.up.railway.app/api/health
- **Setup Database:** https://rt-frontend.up.railway.app/api/setup-database *(remover após uso)*

### Repositório GitHub
- **URL:** https://github.com/MisaelViana2015/rota-verde-06-12-25
- **Branch Principal:** `main`
- **Deploy Automático:** Ativado (push to main → deploy)

---

## 🔐 Credenciais e Acesso

### Usuário Administrador Padrão
- **Email:** `admin@rotaverde.com`
- **Senha:** `admin` *(TROCAR IMEDIATAMENTE)*
- **Role:** Administrador

### Railway
- **Projeto:** `FrontEndRV`
- **Environment:** `production`
- **Serviço Backend:** `rota-verde`

### Banco de Dados PostgreSQL
- **Projeto Railway:** `DB-RotaVerde06-12-2025`
- **Host Público:** `yamanote.proxy.rlwy.net:33836`
- **Usuário:** `postgres`
- **Senha:** `hkNUwGMmREdjqCDOmHkalRELQAgJPyWv`
- **Database:** `railway`
- **Connection String:** 
  ```
  postgresql://postgres:hkNUwGMmREdjqCDOmHkalRELQAgJPyWv@yamanote.proxy.rlwy.net:33836/railway
  ```

---

## 🏗️ Arquitetura do Deploy

### Stack Tecnológica
- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **ORM:** Drizzle ORM
- **Banco de Dados:** PostgreSQL 17.7
- **Autenticação:** JWT + Sessions
- **Build:** Nixpacks (Railway)

### Estrutura de Deploy
```
Railway Project: FrontEndRV
├── Serviço: rota-verde (Backend + Frontend)
│   ├── Build: npm run build
│   ├── Start: npm start
│   └── Port: 10000
│
Railway Project: DB-RotaVerde06-12-2025
└── PostgreSQL 17.7
    ├── Tabelas: drivers, sessions, __drizzle_migrations
    └── Conexão: Internal + Public Proxy
```

### Variáveis de Ambiente (rota-verde)
```bash
DATABASE_URL=postgresql://postgres:hkNUwGMmREdjqCDOmHkalRELQAgJPyWv@yamanote.proxy.rlwy.net:33836/railway
JWT_SECRET=SUAE8V4966CMWrXygWqF+K0ZQL2N1q7vh4vtQPXGJ7/4klbJEm2RbVw7ycSZzR2WyEJbZdVCk6mdf6rcLBsy2A==
NODE_ENV=production
PORT=10000
SESSION_SECRET=rota-verde-session-secret-2025
```

---

## 📦 Scripts do Projeto

### Desenvolvimento Local
```bash
npm run dev          # Inicia backend (porta 5000)
npx vite            # Inicia frontend (porta 5173)
```

### Build e Deploy
```bash
npm run build       # Compila backend (tsc) + frontend (vite)
npm start           # Inicia servidor em produção
```

### Banco de Dados
```bash
npm run db:push     # Sincroniza schema com banco
npm run db:studio   # Abre Drizzle Studio
npm run db:seed     # Popula banco com dados iniciais (interativo)
```

---

## 🔧 Configurações Importantes

### 1. Fast Startup (server/index.ts)
O servidor inicia o HTTP **imediatamente** e conecta ao banco em background:
```typescript
// Inicia servidor HTTP IMEDIATAMENTE
const server = app.listen(Number(PORT), () => {
    console.log(`✅ Servidor rodando na porta ${PORT}`);
});

// Conecta ao banco em background
testConnection().then((connected) => { ... });
```

### 2. API URL Relativa (client/src/lib/api.ts)
O frontend usa URL relativa em produção:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 
    (import.meta.env.DEV ? "http://localhost:5000/api" : "/api");
```

### 3. Servir Frontend em Produção (server/app.ts)
```typescript
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client")));
    app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api")) return next();
        res.sendFile(path.join(__dirname, "../client/index.html"));
    });
}
```

### 4. Healthcheck do Railway
- **Path:** `/api/health`
- **Retry Window:** 5 minutos
- **Response:** `"OK"` (200)

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Criadas
1. **drivers** - Motoristas/Usuários do sistema
   - Campos: id, nome, email, senha, telefone, role, is_active, created_at, updated_at
   
2. **sessions** - Sessões de autenticação
   - Campos: id, driver_id, token, ip_address, user_agent, created_at, expires_at

### Migrations
- Pasta: `server/scripts/db/migrations/`
- Arquivo inicial: `0000_faulty_bucky.sql`
- Sistema: Drizzle Kit

---

## 🚨 Problemas Resolvidos Durante o Deploy

### 1. ❌ Erro: `unknown command 'push'` no drizzle-kit
**Solução:** Removido `drizzle-kit push` do script `start`. Migrations via `/api/setup-database`.

### 2. ❌ Healthcheck falhando (rota não encontrada)
**Solução:** Adicionada rota `/api/health` além da `/health` existente.

### 3. ❌ Frontend chamando `localhost:5000` em produção
**Solução:** Alterado `API_URL` para usar caminho relativo `/api` em produção.

### 4. ❌ Banco de dados vazio após deploy
**Solução:** Criada rota `/api/setup-database` que roda migrations e cria usuário admin.

### 5. ❌ CSS não carregando (Tailwind)
**Solução:** Ajustado `tailwind.config.js` para incluir caminhos corretos.

---

## 📝 Tarefas Pós-Deploy

### Segurança
- [ ] Trocar senha do usuário `admin@rotaverde.com`
- [ ] Remover ou proteger rota `/api/setup-database`
- [ ] Configurar CORS apenas para domínios específicos
- [ ] Implementar rate limiting

### Dados
- [ ] Migrar dados do banco antigo (se necessário)
- [ ] Criar usuários adicionais
- [ ] Configurar backup automático do banco

### Infraestrutura
- [ ] Configurar domínio customizado (opcional)
- [ ] Monitorar uso de recursos no Railway
- [ ] Configurar alertas de erro/downtime

### Cleanup
- [ ] Remover serviço antigo `RotaVerdeProd` do Railway
- [ ] Deletar projetos/repositórios antigos

---

## 🔄 Como Fazer Deploy Manual

### Via Git Push (Automático)
```bash
git add .
git commit -m "Descrição das alterações"
git push origin main
# Railway detecta e faz deploy automaticamente
```

### Via Railway CLI
```bash
railway link
railway up --service rota-verde
```

---

## 🛟 Recuperação de Desastres

### Backup do Banco de Dados
```bash
# Conectar via psql
psql "postgresql://postgres:hkNUwGMmREdjqCDOmHkalRELQAgJPyWv@yamanote.proxy.rlwy.net:33836/railway"

# Backup completo
pg_dump "postgresql://postgres:..." > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
psql "postgresql://postgres:..." < backup.sql
```

### Rollback de Deploy
1. Acesse Railway Dashboard
2. Vá em Deployments
3. Clique em "Redeploy" no deploy anterior

### Recriação Completa do Ambiente
1. Clonar repositório: `git clone https://github.com/MisaelViana2015/rota-verde-06-12-25.git`
2. Instalar dependências: `npm install`
3. Configurar variáveis (`.env`)
4. Build: `npm run build`
5. Deploy no Railway: `railway up`

---

## 📞 Suporte e Manutenção

### Logs do Sistema
```bash
# Ver logs do Railway
railway logs --service rota-verde

# Ver logs em tempo real
railway logs --service rota-verde --follow

# Ver últimas 100 linhas
railway logs --service rota-verde -n 100
```

### Verificação de Status
- Health Check: `curl https://rt-frontend.up.railway.app/api/health`
- Status do DB: Acessar `/api/setup-database` (retorna success se conectado)

### Contatos
- **Desenvolvedor:** Antigravity AI
- **Repositório:** https://github.com/MisaelViana2015/rota-verde-06-12-25
- **Railway:** https://railway.app

---

## ✅ Checklist de Sucesso

- [x] Código no GitHub
- [x] Deploy no Railway funcionando
- [x] Banco de dados criado e conectado
- [x] Tabelas criadas via migrations
- [x] Usuário admin criado
- [x] Login funcionando
- [x] Dashboard acessível
- [x] Health check respondendo
- [x] Frontend servido corretamente
- [x] API funcionando
- [x] Documentação completa

---

**🎉 Deploy Concluído com Sucesso em 06/12/2024 🎉**
