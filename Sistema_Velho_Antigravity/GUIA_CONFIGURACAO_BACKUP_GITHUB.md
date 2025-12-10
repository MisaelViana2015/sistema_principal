# 🔐 Guia Completo: Configuração de Backup Automático - Rota Verde

## 📋 Índice
1. [Criar Repositório no GitHub](#passo-1-criar-repositório-no-github)
2. [Conectar Replit ao GitHub](#passo-2-conectar-replit-ao-github)
3. [Configurar Secrets no GitHub](#passo-3-configurar-secrets-no-github)
4. [Ativar GitHub Actions](#passo-4-ativar-github-actions)
5. [Configurar Email de Notificação](#passo-5-configurar-email-de-notificação)
6. [Testar Backup Manual](#passo-6-testar-backup-manual)

---

## 📌 PASSO 1: Criar Repositório no GitHub

### 1.1 Acessar GitHub
1. Abra seu navegador
2. Vá para: **https://github.com**
3. Faça login na sua conta
   - Se não tem conta: Clique em **"Sign up"** (canto superior direito)

### 1.2 Criar Novo Repositório
1. No canto superior direito, clique no ícone **"+"**
2. Selecione **"New repository"**

### 1.3 Configurar Repositório
Preencha os campos:

**Owner:** (seu nome de usuário - já vem selecionado)

**Repository name:** `rota-verde-backup`

**Description (opcional):** `Sistema de Backup Automático - Rota Verde Fleet Management`

**Visibilidade:**
- 🔒 **Private** (RECOMENDADO - backups ficam privados)
- ⚠️ **Public** (qualquer pessoa pode ver os backups)

**Initialize repository:**
- ✅ Marque: **"Add a README file"**
- ❌ NÃO marque: ".gitignore" ou "license"

### 1.4 Criar Repositório
1. Clique no botão verde **"Create repository"**
2. ✅ **PRONTO!** Repositório criado
3. **Copie a URL** do repositório (ex: `https://github.com/seunome/rota-verde-backup`)

---

## 📌 PASSO 2: Conectar Replit ao GitHub

### 2.1 No Replit
1. Abra seu projeto **Rota Verde** no Replit
2. No painel esquerdo, clique em **"Version Control"** (ícone de 3 bolinhas conectadas)
3. Clique em **"Connect to GitHub"**

### 2.2 Autorizar Replit
1. Uma janela do GitHub vai abrir
2. Clique em **"Authorize Replit"**
3. Confirme sua senha se solicitado

### 2.3 Selecionar Repositório
1. No Replit, clique em **"Select repository"**
2. Escolha: **`rota-verde-backup`** (o repositório que você criou)
3. Clique em **"Connect"**

### 2.4 Fazer Primeiro Push
1. No Replit, no painel "Version Control"
2. Digite uma mensagem: `Configuração inicial - Rota Verde`
3. Clique em **"Commit & Push"**
4. ✅ **PRONTO!** Código enviado para o GitHub

---

## 📌 PASSO 3: Configurar Secrets no GitHub

### 3.1 Acessar Settings do Repositório
1. Vá para: **https://github.com/seunome/rota-verde-backup**
2. Clique na aba **"Settings"** (canto superior direito)

### 3.2 Acessar Secrets
1. No menu lateral esquerdo, role até encontrar **"Secrets and variables"**
2. Clique em **"Secrets and variables"**
3. Selecione **"Actions"**

### 3.3 Obter DATABASE_URL do Replit
**No Replit:**
1. Abra o **Shell** (parte inferior da tela)
2. Digite e execute:
   ```bash
   echo $DATABASE_URL
   ```
3. **COPIE** o resultado completo (exemplo):
   ```
   postgresql://usuario:senha@ep-xyz123.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### 3.4 Adicionar Secret DATABASE_URL
**No GitHub:**
1. Clique no botão verde **"New repository secret"**
2. **Name:** `DATABASE_URL`
3. **Secret:** Cole a URL que você copiou do Replit
4. Clique em **"Add secret"**
5. ✅ **Secret criado!**

---

## 📌 PASSO 4: Ativar GitHub Actions

### 4.1 Verificar Actions
1. No repositório GitHub, clique na aba **"Actions"** (topo da página)
2. Se aparecer uma mensagem "Workflows aren't being run":
   - Clique em **"I understand my workflows, go ahead and enable them"**

### 4.2 Verificar Workflow
1. Na aba "Actions", você verá o workflow: **"Backup Diário PostgreSQL"**
2. Status:
   - 🟢 **Verde** = Backup funcionou
   - 🔴 **Vermelho** = Erro no backup
   - 🟡 **Amarelo** = Aguardando execução

---

## 📌 PASSO 5: Configurar Email de Notificação

### 5.1 Ativar Notificações por Email
**No GitHub:**
1. Clique na sua foto (canto superior direito)
2. Vá em **"Settings"**
3. No menu esquerdo, clique em **"Notifications"**

### 5.2 Configurar Actions
1. Role até a seção **"Actions"**
2. Marque as opções:
   - ✅ **"Send notifications for failed workflows only"** (só falhas)
   - OU
   - ✅ **"Send notifications for all workflow runs"** (todos os backups)

### 5.3 Confirmar Email
1. Role até o topo
2. Verifique se seu email está em **"Primary email address"**
3. Se não estiver verificado:
   - Clique em **"Add email address"**
   - Adicione seu email
   - Verifique o email de confirmação

---

## 📌 PASSO 6: Testar Backup Manual

### 6.1 Executar Backup Agora
**No GitHub:**
1. Vá para: **Actions** (aba no topo)
2. No menu esquerdo, clique em **"Backup Diário PostgreSQL"**
3. À direita, clique em **"Run workflow"**
4. Confirme clicando em **"Run workflow"** (botão verde)

### 6.2 Acompanhar Execução
1. Aguarde alguns segundos
2. Um novo workflow aparecerá na lista
3. Clique nele para ver o progresso
4. Status:
   - 🟡 Amarelo rodando = Backup em andamento
   - 🟢 Verde checkmark = ✅ **SUCESSO!**
   - 🔴 Vermelho X = ❌ Erro (me avise para corrigir)

### 6.3 Verificar Backup
1. Na página da execução do workflow, role para baixo
2. Você verá uma seção **"Artifacts"**
3. Terá um arquivo: **`backup-rota-verde-2024-11-08-06-00-00`**
4. Clique para baixar o arquivo .sql.gz
5. ✅ **BACKUP CRIADO COM SUCESSO!**

**Nota:** Backups são armazenados como "Artifacts" do GitHub Actions, não como arquivos no repositório. Eles ficam disponíveis por 30 dias e depois são automaticamente deletados.

---

## 🎯 Configuração de Agendamento

O backup está configurado para rodar **automaticamente**:
- ⏰ **Horário:** Todos os dias às **3h da manhã** (horário de Brasília)
- 📦 **Retenção:** Últimos **30 dias** (backups antigos são deletados automaticamente)
- 📧 **Email:** Você receberá notificação se houver falha

---

## 🆘 Precisa de Ajuda?

Se encontrar algum erro ou dificuldade em qualquer passo:

1. **Tire um print da tela** mostrando o erro
2. **Copie a mensagem de erro completa**
3. **Me envie** para eu corrigir

---

## ✅ Checklist Final

Marque conforme concluir:

- [ ] Repositório GitHub criado
- [ ] Replit conectado ao GitHub
- [ ] SECRET `DATABASE_URL` configurado
- [ ] GitHub Actions ativado
- [ ] Email de notificação configurado
- [ ] Teste manual realizado com sucesso
- [ ] Backup aparece na seção "Artifacts" da execução do workflow

**Quando todos estiverem marcados, seu sistema de backup está 100% funcional!** 🎉

---

## 📅 Próximos Passos

Após configuração completa, eu vou:
1. ✅ Criar PDF com guia de recuperação de backup
2. ✅ Testar processo de restauração
3. ✅ Documentar todo o sistema

**Data de configuração:** _________  
**Configurado por:** ____________
