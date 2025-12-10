# 🔧 AMBIENTE DE HOMOLOGAÇÃO (HML)

**Data:** 07/12/2025  
**Objetivo:** Ambiente seguro para testes sem afetar produção

---

## 🎯 ESTRUTURA DE AMBIENTES

### 🟢 PRODUÇÃO (PROD)
```
URL: https://rt-frontend.up.railway.app
BD: DB-RotaVerde06-12-2025
Branch: main
Status: ✅ ESTÁVEL - NÃO MEXER
```

### 🔧 HOMOLOGAÇÃO (HML)
```
URL: https://rota-verde-hml.up.railway.app (a criar)
BD: DB-RotaVerde-HML
Token: 26ab649b-13ee-4599-89f6-bcf3908f3318
Branch: develop
Status: 🔧 DESENVOLVIMENTO
```

---

## 📦 BANCO DE DADOS HML

### Credenciais (Railway)
```
ID: 26ab649b-13ee-4599-89f6-bcf3908f3318
Username: postgres
Password: BDnSvDzpOoQcJsRPSvkZnoDfFOCCwbKR
Host: postgres.railway.internal
Port: 5432
Database: railway
```

### DATABASE_URL (Interna)
```
postgresql://postgres:BDnSvDzpOoQcJsRPSvkZnoDfFOCCwbKR@postgres.railway.internal:5432/railway
```

### DATABASE_PUBLIC_URL (Externa)
```
postgresql://postgres:BDnSvDzpOoQcJsRPSvkZnoDfFOCCwbKR@turntable.proxy.rlwy.net:21162/railway
```

---

## 🚀 CRIAR SERVIÇO NO RAILWAY

### 1. Criar Novo Serviço
1. Acesse o projeto no Railway
2. Clique em **"+ New Service"**
3. Selecione **"GitHub Repo"**
4. Escolha: `MisaelViana2015/rota-verde-06-12-25`
5. Nome do serviço: **`rota-verde-hml`**

### 2. Configurar Branch
1. Vá em **Settings** do serviço
2. Em **Source** → **Branch**
3. Mude de `main` para `develop`
4. Salvar

### 3. Adicionar Variáveis de Ambiente

Vá em **Variables** e adicione:

```env
DATABASE_URL=postgresql://postgres:BDnSvDzpOoQcJsRPSvkZnoDfFOCCwbKR@postgres.railway.internal:5432/railway

JWT_SECRET=HML_JWT_SECRET_2025_HOMOLOGACAO_ROTA_VERDE_TESTE

SESSION_SECRET=HML_SESSION_SECRET_2025_HOMOLOGACAO_ROTA_VERDE_TESTE

NODE_ENV=production

PORT=10000

FRONTEND_URL=${{RAILWAY_PUBLIC_DOMAIN}}
```

### 4. Conectar ao Banco HML
1. Vá em **Settings** do serviço
2. Em **Service Variables**
3. Clique em **"+ Variable Reference"**
4. Selecione o banco **Postgres** (HML)
5. Adicione todas as variáveis do banco

---

## 🌿 CRIAR BRANCH DEVELOP

### No Terminal Local:

```bash
# Criar branch develop
git checkout -b develop

# Verificar branch atual
git branch

# Push da branch para GitHub
git push -u origin develop
```

---

## 📋 WORKFLOW DE DESENVOLVIMENTO

### 1. Desenvolvimento Local
```bash
# Trabalhar na branch develop
git checkout develop

# Fazer alterações
# ...

# Commit
git add .
git commit -m "feat: nova funcionalidade"

# Push
git push origin develop
```

### 2. Deploy Automático HML
- Railway detecta push na branch `develop`
- Faz build e deploy automático
- Testa em: `https://rota-verde-hml.up.railway.app`

### 3. Aprovar e Promover para PROD
```bash
# Se tudo OK em HML, fazer merge para main
git checkout main
git merge develop
git push origin main
```

### 4. Deploy Automático PROD
- Railway detecta push na branch `main`
- Faz build e deploy automático
- Produção atualizada: `https://rt-frontend.up.railway.app`

---

## ✅ CHECKLIST DE CONFIGURAÇÃO

### Banco de Dados HML
- [x] Criado no Railway
- [x] Credenciais anotadas
- [ ] Schema aplicado
- [ ] Usuário admin criado
- [ ] Dados de teste inseridos

### Serviço Railway HML
- [ ] Serviço criado
- [ ] Branch `develop` configurada
- [ ] Variáveis de ambiente adicionadas
- [ ] Conectado ao BD HML
- [ ] Deploy realizado
- [ ] URL funcionando

### Git
- [ ] Branch `develop` criada
- [ ] Push para GitHub
- [ ] Railway conectado à branch

### Testes
- [ ] Login funciona
- [ ] Dashboard funciona
- [ ] Menus novos funcionam
- [ ] Dark mode funciona

---

## 🧪 COMO TESTAR

### 1. Aplicar Schema no BD HML

```bash
# Criar script para aplicar schema
npx tsx server/scripts/db/apply-schema.ts
```

### 2. Criar Usuário Admin HML

```bash
# Criar admin
npx tsx server/scripts/db/create-admin-simple.ts
```

### 3. Testar Localmente com BD HML

No `.env.hml`:
```env
DATABASE_URL=postgresql://postgres:BDnSvDzpOoQcJsRPSvkZnoDfFOCCwbKR@turntable.proxy.rlwy.net:21162/railway
JWT_SECRET=HML_JWT_SECRET_2025
SESSION_SECRET=HML_SESSION_SECRET_2025
NODE_ENV=development
PORT=5000
```

Rodar:
```bash
npm run dev
```

### 4. Testar em Produção HML

Acessar: `https://rota-verde-hml.up.railway.app`

---

## 🎯 VANTAGENS DESTE SETUP

1. ✅ **Produção sempre estável**
   - Branch `main` só recebe código testado
   - Usuários nunca veem bugs

2. ✅ **Testes seguros**
   - Branch `develop` para experimentar
   - BD separado, sem risco de perder dados

3. ✅ **Deploy automático**
   - Push em `develop` → HML atualiza
   - Push em `main` → PROD atualiza

4. ✅ **Rollback fácil**
   - Se HML quebrar, PROD não é afetada
   - Pode reverter `develop` sem problemas

5. ✅ **Dados de teste**
   - BD HML com dados fictícios
   - BD PROD com dados reais

---

## 📝 PRÓXIMOS PASSOS

### 1. Criar Serviço no Railway
- [ ] Criar serviço `rota-verde-hml`
- [ ] Configurar branch `develop`
- [ ] Adicionar variáveis

### 2. Criar Branch Develop
- [ ] `git checkout -b develop`
- [ ] `git push -u origin develop`

### 3. Aplicar Schema no BD HML
- [ ] Rodar script de schema
- [ ] Criar admin
- [ ] Inserir dados de teste

### 4. Testar HML
- [ ] Acessar URL HML
- [ ] Fazer login
- [ ] Testar funcionalidades

### 5. Desenvolver Menus
- [ ] Criar menus na branch `develop`
- [ ] Testar em HML
- [ ] Aprovar e fazer merge para `main`

---

## 🔐 SEGURANÇA

### Secrets Diferentes
- **PROD:** Secrets fortes e únicos
- **HML:** Secrets diferentes, podem ser mais simples

### Dados Separados
- **PROD:** Dados reais dos clientes
- **HML:** Dados fictícios para teste

### Acesso Controlado
- **PROD:** Apenas você e equipe
- **HML:** Pode compartilhar para testes

---

## 📚 DOCUMENTAÇÃO

- **AMBIENTE_HOMOLOGACAO.md** - Este arquivo
- **README.md** - Guia geral
- **DEPLOY_RAILWAY_SUCESSO.md** - Deploy PROD
- **RESUMO_EXECUTIVO.md** - Status geral

---

**Última atualização:** 07/12/2025 08:08  
**Status:** 🔧 Em configuração
