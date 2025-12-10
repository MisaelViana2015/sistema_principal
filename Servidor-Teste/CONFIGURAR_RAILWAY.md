# 🚀 CONFIGURAR SERVIDOR DE TESTE NO RAILWAY

**Data:** 07/12/2025  
**Projeto:** Servidor-Teste (HML)

---

## ✅ O QUE JÁ TEMOS

- [x] Banco de Dados HML criado
- [x] Token do projeto: `eb55cbe4-3267-45a0-b7fb-96a5786b86ac`
- [x] Repositório GitHub: `Servidor-Teste`
- [x] Código enviado para o GitHub

---

## 🎯 PRÓXIMO PASSO: CRIAR SERVIÇO

### 1. Acessar Railway
```
https://railway.app
```

### 2. Selecionar Projeto
- Clique no projeto **"Servidor-Teste"** (ou crie um novo)

### 3. Criar Novo Serviço
1. Clique em **"+ New"**
2. Selecione **"GitHub Repo"**
3. Escolha: **`MisaelViana2015/Servidor-Teste`**
4. Clique em **"Deploy"**

### 4. Configurar Nome do Serviço
1. Clique no serviço criado
2. Vá em **Settings**
3. Em **Service Name**, mude para: **`servidor-teste-hml`**
4. Salvar

---

## 🔧 CONFIGURAR VARIÁVEIS DE AMBIENTE

### Ir para Variables

1. No serviço, clique em **"Variables"**
2. Clique em **"+ New Variable"**

### Adicionar Variáveis Manualmente

```env
DATABASE_URL=postgresql://postgres:BDnSvDzpOoQcJsRPSvkZnoDfFOCCwbKR@postgres.railway.internal:5432/railway

JWT_SECRET=HML_JWT_SECRET_2025_HOMOLOGACAO_ROTA_VERDE_TESTE

SESSION_SECRET=HML_SESSION_SECRET_2025_HOMOLOGACAO_ROTA_VERDE_TESTE

NODE_ENV=production

PORT=10000
```

### Adicionar FRONTEND_URL (Automático)

1. Clique em **"+ New Variable"**
2. Nome: `FRONTEND_URL`
3. Valor: `${{RAILWAY_PUBLIC_DOMAIN}}`
4. Isso pega automaticamente a URL do Railway

---

## 🔗 CONECTAR AO BANCO DE DADOS HML

### Opção 1: Via Interface (Recomendado)

1. No serviço, vá em **"Variables"**
2. Clique em **"+ Variable Reference"**
3. Selecione o banco **"Postgres"** (HML)
4. Marque todas as variáveis:
   - `DATABASE_URL`
   - `DATABASE_PUBLIC_URL`
   - `PGDATABASE`
   - `PGHOST`
   - `PGPASSWORD`
   - `PGPORT`
   - `PGUSER`
5. Clique em **"Add"**

### Opção 2: Manual

Se preferir, adicione manualmente:

```env
DATABASE_URL=postgresql://postgres:BDnSvDzpOoQcJsRPSvkZnoDfFOCCwbKR@postgres.railway.internal:5432/railway
```

---

## 🎨 CONFIGURAR DOMÍNIO PÚBLICO

### 1. Gerar Domínio

1. No serviço, vá em **"Settings"**
2. Role até **"Networking"**
3. Clique em **"Generate Domain"**
4. Railway vai criar algo como: `servidor-teste-hml.up.railway.app`

### 2. Copiar URL

Copie a URL gerada, você vai precisar dela!

---

## 🚀 FAZER DEPLOY

### Deploy Automático

O Railway já deve ter iniciado o deploy automaticamente quando você conectou o repo.

### Verificar Status

1. Vá na aba **"Deployments"**
2. Veja o status do build
3. Aguarde até ficar **"Success"** ✅

### Ver Logs

1. Clique no deployment ativo
2. Veja os logs em tempo real
3. Procure por:
   ```
   ✅ Servidor rodando na porta 10000
   ✅ Banco de dados conectado
   ```

---

## 🧪 TESTAR O SERVIDOR

### 1. Acessar URL

Abra no navegador:
```
https://servidor-teste-hml.up.railway.app
```

### 2. Verificar Health Check

```
https://servidor-teste-hml.up.railway.app/api/health
```

Deve retornar:
```json
{
  "success": true,
  "message": "Sistema Rota Verde - API funcionando",
  "timestamp": "...",
  "environment": "production"
}
```

### 3. Tentar Login

```
https://servidor-teste-hml.up.railway.app
```

Credenciais:
- Email: `admin@rotaverde.com`
- Senha: `admin`

---

## ⚠️ SE DER ERRO

### Erro: "tsc: not found"

**Solução:** Já corrigimos isso! O `typescript` e `vite` estão em `dependencies`.

### Erro: "Cannot connect to database"

**Solução:**
1. Verifique se a `DATABASE_URL` está correta
2. Verifique se o banco HML está rodando
3. Tente usar `DATABASE_PUBLIC_URL` se estiver testando localmente

### Erro: "column created_at does not exist"

**Solução:** Precisa aplicar o schema no banco HML:

```bash
# Localmente, com .env apontando para HML
npx tsx server/scripts/db/apply-schema.ts
npx tsx server/scripts/db/create-admin-simple.ts
```

---

## 📋 CHECKLIST DE CONFIGURAÇÃO

### Railway
- [ ] Serviço criado
- [ ] Nome: `servidor-teste-hml`
- [ ] Conectado ao repo `Servidor-Teste`
- [ ] Variáveis de ambiente adicionadas
- [ ] Conectado ao banco HML
- [ ] Domínio público gerado
- [ ] Deploy concluído com sucesso

### Banco de Dados
- [ ] Schema aplicado
- [ ] Usuário admin criado
- [ ] Dados de teste inseridos (opcional)

### Testes
- [ ] Health check funcionando
- [ ] Login funcionando
- [ ] Dashboard carregando
- [ ] Sem erros no console

---

## 🎯 PRÓXIMOS PASSOS

Depois que o servidor HML estiver funcionando:

1. ✅ **Testar login e funcionalidades básicas**
2. ✅ **Desenvolver menus no Servidor-Teste**
3. ✅ **Testar tudo em HML**
4. ✅ **Quando estiver 100%, copiar para produção**

---

## 📝 COMANDOS ÚTEIS

### Ver Logs em Tempo Real

```bash
railway logs --service servidor-teste-hml --follow
```

### Forçar Redeploy

```bash
railway up --service servidor-teste-hml
```

### Ver Variáveis

```bash
railway variables --service servidor-teste-hml
```

---

## 🔐 INFORMAÇÕES IMPORTANTES

### URLs
- **HML:** https://servidor-teste-hml.up.railway.app
- **PROD:** https://rt-frontend.up.railway.app

### Repositórios
- **HML:** https://github.com/MisaelViana2015/Servidor-Teste
- **PROD:** https://github.com/MisaelViana2015/rota-verde-06-12-25

### Bancos de Dados
- **HML:** DB-RotaVerde-HML (26ab649b-13ee-4599-89f6-bcf3908f3318)
- **PROD:** DB-RotaVerde06-12-2025

### Tokens
- **Projeto:** eb55cbe4-3267-45a0-b7fb-96a5786b86ac

---

**Última atualização:** 07/12/2025 08:17  
**Status:** 🔧 Aguardando configuração do serviço
