# 📦 Backups e Versões - Rota Verde

## 🏷️ Versões Git (Tags)

### v1.0-stable (Commit: 7539553)
**Data:** 06/12/2024  
**Status:** ✅ Sistema Funcionando em Produção  
**Descrição:** Versão estável antes da implementação do Dark Mode

**Características:**
- ✅ Login funcionando
- ✅ Dashboard básico
- ✅ Autenticação JWT
- ✅ PostgreSQL conectado
- ✅ Deploy no Railway
- ✅ Segurança auditada
- ✅ Documentação completa

**Como voltar para esta versão:**
```bash
git checkout v1.0-stable
```

**Para criar branch a partir desta versão:**
```bash
git checkout -b feature/nova-funcionalidade v1.0-stable
```

---

### v1.1-darkmode (Commit: a57311d)
**Data:** 07/12/2024  
**Status:** ✅ Em Produção  
**Descrição:** Dark Mode implementado

**Novas Features:**
- ✨ Dark/Light Mode com toggle
- ✨ Persistência de tema (localStorage)
- ✨ Detecção de preferência do sistema
- ✨ Botão flutuante em todas as páginas

---

## 💾 Backups do Banco de Dados

### Backup 2025-12-07T03:01 (v1.0-stable)
**Arquivo:** `backups/backup_simple_2025-12-07T03-01-24-349Z.sql`  
**Tabelas:** costs, maintenances, drivers, fraud_events, logs, preventive_maintenances, rides, session, shift_cost_types, shifts, tires, vehicle_costs, vehicles  
**Versão Git:** v1.0-stable

**Como restaurar:**
```bash
psql "postgresql://postgres:..." < backups/backup_simple_2025-12-07T03-01-24-349Z.sql
```

---

## 🎨 Dark Mode - Guia de Implementação

### Como funciona:
O Dark Mode está **AUTOMATICAMENTE DISPONÍVEL** em todas as páginas porque:

1. **ThemeProvider** envolve toda a aplicação (`App.tsx`)
2. **ThemeToggle** é um botão fixo (aparece em todas as páginas)
3. **Classes Tailwind** `dark:` funcionam automaticamente

### Para novas páginas/componentes:

```typescript
// ✅ CORRETO - Use classes dark:
<div className="bg-white dark:bg-gray-800">
  <h1 className="text-gray-900 dark:text-white">Título</h1>
  <p className="text-gray-600 dark:text-gray-300">Texto</p>
</div>

// ❌ ERRADO - Sem suporte a dark mode
<div className="bg-white">
  <h1 className="text-gray-900">Título</h1>
</div>
```

### Paleta de Cores Padrão:

| Elemento | Light Mode | Dark Mode |
|----------|------------|-----------|
| Background principal | `bg-gray-50` | `dark:bg-gray-900` |
| Cards/Containers | `bg-white` | `dark:bg-gray-800` |
| Texto principal | `text-gray-900` | `dark:text-white` |
| Texto secundário | `text-gray-600` | `dark:text-gray-300` |
| Bordas | `border-gray-300` | `dark:border-gray-600` |
| Inputs | `bg-white` | `dark:bg-gray-700` |
| Botão primário | `bg-green-600` | (mantém verde) |

### Hook useTheme (se precisar programaticamente):

```typescript
import { useTheme } from "@/contexts/ThemeContext";

function MeuComponente() {
    const { theme, toggleTheme } = useTheme();
    
    // theme será "light" ou "dark"
    // toggleTheme() alterna entre os dois
}
```

---

## 📋 Checklist para Novas Features

Ao criar uma nova página/componente:

- [ ] Usar classes `dark:` em todos os elementos visuais
- [ ] Testar em ambos os modos (light e dark)
- [ ] Garantir contraste adequado em textos
- [ ] Verificar se inputs/botões ficam legíveis
- [ ] Criar backup do banco antes de deploy
- [ ] Commitar com mensagem descritiva
- [ ] Testar em produção (Railway)

---

## 🔄 Workflow de Desenvolvimento

### 1. Antes de Nova Feature
```bash
# Criar backup do banco
npm run db:backup

# Criar branch
git checkout -b feature/nome-da-feature
```

### 2. Durante Desenvolvimento
```bash
# Testar localmente
npm run dev

# Testar dark mode (alternar botão)
```

### 3. Após Feature Concluída
```bash
# Commitar
git add .
git commit -m "✨ Feature: Descrição"

# Merge para main
git checkout main
git merge feature/nome-da-feature

# Deploy
git push
```

### 4. Marco Importante
```bash
# Criar tag
git tag -a vX.X-nome-marco -m "Descrição"
git push origin vX.X-nome-marco

# Backup
npm run db:backup
```

---

## 🆘 Recuperação de Emergência

### Se algo quebrar:

**1. Voltar código para última versão estável:**
```bash
git checkout v1.0-stable
git push origin main --force  # ⚠️ CUIDADO!
```

**2. Restaurar banco:**
```bash
psql "postgresql://..." < backups/backup_simple_XXX.sql
```

**3. Verificar Railway:**
- Logs de erro: `railway logs --service rota-verde`
- Forçar redeploy: `railway up --service rota-verde`

---

## 📊 Histórico de Versões

| Versão | Data | Descrição | Commit | Backup |
|--------|------|-----------|--------|--------|
| v1.0-stable | 06/12/2024 | Sistema estável em produção | 7539553 | ✅ |
| v1.1-darkmode | 07/12/2024 | Dark Mode implementado | a57311d | ✅ |

---

**Última atualização:** 07/12/2024 00:01
