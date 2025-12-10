# Rota Verde - Sistema de Gestão de Frota Elétrica

Sistema completo de gestão de frota de veículos elétricos com rastreamento em tempo real, gerenciamento de turnos, manutenção e análise de custos.

## 🚀 Deploy Rápido

### Railway
Veja instruções completas em [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)

**Configuração Mínima:**
```bash
DATABASE_URL=postgresql://...
SESSION_SECRET=...
JWT_SECRET=...
NODE_OPTIONS=--dns-result-order=ipv4first
```

## 🛠️ Desenvolvimento Local

### Pré-requisitos
- Node.js 18.20.2
- PostgreSQL (ou Supabase)

### Instalação
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# Executar migrações
npx drizzle-kit push

# Popular banco de dados (opcional)
npm run db:seed

# Iniciar servidor de desenvolvimento
npm run dev
```

## 📦 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build do frontend
- `npm run start` - Inicia servidor em produção
- `npm run db:seed` - Popula banco de dados com dados iniciais
- `npm run unlock` - Desbloqueia veículos travados

## 🔧 Tecnologias

- **Frontend:** React, Vite, TailwindCSS, Wouter
- **Backend:** Express, TypeScript
- **Database:** PostgreSQL (Drizzle ORM)
- **Auth:** Express Session + bcrypt
- **Deploy:** Railway, Render (compatível)

## 📝 Estrutura do Projeto

```
rota-verde-backup/
├── client/          # Frontend React
├── server/          # Backend Express
│   ├── modules/     # Módulos de negócio
│   ├── core/        # Autenticação e HTTP
│   └── scripts/     # Scripts de manutenção
├── shared/          # Schema compartilhado
└── migrations/      # Migrações do banco
```

## 🐛 Troubleshooting

### Erro de IPv6 (ENETUNREACH)
✅ **Resolvido:** Configure `NODE_OPTIONS=--dns-result-order=ipv4first`

### Erro de Prepared Statements
✅ **Resolvido:** Use porta 5432 (Session Mode) ao invés de 6543 (Transaction Pooler)

## 📄 Licença

Propriedade de Misael Viana - Rota Verde © 2025
