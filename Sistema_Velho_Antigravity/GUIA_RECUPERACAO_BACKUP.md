# 🔄 Guia de Recuperação de Backup - Rota Verde

## 📋 Informações do Sistema

**Sistema:** Rota Verde - Electric Fleet Management  
**Banco de Dados:** PostgreSQL (Neon)  
**Backup:** Automático diário via GitHub Actions  
**Retenção:** 30 dias  
**Horário:** 3h da manhã (Brasília)

---

## ⚠️ IMPORTANTE: Quando Usar Este Guia

Use este guia para recuperar o banco de dados em casos de:
- ✅ Dados deletados acidentalmente
- ✅ Erro em atualização do sistema
- ✅ Corrupção de dados
- ✅ Necessidade de voltar para data específica
- ✅ Migração para novo servidor

**⚠️ ATENÇÃO:** A recuperação substitui TODOS os dados atuais pelos dados do backup escolhido!

---

## 🎯 Opções de Recuperação

### Opção 1: Point-in-Time Restore (Neon Nativo) - MAIS RÁPIDO ⚡

**Vantagens:**
- ⚡ Restauração em segundos
- 📅 Escolhe qualquer momento dos últimos 7-30 dias
- 🔒 Não precisa de arquivos externos
- ✅ Zero risco de erro

**Quando usar:**
- Dados perdidos há menos de 7-30 dias
- Precisa de restauração rápida
- Sabe o horário exato do problema

**Como fazer:**
1. Acesse: https://console.neon.tech
2. Faça login na sua conta
3. Selecione o projeto **Rota Verde**
4. Vá em **Branches** (menu lateral)
5. Clique em **Restore** (botão azul)
6. Escolha a data/hora desejada
7. Clique em **Restore**
8. ✅ Pronto! Dados restaurados em segundos

---

### Opção 2: Backup GitHub Actions - HISTÓRICO LONGO 📦

**Vantagens:**
- 📅 Acesso a backups de até 30+ dias atrás
- 💾 Arquivos .sql.gz para guardar localmente
- 🔄 Controle total do processo
- 📁 Pode baixar e arquivar backups importantes

**Quando usar:**
- Dados perdidos há mais de 7-30 dias
- Precisa de backup muito antigo
- Quer ter cópia local do backup

---

## 📖 PASSO A PASSO: Recuperação via GitHub Actions

### 🔍 Passo 1: Identificar o Backup Correto

#### 1.1 Acessar Repositório de Backups
1. Abra: https://github.com/SEU_USUARIO/rota-verde-backup
2. Faça login no GitHub
3. Clique na aba **"Actions"** (topo da página)
4. Clique em **"Backup Diário PostgreSQL"** (menu lateral esquerdo)
5. Verá lista de execuções com data/hora de cada backup

#### 1.2 Escolher o Backup
Os backups têm formato: `backup-rota-verde-2024-11-08-06-00-00`

**Decodificando o nome:**
- `2024-11-08` = Data (08/11/2024)
- `06-00-00` = Horário UTC (03:00 Brasília)

**Exemplo:**
- Perdeu dados no dia 15/11/2024 às 14h?
- Use o backup: `backup-2024-11-15-06-00-00.sql.gz`
- (Feito às 3h da manhã do dia 15, antes do problema)

#### 1.3 Baixar o Backup
1. Clique na execução do backup escolhido (da data desejada)
2. Role para baixo até a seção **"Artifacts"**
3. Clique no nome do artifact para baixar o arquivo .zip
4. Extraia o .zip para obter o arquivo .sql.gz
5. Salve em local seguro no seu computador

**Nota:** Backups ficam disponíveis por 30 dias como GitHub Artifacts, depois são automaticamente deletados.

---

### 💻 Passo 2: Preparar o Ambiente

#### 2.1 Instalar PostgreSQL Client

**Windows:**
1. Baixe: https://www.postgresql.org/download/windows/
2. Execute o instalador
3. Marque apenas: **"Command Line Tools"**
4. Instale

**macOS:**
```bash
brew install postgresql
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install postgresql-client
```

#### 2.2 Verificar Instalação
Abra terminal/cmd e digite:
```bash
pg_restore --version
```

Se aparecer a versão (ex: `pg_restore 16.0`), está OK! ✅

---

### 🗄️ Passo 3: Obter Dados de Conexão do Neon

#### 3.1 Acessar Console Neon
1. Vá para: https://console.neon.tech
2. Faça login
3. Selecione projeto **Rota Verde**

#### 3.2 Copiar String de Conexão
1. Clique em **Connection Details** (menu lateral)
2. **IMPORTANTE:** Desmarque "Pooled connection"
3. Copie a string completa, exemplo:
   ```
   postgresql://usuario:senha@ep-xyz123.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

---

### 🔄 Passo 4: Executar a Restauração

#### 4.1 Descompactar o Backup
No terminal, vá até a pasta onde baixou o backup:

**Windows:**
```cmd
cd C:\Users\SeuNome\Downloads
```

**macOS/Linux:**
```bash
cd ~/Downloads
```

Descompacte:
```bash
gunzip backup-2024-11-08-06-00-00.sql.gz
```

Agora você tem: `backup-2024-11-08-06-00-00.sql`

#### 4.2 Restaurar no Banco de Dados

**⚠️ ATENÇÃO:** Este comando SUBSTITUI todos os dados atuais!

```bash
psql "postgresql://usuario:senha@host.neon.tech/neondb?sslmode=require" < backup-2024-11-08-06-00-00.sql
```

**Substitua:**
- A string de conexão pela que você copiou do Neon
- O nome do arquivo pelo seu backup

#### 4.3 Aguardar Conclusão
O processo pode levar de 1 a 10 minutos dependendo do tamanho do banco.

**Mensagens normais:**
- `SET`
- `CREATE TABLE`
- `INSERT 0 1`
- `ALTER TABLE`

**Se aparecer "ERROR":**
- Copie o erro completo
- Entre em contato para suporte

#### 4.4 Verificar Restauração
Ao final, se não houver erros, você verá:
```
COMMIT
```

✅ **Restauração concluída com sucesso!**

---

### 🔍 Passo 5: Validar os Dados

#### 5.1 Acessar Sistema
1. Abra o Rota Verde: https://seu-projeto.replit.app
2. Faça login como Admin
3. Vá em **Admin → Turnos**

#### 5.2 Verificar Dados
- ✅ Turnos aparecem corretamente?
- ✅ Motoristas estão listados?
- ✅ Veículos estão presentes?
- ✅ Corridas aparecem?

Se tudo estiver OK, **dados restaurados com sucesso!** 🎉

---

## 🚨 Solução de Problemas

### Erro: "pg_restore: command not found"
**Solução:** PostgreSQL Client não está instalado. Volte ao Passo 2.1

### Erro: "FATAL: password authentication failed"
**Solução:** String de conexão incorreta. Verifique:
1. Copiou a string completa do Neon?
2. Removeu o checkbox "Pooled connection"?

### Erro: "ERROR: relation already exists"
**Solução:** Banco não está vazio. Opções:
1. Criar novo banco vazio no Neon
2. Limpar banco atual (CUIDADO: perde dados)

### Backup muito antigo não aparece
**Solução:** Backups são mantidos por 30 dias. Se precisar de backup mais antigo:
1. Verifique histórico de commits no GitHub
2. Use Point-in-Time Restore do Neon (se disponível)

### Restauração trava/demora muito
**Solução:**
1. Verifique conexão de internet
2. Tente em horário de menor tráfego
3. Se > 1 hora, cancele (Ctrl+C) e reporte erro

---

## 📞 Suporte

### Em caso de dúvidas ou problemas:

**📧 Email de Suporte:** [SEU_EMAIL_AQUI]

**📱 WhatsApp:** [SEU_WHATSAPP_AQUI]

**💬 O que enviar:**
1. Print da tela mostrando o erro
2. Cópia completa da mensagem de erro
3. Nome do arquivo de backup que tentou restaurar
4. Horário em que tentou fazer a restauração

**Tempo de resposta:** Até 24h úteis

---

## ✅ Checklist de Recuperação

Use esta lista para não esquecer nenhum passo:

- [ ] Identifiquei a data/hora correta do backup
- [ ] Baixei o arquivo .sql.gz do GitHub
- [ ] Instalei PostgreSQL Client
- [ ] Obtive a string de conexão do Neon
- [ ] Descompactei o arquivo de backup
- [ ] Executei o comando de restauração
- [ ] Aguardei até aparecer "COMMIT"
- [ ] Validei os dados no sistema
- [ ] Testei login e funcionalidades básicas

---

## 📚 Informações Técnicas

### Formato dos Backups
- **Extensão:** `.sql.gz` (SQL comprimido com gzip)
- **Conteúdo:** Schema completo + dados
- **Tamanho médio:** 5-50 MB (comprimido)
- **Descomprimido:** 20-200 MB

### Comandos Úteis

**Ver tamanho do backup:**
```bash
du -h backup-*.sql.gz
```

**Verificar conteúdo sem restaurar:**
```bash
zcat backup-2024-11-08-06-00-00.sql.gz | head -n 100
```

**Restaurar apenas uma tabela:**
```bash
pg_restore -t nome_da_tabela -d "connection_string" backup.sql
```

---

## 🔐 Segurança

### Boas Práticas:
- 🔒 Nunca compartilhe strings de conexão
- 🔒 Não publique backups em repositórios públicos
- 🔒 Mantenha backups locais em HD externo criptografado
- 🔒 Teste restaurações mensalmente
- 🔒 Documente todas as restaurações realizadas

---

## 📝 Histórico de Restaurações

Use esta tabela para documentar recuperações:

| Data | Backup Usado | Motivo | Executado Por | Status |
|------|--------------|--------|---------------|---------|
| DD/MM/AAAA | backup-AAAA-MM-DD-HH-MM-SS.sql.gz | Descrição | Nome | ✅/❌ |
| | | | | |
| | | | | |

---

**Versão do Documento:** 1.0  
**Última Atualização:** 08/11/2024  
**Próxima Revisão:** 08/02/2025

---

## 🎓 Treinamento Recomendado

Para dominar o processo de backup e recuperação:

1. **Teste de Restauração Mensal**
   - Todo dia 1º de cada mês
   - Restaure um backup de teste
   - Valide os dados
   - Documente o processo

2. **Simulação de Desastre Semestral**
   - A cada 6 meses
   - Simule perda total de dados
   - Pratique recuperação completa
   - Cronometre o tempo

3. **Auditoria Anual**
   - Verifique todos os backups
   - Teste backups antigos
   - Atualize este guia se necessário

---

**🚀 Mantenha este documento sempre atualizado e acessível!**

Em caso de emergência, este guia pode salvar meses de trabalho! 💪
