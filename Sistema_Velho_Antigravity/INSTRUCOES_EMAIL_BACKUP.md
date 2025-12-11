# 📧 Configuração de Notificações por Email - Backups

## 🎯 Objetivo

Receber email automático sempre que:
- ✅ Backup diário for executado com sucesso
- ❌ Backup falhar (para correção imediata)
- 🔔 Ações importantes no repositório

---

## 📋 Opções de Notificação

### Opção 1: GitHub Notifications (Padrão - Gratuito)

O GitHub já envia emails automaticamente quando workflows do Actions falham.

**Configuração:**

1. **Acesse suas configurações:**
   - Clique na sua foto (canto superior direito do GitHub)
   - Selecione **"Settings"**

2. **Vá para Notifications:**
   - Menu lateral → **"Notifications"**

3. **Configure Actions:**
   - Role até a seção **"GitHub Actions"**
   - Marque:
     - ✅ **"Email"** como método de notificação
     - ✅ **"Send notifications for failed workflows only"** (apenas falhas)
     - OU
     - ✅ **"Send notifications for all workflow runs"** (todos os backups)

4. **Verifique seu email:**
   - Em **"Primary email address"**
   - Deve estar o email que deseja receber notificações
   - Se não estiver verificado, clique em **"Resend verification email"**

**Você receberá emails como:**
```
Assunto: [seu-usuario/rota-verde-backup] Backup Diário PostgreSQL failed
De: notifications@github.com

The workflow "Backup Diário PostgreSQL" failed in 
rota-verde-backup on branch main.

View workflow run: [link]
```

---

### Opção 2: Email Personalizado (Avançado)

Para emails mais personalizados com resumo do backup, podemos adicionar um serviço de email.

**Serviços gratuitos disponíveis:**
- **Resend.com** - 100 emails/dia grátis
- **SendGrid** - 100 emails/dia grátis
- **SMTP Gmail** - Ilimitado (precisa senha de app)

**Vantagens:**
- 📧 Emails customizados com logo do Rota Verde
- 📊 Incluir estatísticas do backup no email
- ✅ Confirmação quando backup funcionar (não só falhas)

**Desvantagens:**
- ⚙️ Configuração adicional necessária
- 🔑 Precisa criar conta e API key

---

## 🚀 Setup Rápido (Opção 1 - Recomendado)

**Passo a passo em 2 minutos:**

1. Vá para: https://github.com/settings/notifications
2. Seção **"Actions"** → Marque **"Email"**
3. Escolha **"Send notifications for failed workflows only"**
4. Salve
5. ✅ Pronto!

**Teste:**
1. Vá no repositório
2. **Actions** → **Backup Diário PostgreSQL**
3. Simule um erro (ou espere próximo backup às 3h)
4. Receberá email se houver falha

---

## 📧 Como Ficam os Emails

### Email de Falha (GitHub padrão)
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ Backup Diário PostgreSQL - FALHOU
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Repository: seu-usuario/rota-verde-backup
Workflow: Backup Diário PostgreSQL
Status: ❌ Failed
Branch: main

🔗 Ver detalhes: [link para o workflow]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Email de Sucesso (se configurar "all runs")
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Backup Diário PostgreSQL - SUCESSO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Repository: seu-usuario/rota-verde-backup
Workflow: Backup Diário PostgreSQL
Status: ✅ Completed
Duration: 1m 34s

🔗 Ver detalhes: [link para o workflow]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔔 Frequência de Emails

Com a configuração padrão (apenas falhas):
- **0 emails** = Tudo funcionando perfeitamente ✅
- **1+ emails** = Algo precisa de atenção ⚠️

Com notificação para todos os runs:
- **1 email por dia** = Confirmação de backup realizado
- **Horário:** ~3h da manhã (após backup das 3h)

---

## 🛠️ Configuração Avançada (Opcional)

Se quiser emails personalizados, podemos adicionar ao workflow:

```yaml
- name: Enviar email de confirmação
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: "✅ Backup Rota Verde - ${{ env.TIMESTAMP_BR }}"
    body: |
      Backup realizado com sucesso!
      
      📅 Data: ${{ env.TIMESTAMP_BR }}
      📦 Tamanho: ${{ env.BACKUP_SIZE }}
      🗂️ Total de backups: ${{ env.TOTAL_BACKUPS }}
    to: seu-email@gmail.com
    from: Rota Verde Backups
```

**Quer implementar emails personalizados?**
Me avise que eu configuro! Preciso apenas:
1. Seu email Gmail (ou outro SMTP)
2. Senha de app do Gmail (te ensino a criar)

---

## ❓ Perguntas Frequentes

**P: Vou receber spam de emails?**
R: Não! Apenas 1 email por dia (ou menos, se configurar só falhas)

**P: Posso mudar o email depois?**
R: Sim! Basta alterar em: GitHub Settings → Notifications

**P: E se eu não receber nenhum email?**
R: Significa que todos os backups estão funcionando perfeitamente!

**P: Como testar se está funcionando?**
R: Execute um backup manual e veja se recebe email

**P: Posso adicionar mais emails?**
R: Sim, com configuração avançada (Opção 2)

---

## ✅ Status da Configuração

**Marque quando concluir:**

- [ ] Email verificado no GitHub
- [ ] Notificações do Actions ativadas
- [ ] Preferência de frequência escolhida (só falhas / todos)
- [ ] Teste realizado (executou backup manual)
- [ ] Email de teste recebido

---

## 📞 Precisa de Ajuda?

Se tiver dúvidas sobre configuração de email:
1. Tire print da tela de configurações
2. Me envie para eu orientar
3. Posso configurar emails personalizados se preferir

---

**Última atualização:** 08/11/2024  
**Versão:** 1.0
