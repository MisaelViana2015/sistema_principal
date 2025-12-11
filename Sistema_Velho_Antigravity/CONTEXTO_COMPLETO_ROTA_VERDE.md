# 🚗 CONTEXTO COMPLETO - ROTA VERDE
**Sistema de Gestão de Frota de Veículos Elétricos**

> 📅 **Última Atualização**: 08 de Janeiro de 2025  
> 🎯 **Status**: Sistema 100% operacional com backup automático configurado

---

## 📋 ÍNDICE
1. [Resumo do Projeto](#resumo-do-projeto)
2. [Informações Técnicas](#informações-técnicas)
3. [Credenciais e Conexões](#credenciais-e-conexões)
4. [Decisões Arquiteturais Críticas](#decisões-arquiteturais-críticas)
5. [Problemas Conhecidos e Soluções](#problemas-conhecidos-e-soluções)
6. [Sistema de Backup](#sistema-de-backup)
7. [Comandos Úteis](#comandos-úteis)
8. [Arquivos Importantes](#arquivos-importantes)

---

## 🎯 RESUMO DO PROJETO

**Nome**: Rota Verde  
**Objetivo**: Sistema de gestão para frotas de veículos elétricos com foco em motoristas e administradores

### Funcionalidades Principais
- ✅ Gestão de turnos (shift management)
- ✅ Rastreamento de corridas em tempo real
- ✅ Registro de custos
- ✅ Divisão automática de receita (60/40)
- ✅ Interface mobile-first em português brasileiro
- ✅ Painel administrativo completo
- ✅ Sistema CX (visualização de fechamento de turnos)
- ✅ KPIs em tempo real
- ✅ Dashboard com exportação CSV
- ✅ Gestão de veículos com manutenção e custos fixos
- ✅ Análise financeira mensal
- ✅ Sistema de auditoria (audit log)
- ✅ Autenticação com roles (admin/driver)
- ✅ Dark mode com acessibilidade WCAG
- ✅ Sistema de backup automático diário

### Tecnologias
- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Autenticação**: Express Session (session-based)
- **Deploy**: Replit com Autoscale
- **Backup**: GitHub Actions (automático e gratuito)

---

## 💻 INFORMAÇÕES TÉCNICAS

### Stack Completo
```
Frontend:
- React 18
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui (componentes)
- Wouter (routing)
- TanStack Query v5 (data fetching)
- Recharts (gráficos)
- Lucide React (ícones)

Backend:
- Node.js
- Express
- TypeScript
- Drizzle ORM
- connect-pg-simple (session store)
- bcryptjs (passwords)
- cors
- express-session

Database:
- PostgreSQL 15+ (Neon serverless)
- Drizzle ORM para migrations
- Session store em PostgreSQL

Ferramentas:
- jsPDF + jspdf-autotable (geração de PDFs)
- csv-parse (parsing CSV)
- date-fns (manipulação de datas)
- Zod (validação)
```

### Estrutura de Pastas
```
rota-verde/
├── client/               # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── lib/         # Utilitários
│   │   └── hooks/       # React hooks
│   └── index.html
├── server/              # Backend Express
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Interface de storage
│   └── index.ts         # Entry point
├── shared/              # Código compartilhado
│   └── schema.ts        # Schemas Drizzle + Zod
├── db/                  # Migrations (geradas automaticamente)
├── .github/
│   └── workflows/
│       └── backup-database.yml  # Backup automático
└── [arquivos de documentação]
```

### Porta e URLs
- **Porta**: 5000 (frontend bind obrigatório: 0.0.0.0:5000)
- **Workflow**: `npm run dev` (já configurado em "Start application")
- **URL Replit**: https://[seu-repl].replit.dev

---

## 🔑 CREDENCIAIS E CONEXÕES

### Banco de Dados (PostgreSQL/Neon)
```
Host: ep-lingering-bonus-af5zgpu0.c-2.us-west-2.aws.neon.tech
Database: neondb
User: neondb_owner
Password: npg_yiQxuMjaS9H3
Port: 5432
SSL Mode: require

DATABASE_URL (completa):
postgresql://neondb_owner:npg_yiQxuMjaS9H3@ep-lingering-bonus-af5zgpu0.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require
```

### Secrets do Replit (configurados)
- `DATABASE_URL` - URL completa do PostgreSQL
- `SESSION_SECRET` - Secret para express-session
- `PGDATABASE` - neondb
- `PGHOST` - ep-lingering-bonus-af5zgpu0.c-2.us-west-2.aws.neon.tech
- `PGPASSWORD` - npg_yiQxuMjaS9H3
- `PGPORT` - 5432
- `PGUSER` - neondb_owner

### GitHub
- **Repositório**: https://github.com/MisaelViana2015/rota-verde-backup
- **Branch principal**: main
- **Conexão Replit**: Configurada via OAuth (leitura/escrita)
- **Workflow**: `.github/workflows/backup-database.yml`
- **Secret configurado**: `DATABASE_URL` (nas Actions Secrets)

---

## 🏗️ DECISÕES ARQUITETURAIS CRÍTICAS

### 1. ⚠️ PROBLEMA: Validação de Schemas Zod com Drizzle

**Contexto**: No Zod v4, usar `.omit().extend()` com schemas gerados por `createInsertSchema` do Drizzle causa erros de validação em campos opcionais.

**Solução Implementada**: Usar schemas Zod **manuais** com `z.preprocess` para campos opcionais.

**Exemplo Crítico** (`shared/schema.ts`):
```typescript
// ❌ NÃO FUNCIONA (Zod v4 + Drizzle):
export const insertVehicleCostSchema = createInsertSchema(vehicleCosts)
  .omit({ id: true })
  .extend({ /* ... */ });

// ✅ FUNCIONA (manual com z.preprocess):
export const insertVehicleCostSchema = z.object({
  vehicleId: z.string().min(1),
  tipoRegistro: z.enum(["custo_fixo", "combustivel", "manutencao", "seguro", "outros"]),
  descricao: z.string().min(1),
  valor: z.number().positive(),
  dataVencimento: z.preprocess(
    (val) => (val === null || val === "" ? undefined : val),
    z.date().optional()
  ),
  // ... outros campos com z.preprocess para opcionais
});
```

**Regra de Ouro**: Para formulários com campos opcionais (números, datas), sempre usar schemas manuais com `z.preprocess`.

---

### 2. 🚫 PROBLEMA: GitHub Actions Workflow via Replit

**Contexto**: O OAuth do Replit não tem permissão `workflow`, impedindo push de arquivos `.github/workflows/*.yml`.

**Solução Implementada**: Criar workflow files **diretamente no GitHub** via interface web.

**Processo**:
1. Código do app é feito no Replit normalmente
2. Push via Replit funciona para tudo, EXCETO `.github/workflows/`
3. Para workflows: criar manualmente no GitHub web interface
4. Commit direto no GitHub (não via Replit)

**Arquivo**: `.github/workflows/backup-database.yml` (criado no GitHub web)

---

### 3. 💾 ESTRATÉGIA DE BACKUP

**Opção Escolhida**: GitHub Actions + Artifacts (gratuito)

**Motivo**: Evitar custos de Replit Deployment, manter independência do Replit estar rodando.

**Características**:
- ✅ **Custo**: R$ 0,00 (GitHub Actions gratuito)
- ✅ **Frequência**: Diária (3h da manhã, horário Brasília)
- ✅ **Retenção**: 30 dias
- ✅ **Manual**: Pode executar manualmente quando quiser
- ✅ **Independente**: Funciona sem Replit estar online
- ✅ **Storage**: GitHub Artifacts (não polui repositório)

**Dual Strategy**:
1. **Neon PITR** (Point-in-Time Recovery): 7-30 dias (nativo Neon)
2. **GitHub Artifacts**: 30 dias (nosso backup)

---

### 4. 🎨 Design System

**Cores e Tema**:
- Mobile-first design
- Dark mode + Light mode
- Gradientes vibrantes em KPI cards
- IconBadge system para hierarquia visual
- Lucide React icons (não emojis)
- Tipografia: Inter (texto) + JetBrains Mono (dados)

**Navegação**:
- Bottom navigation bar (mobile)
- Ordem: Turno → Corridas → Caixa → Desempenho → Veículos

**Acessibilidade**:
- WCAG compliance
- Botões outline usam `text-foreground`
- HSL tokens com função `hsl()` em propriedades CSS arbitrárias

---

### 5. 🔐 Autenticação e Segurança

**Sistema**: Express Session (session-based)
- Sessions armazenadas em PostgreSQL (connect-pg-simple)
- Bcrypt para passwords
- Role-based access (admin/driver)
- Ownership verification robusta
- Password confirmation para fechar turnos

**Roles**:
- **Admin**: Acesso total, CRUD de tudo, analytics, audit log
- **Driver**: Gerencia próprios turnos, corridas, custos

---

### 6. 📊 Features Específicas

**Auto-update System**:
- Polling de endpoint `/api/version`
- Força reload quando nova versão detectada
- Garante todos dispositivos com código atualizado

**Version Display**:
- Formato: DD/MM/YYYY HH:mm (pt-BR)
- Helper: `formatVersion()` em `lib/format.ts`

**DebugButton**:
- Componente global para suporte
- Copia informações para clipboard

**Análise Financeira**:
- Split 60/40 automático
- Análise mensal com margem de lucro
- Filtros por semana/mês
- Export CSV

**CX (Caixa)**:
- Visualização de fechamentos de turno
- Geração de PDF com jsPDF
- Acessível a todos usuários

---

## ⚠️ PROBLEMAS CONHECIDOS E SOLUÇÕES

### 1. Formulários não submitam / campos opcionais dão erro
**Causa**: Schema Zod usando `.omit().extend()` com Drizzle  
**Solução**: Reescrever schema manualmente com `z.preprocess` (ver seção Decisões Arquiteturais)

### 2. Não consigo fazer push do workflow para GitHub
**Causa**: OAuth do Replit sem permissão `workflow`  
**Solução**: Criar arquivo `.github/workflows/backup-database.yml` diretamente no GitHub

### 3. Migrations dão erro de data loss
**Comando**: `npm run db:push --force`  
**Info**: Force push é seguro para desenvolvimento. Nunca escrever SQL migrations manualmente.

### 4. Dark mode com texto invisível
**Causa**: Falta de classes dark: em variantes  
**Solução**: Sempre usar `text-foreground` ou classes com dark: explícitas

### 5. IDs mudando de tipo (serial ↔ varchar)
**NUNCA FAÇA ISSO**: Não altere tipo de coluna ID existente  
**Regra**: Checar schema atual antes de qualquer mudança

---

## 💾 SISTEMA DE BACKUP

### Status Atual
✅ **100% Operacional** (testado em 08/01/2025, 13 segundos)

### Como Funciona
1. **Automático**: Executa todo dia às 3h da manhã (horário Brasília)
2. **Processo**:
   - GitHub Actions instala PostgreSQL client
   - Conecta no Neon via `DATABASE_URL`
   - Executa `pg_dump` completo
   - Comprime em `.sql.gz`
   - Faz upload como Artifact
3. **Retenção**: 30 dias automáticos
4. **Manual**: Pode executar quando quiser via GitHub Actions UI

### Arquivos de Documentação
- `GUIA_CONFIGURACAO_BACKUP_GITHUB.md` - Setup completo
- `GUIA_RECUPERACAO_BACKUP.md` - Como restaurar backup
- `GUIA_RECUPERACAO_BACKUP.html` - Versão visual do guia
- `README_BACKUP_SYSTEM.md` - Visão geral do sistema
- `INSTRUCOES_EMAIL_BACKUP.md` - Configurar notificações (opcional)

### Como Restaurar um Backup

#### 1. Baixar o backup
```bash
# Via GitHub Actions UI:
# Actions → Backup Diário PostgreSQL → Escolher execução → Download artifact
```

#### 2. Descompactar
```bash
gunzip backup-rota-verde-XXXXXX.sql.gz
```

#### 3. Restaurar no Neon
```bash
# Opção A: Via psql local
export DATABASE_URL="postgresql://neondb_owner:npg_yiQxuMjaS9H3@ep-lingering-bonus-af5zgpu0.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require"

psql $DATABASE_URL < backup-rota-verde-XXXXXX.sql

# Opção B: Via Neon Console
# 1. Acessar https://console.neon.tech
# 2. Selecionar projeto
# 3. SQL Editor → Colar conteúdo do backup → Run
```

### Executar Backup Manual
1. Acessar: https://github.com/MisaelViana2015/rota-verde-backup
2. Clicar em **Actions**
3. **Backup Diário PostgreSQL** (lateral esquerda)
4. Botão **Run workflow** (direita)
5. Clicar novamente em **Run workflow**
6. Aguardar ~30 segundos
7. Download do artifact gerado

---

## 🛠️ COMANDOS ÚTEIS

### Desenvolvimento
```bash
# Iniciar aplicação (já configurado no workflow)
npm run dev

# Instalar dependências
npm install

# Build do frontend
npm run build
```

### Database
```bash
# Push schema para database (desenvolvimento)
npm run db:push

# Force push (quando há warning de data loss)
npm run db:push --force

# Abrir Drizzle Studio (interface visual do DB)
npm run db:studio
```

### Git/GitHub
```bash
# Ver status
git status

# Add todos arquivos (EXCETO workflows)
git add .

# Commit
git commit -m "sua mensagem"

# Push para GitHub
git push origin main

# Pull do GitHub
git pull origin main
```

### Backup Manual (via terminal)
```bash
# Fazer backup local do database
pg_dump $DATABASE_URL > backup-local-$(date +%Y%m%d-%H%M%S).sql

# Comprimir
gzip backup-local-*.sql
```

---

## 📁 ARQUIVOS IMPORTANTES

### Schema e Tipos
- `shared/schema.ts` - **CRÍTICO** - Schemas Drizzle + Zod, tipos TypeScript

### Backend
- `server/routes.ts` - Todas as rotas da API
- `server/storage.ts` - Interface de storage e implementação
- `server/index.ts` - Entry point, configuração Express

### Frontend
- `client/src/App.tsx` - Router e provider setup
- `client/src/pages/` - Todas as páginas da aplicação
- `client/src/components/ui/` - Componentes shadcn/ui
- `client/src/lib/queryClient.ts` - Setup TanStack Query
- `client/src/lib/format.ts` - Helpers de formatação

### Config
- `vite.config.ts` - **NÃO MODIFICAR**
- `tailwind.config.ts` - Configuração Tailwind
- `drizzle.config.ts` - **NÃO MODIFICAR**
- `package.json` - **NÃO MODIFICAR** (usar packager tool)

### Database
- `db/` - Migrations geradas automaticamente (não editar)

### Backup
- `.github/workflows/backup-database.yml` - Workflow de backup automático
- `GUIA_CONFIGURACAO_BACKUP_GITHUB.md` - Guia de setup
- `GUIA_RECUPERACAO_BACKUP.md` - Guia de restauração
- `GUIA_RECUPERACAO_BACKUP.html` - Versão HTML do guia
- `README_BACKUP_SYSTEM.md` - Overview do sistema
- `INSTRUCOES_EMAIL_BACKUP.md` - Notificações email

### Documentação
- `replit.md` - **CRÍTICO** - Contexto do projeto, preferências, arquitetura
- `design_guidelines.md` - Guidelines de design (se existir)

---

## 🚨 CHECKLIST PARA NOVO CHAT

Quando criar um novo chat e der problema, forneça estas informações:

### 1. Contexto do Problema
```
"Estou com problema em [descrever]. Aqui está o contexto completo do projeto:"
```

### 2. Informações Técnicas
- Stack: React + Vite + Express + PostgreSQL (Neon) + Drizzle ORM
- Database URL: [fornecer DATABASE_URL completa se necessário]
- Repositório GitHub: https://github.com/MisaelViana2015/rota-verde-backup
- Sistema de backup: GitHub Actions (operacional)

### 3. Problema Específico
Descreva:
- O que estava tentando fazer
- O que deu errado
- Mensagem de erro (se houver)
- Arquivos afetados

### 4. Decisões Importantes
Mencionar:
- "Usamos schemas Zod MANUAIS com z.preprocess, NÃO usar .omit().extend()"
- "Workflows do GitHub devem ser criados na web interface, NÃO via Replit push"
- "Nunca alterar tipo de coluna ID no schema"
- "Sempre usar npm run db:push --force se der warning de data loss"

### 5. Arquivos para Ler
Pedir para o agente ler:
- `replit.md` - Contexto completo do projeto
- `shared/schema.ts` - Se for problema de validação/database
- `server/routes.ts` - Se for problema de API
- Arquivo específico do problema

---

## 📞 INFORMAÇÕES DE CONTATO E LINKS

### Projeto
- **Nome**: Rota Verde
- **Replit**: https://replit.com/@MisaelViana2015/rota-verde
- **GitHub**: https://github.com/MisaelViana2015/rota-verde-backup

### Neon Database
- **Console**: https://console.neon.tech
- **Projeto**: ep-lingering-bonus-af5zgpu0
- **PITR**: 7-30 dias disponível

### GitHub Actions
- **Workflows**: https://github.com/MisaelViana2015/rota-verde-backup/actions
- **Artifacts**: Retenção de 30 dias

---

## 📝 NOTAS FINAIS

### Preferências do Usuário (de replit.md)
- Prefere explicações detalhadas
- Quer desenvolvimento iterativo
- Pedir antes de fazer mudanças grandes
- NÃO modificar pasta `Z` (se existir)
- NÃO modificar arquivo `Y` (se existir)

### Boas Práticas
1. Sempre ler `replit.md` antes de fazer alterações
2. Usar schemas manuais para formulários com opcionais
3. Testar localmente antes de push
4. Nunca commitar secrets/credentials
5. Documentar decisões importantes
6. Fazer backups antes de mudanças grandes

### Próximos Passos Possíveis
- [ ] Implementar notificações email para backups (via INSTRUCOES_EMAIL_BACKUP.md)
- [ ] Adicionar mais relatórios e analytics
- [ ] Melhorar sistema de manutenção de veículos
- [ ] Adicionar gráficos mais avançados
- [ ] Implementar push notifications
- [ ] Adicionar mais filtros e buscas

---

## ✅ STATUS ATUAL DO PROJETO

### Última Verificação: 08/01/2025

- ✅ Aplicação rodando sem erros
- ✅ Database conectado e funcional
- ✅ Autenticação funcionando
- ✅ Todas features principais implementadas
- ✅ Sistema de backup 100% operacional
- ✅ Workflows configurados
- ✅ GitHub conectado
- ✅ Documentação completa
- ✅ Dark mode funcional
- ✅ Mobile-first responsivo

---

**📌 IMPORTANTE**: Salve este arquivo no seu PC e forneça-o completo em um novo chat caso precise de ajuda. Ele contém todas as informações críticas do projeto.

**🎯 Versão do Documento**: 1.0  
**📅 Data**: 08 de Janeiro de 2025  
**👤 Autor**: Sistema Rota Verde
