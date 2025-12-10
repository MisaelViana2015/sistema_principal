# 📚 DOCUMENTAÇÃO COMPLETA - Sistema de Gestão de Frota Elétrica

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Banco de Dados](#banco-de-dados)
4. [Backend - API Routes](#backend---api-routes)
5. [Frontend - Páginas](#frontend---páginas)
6. [Lógica de Negócio](#lógica-de-negócio)
7. [Autenticação](#autenticação)
8. [Deployment](#deployment)

---

## 🎯 Visão Geral

Sistema completo de gestão de frota elétrica para motoristas de aplicativo, com controle de turnos, corridas, custos e cálculos automáticos de repasse (60% empresa / 40% motorista).

### Tecnologias
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + TypeScript
- **Banco de Dados**: PostgreSQL (Neon) com Drizzle ORM
- **Autenticação**: Express Session com bcrypt
- **Deployment**: Replit

### Características Principais
- ✅ Interface mobile-first em português brasileiro
- ✅ Gestão de turnos com KM inicial/final
- ✅ Registro de corridas (App e Particular)
- ✅ Controle de custos (Recarga APP, Recarga Carro, Outros)
- ✅ Cálculos automáticos 60/40
- ✅ Dashboard com gráficos e exportação CSV
- ✅ Sistema de logs de auditoria
- ✅ Controle de veículos favoritos com indicador ⭐
- ✅ Validação de uso de veículos (um veículo por turno)

---

## 🏗️ Arquitetura

```
frota-eletrica/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   ├── turno/       # Componentes de turno
│   │   │   └── BottomNav.tsx
│   │   ├── contexts/        # React Contexts
│   │   │   └── AuthContext.tsx
│   │   ├── lib/             # Utilitários
│   │   │   ├── calc.ts      # Cálculos financeiros
│   │   │   ├── format.ts    # Formatação de dados
│   │   │   └── queryClient.ts
│   │   ├── pages/           # Páginas da aplicação
│   │   │   ├── Login.tsx
│   │   │   ├── Turno.tsx
│   │   │   ├── AdicionarCorrida.tsx
│   │   │   ├── AdicionarCusto.tsx
│   │   │   ├── EncerrarTurno.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Veiculos.tsx
│   │   │   ├── Motoristas.tsx
│   │   │   ├── Logs.tsx
│   │   │   └── Admin.tsx
│   │   └── App.tsx
│   └── index.css            # Estilos globais + Tailwind
├── server/                   # Backend Express
│   ├── db.ts                # Configuração Drizzle
│   ├── storage.ts           # DatabaseStorage (CRUD)
│   ├── routes.ts            # API Routes
│   ├── index.ts             # Server principal
│   ├── seeds.ts             # Seeds desenvolvimento
│   └── seed-prod.ts         # Seeds produção
├── shared/                   # Código compartilhado
│   └── schema.ts            # Schemas Drizzle + Zod
└── package.json
```

---

## 💾 Banco de Dados

### Schema PostgreSQL (shared/schema.ts)

```typescript
// DRIVERS (Motoristas)
export const drivers = pgTable("drivers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  senha: text("senha").notNull(),
  telefone: text("telefone"),
  veiculoFavoritoId: varchar("veiculo_favorito_id"),
  isActive: boolean("is_active").notNull().default(true),
  role: text("role").notNull().default("driver"), // "driver" | "admin"
});

// VEHICLES (Veículos)
export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  plate: text("plate").notNull().unique(),
  modelo: text("modelo").notNull(),
  motoristaPadraoId: varchar("motorista_padrao_id"),
  isActive: boolean("is_active").notNull().default(true),
  currentShiftId: varchar("current_shift_id"), // Bloqueia veículo durante turno
});

// SHIFTS (Turnos)
export const shifts = pgTable("shifts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  driverId: varchar("driver_id").notNull(),
  vehicleId: varchar("vehicle_id").notNull(),
  inicio: timestamp("inicio").notNull(),
  fim: timestamp("fim"),
  kmInicial: real("km_inicial").notNull(),
  kmFinal: real("km_final"),
  status: text("status").notNull().default("em_andamento"), // "em_andamento" | "finalizado"
  
  // Agregados calculados no encerramento
  totalApp: real("total_app").default(0),
  totalParticular: real("total_particular").default(0),
  totalBruto: real("total_bruto").default(0),
  totalCustos: real("total_custos").default(0),
  liquido: real("liquido").default(0),
  repasseEmpresa: real("repasse_empresa").default(0),      // 60%
  repasseMotorista: real("repasse_motorista").default(0),  // 40%
  totalCorridasApp: integer("total_corridas_app").default(0),
  totalCorridasParticular: integer("total_corridas_particular").default(0),
  totalCorridas: integer("total_corridas").default(0),
  duracaoMin: integer("duracao_min").default(0),
  valorKm: real("valor_km").default(0),
});

// RIDES (Corridas)
export const rides = pgTable("rides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shiftId: varchar("shift_id").notNull(),
  tipo: text("tipo").notNull(), // "App" | "Particular"
  valor: real("valor").notNull(),
  hora: timestamp("hora").notNull(),
});

// COSTS (Custos)
export const costs = pgTable("costs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shiftId: varchar("shift_id").notNull(),
  tipo: text("tipo").notNull(), // "Recarga APP" | "Recarga Carro" | "Outros"
  valor: real("valor").notNull(),
  observacao: text("observacao"),
  hora: timestamp("hora").notNull(),
});

// LOGS (Auditoria)
export const logs = pgTable("logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  acao: text("acao").notNull(),
  entidade: text("entidade").notNull(),
  referenciaId: varchar("referencia_id").notNull(),
  payload: json("payload"),
  data: timestamp("data").notNull().default(sql`now()`),
});
```

### Relacionamentos
- `drivers.veiculoFavoritoId` → `vehicles.id` (Veículo favorito do motorista)
- `vehicles.motoristaPadraoId` → `drivers.id` (Motorista padrão do veículo)
- `vehicles.currentShiftId` → `shifts.id` (Turno ativo bloqueando o veículo)
- `shifts.driverId` → `drivers.id`
- `shifts.vehicleId` → `vehicles.id`
- `rides.shiftId` → `shifts.id`
- `costs.shiftId` → `shifts.id`
- `logs.userId` → `drivers.id`

---

## 🔌 Backend - API Routes

### Autenticação
```typescript
POST   /api/auth/login          // Login com email/senha
GET    /api/auth/me             // Usuário autenticado
POST   /api/auth/logout         // Logout
```

### Motoristas
```typescript
GET    /api/drivers             // Listar todos motoristas
POST   /api/drivers             // Criar motorista (admin only)
GET    /api/drivers/me          // Dados do motorista logado
```

### Veículos
```typescript
GET    /api/vehicles            // Listar todos veículos
POST   /api/vehicles            // Criar veículo (admin only)
```

### Turnos
```typescript
GET    /api/shifts/active       // Turno ativo do usuário
POST   /api/shifts/start        // Iniciar turno
POST   /api/shifts/end          // Encerrar turno (calcula agregados)
GET    /api/shifts              // Listar turnos (com filtros)
  Query params:
    - driverId: string
    - status: "em_andamento" | "finalizado"
    - from: Date
    - to: Date
```

### Corridas
```typescript
GET    /api/rides?shiftId=X     // Listar corridas do turno
POST   /api/rides               // Adicionar corrida
  Body: { shiftId, tipo, valor, hora }
```

### Custos
```typescript
GET    /api/costs?shiftId=X     // Listar custos do turno
POST   /api/costs               // Adicionar custo
  Body: { shiftId, tipo, valor, observacao, hora }
```

### Logs
```typescript
GET    /api/logs                // Listar logs de auditoria
  Query params:
    - userId: string
    - acao: string
    - entidade: string
    - from: Date
    - to: Date
```

---

## 🎨 Frontend - Páginas

### 1. Login (`/login`)
- Autenticação com email/senha
- Validação com Zod
- Redirect para `/` após login

### 2. Turno (`/`)
- **Turno Inativo**: Card de veículo favorito ⭐, lista de veículos, campo KM inicial
- **Turno Ativo**: KPIs em tempo real, botões para adicionar corrida/custo/encerrar

### 3. Adicionar Corrida (`/turno/adicionar-corrida`)
- Select tipo: App ou Particular
- Input valor (R$)
- Submit → volta para `/`

### 4. Adicionar Custo (`/turno/adicionar-custo`)
- Select tipo: Recarga APP, Recarga Carro, Outros
- Input valor (R$)
- Input observação (opcional)
- Submit → volta para `/`

### 5. Encerrar Turno (`/turno/encerrar`)
- Input KM final (validação: >= KM inicial)
- **Resumo financeiro completo**:
  - Total App, Total Particular, Total Bruto
  - Total Custos, Líquido
  - Repasse Empresa (60%), Repasse Motorista (40%)
  - KM Rodados, Valor/KM, Duração
  - Tickets médios (App, Particular, Geral)
- Confirmação → volta para `/`

### 6. Dashboard (`/dashboard`)
- Filtros: Motorista, Status, Período
- KPIs: Total Bruto, Total Custos, Líquido, KM Rodados
- Gráficos (Recharts):
  - Evolução temporal
  - Distribuição App vs Particular
  - Top motoristas
- Lista de turnos com detalhes
- Exportação CSV

### 7. Veículos (`/veiculos`)
- Lista de veículos com status
- Indicador de uso (currentShiftId)
- Indicador de motorista padrão

### 8. Motoristas (`/motoristas`)
- Lista de motoristas
- Indicador de veículo favorito ⭐

### 9. Logs (`/logs`)
- Histórico de auditoria
- Filtros: Usuário, Ação, Entidade, Período

### 10. Admin (`/admin`)
- **Tab Motoristas**: Criar motorista (nome, email, senha, telefone, veículo favorito, role)
- **Tab Veículos**: Criar veículo (placa, modelo, motorista padrão)

---

## ⚙️ Lógica de Negócio

### Cálculos Financeiros (lib/calc.ts)

```typescript
export function calculateShiftTotals(rides: Ride[], costs: Cost[]) {
  // Totais de corridas
  const totalApp = rides
    .filter(r => r.tipo === "App")
    .reduce((sum, r) => sum + r.valor, 0);
  
  const totalParticular = rides
    .filter(r => r.tipo === "Particular")
    .reduce((sum, r) => sum + r.valor, 0);
  
  const totalBruto = totalApp + totalParticular;
  
  // Totais de custos
  const totalCustos = costs.reduce((sum, c) => sum + c.valor, 0);
  
  // Líquido
  const liquido = totalBruto - totalCustos;
  
  // Repasses (60% empresa, 40% motorista)
  const repasseEmpresa = liquido * 0.6;
  const repasseMotorista = liquido * 0.4;
  
  // Contadores
  const totalCorridasApp = rides.filter(r => r.tipo === "App").length;
  const totalCorridasParticular = rides.filter(r => r.tipo === "Particular").length;
  const totalCorridas = rides.length;
  
  // Tickets médios
  const ticketMedioApp = totalCorridasApp > 0 ? totalApp / totalCorridasApp : 0;
  const ticketMedioParticular = totalCorridasParticular > 0 
    ? totalParticular / totalCorridasParticular 
    : 0;
  const ticketMedioGeral = totalCorridas > 0 ? totalBruto / totalCorridas : 0;
  
  return {
    totalApp,
    totalParticular,
    totalBruto,
    totalCustos,
    liquido,
    repasseEmpresa,
    repasseMotorista,
    totalCorridasApp,
    totalCorridasParticular,
    totalCorridas,
    ticketMedioApp,
    ticketMedioParticular,
    ticketMedioGeral,
  };
}

export function calculateShiftMetrics(
  shift: Shift,
  kmFinal: number
) {
  const kmRodados = kmFinal - shift.kmInicial;
  const valorKm = kmRodados > 0 ? shift.liquido / kmRodados : 0;
  
  let duracaoMin = 0;
  if (shift.fim) {
    const inicio = new Date(shift.inicio);
    const fim = new Date(shift.fim);
    duracaoMin = Math.floor((fim.getTime() - inicio.getTime()) / (1000 * 60));
  }
  
  return { kmRodados, valorKm, duracaoMin };
}
```

### Formatação (lib/format.ts)

```typescript
// Moeda BRL
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// Data/Hora pt-BR, timezone America/Sao_Paulo
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

// Placa de veículo (formato brasileiro)
export function formatPlate(plate: string): string {
  // TQQ0A07 → TQQ-0A07
  if (plate.length === 7) {
    return `${plate.slice(0, 3)}-${plate.slice(3)}`;
  }
  return plate;
}

// KM com separador de milhares
export function formatKm(km: number): string {
  return new Intl.NumberFormat("pt-BR").format(km);
}

// Duração em "Xh Ymin"
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}min`;
  }
  return `${mins}min`;
}
```

### Regras de Negócio

#### 1. Um turno ativo por motorista
```typescript
// Validação no POST /api/shifts/start
const activeShift = await storage.getActiveShiftByDriver(driverId);
if (activeShift) {
  return res.status(400).json({
    error: "Você já tem um turno ativo. Finalize-o antes de iniciar outro."
  });
}
```

#### 2. Um veículo por turno
```typescript
// Bloqueio via currentShiftId
await storage.updateVehicle(vehicleId, { currentShiftId: shiftId });

// Desbloqueio ao encerrar
await storage.updateVehicle(shift.vehicleId, { currentShiftId: null });
```

#### 3. KM final ≥ KM inicial
```typescript
// Validação no frontend e backend
if (kmFinal < shift.kmInicial) {
  return res.status(400).json({
    error: "KM final deve ser maior ou igual ao KM inicial"
  });
}
```

#### 4. Veículo favorito pré-selecionado
```typescript
// Frontend: useEffect em TurnoInativo.tsx
useEffect(() => {
  if (driver?.veiculoFavoritoId && !selectedVehicleId) {
    setSelectedVehicleId(driver.veiculoFavoritoId);
    form.setValue("vehicleId", driver.veiculoFavoritoId);
  }
}, [driver, selectedVehicleId, form]);
```

#### 5. Aviso ao usar veículo de outro motorista
```typescript
// Frontend: handleVehicleSelect
if (vehicle.motoristaPadraoId && vehicle.motoristaPadraoId !== user?.id) {
  const ownerName = vehicle.motoristaPadrao?.nome || "outro motorista";
  setWarningMessage(`⚠️ Este veículo é do ${ownerName}. Confirmar uso?`);
  setShowWarning(true);
}
```

---

## 🔐 Autenticação

### Sistema de Sessão (Express Session)

```typescript
// server/index.ts
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
    },
  })
);
```

### Middleware de Proteção

```typescript
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Não autenticado" });
  }
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Não autenticado" });
  }
  
  const user = await storage.getDriver(req.session.userId);
  if (user?.role !== "admin") {
    return res.status(403).json({ error: "Acesso negado" });
  }
  
  next();
}
```

### Hash de Senhas (bcryptjs)

```typescript
// Criar senha
const hashedPassword = await bcrypt.hash(plainPassword, 10);

// Verificar senha
const valid = await bcrypt.compare(plainPassword, hashedPassword);
```

---

## 🚀 Deployment

### Ambiente de Desenvolvimento
```bash
npm run dev  # Inicia servidor Express + Vite
```

### Banco de Dados

**Push de Schema:**
```bash
npm run db:push        # Aplica schema ao banco
npm run db:push --force # Força aplicação (perda de dados)
```

**Seeds:**
```bash
# Desenvolvimento (automático no start)
npx tsx server/seeds.ts

# Produção (manual)
npx tsx server/seed-prod.ts
```

### Secrets Necessários

**Desenvolvimento:**
- `DATABASE_URL` - URL do banco Neon (dev)
- `SESSION_SECRET` - Secret para sessões

**Produção:**
- `DATABASE_URL_PROD` - URL do banco Neon (prod)
- `DATABASE_URL` - URL do banco Neon (prod, para deployment)
- `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`
- `SESSION_SECRET`

### Publicação no Replit

1. **Publishing → Advanced settings**
2. Configurar Production database settings
3. Adicionar todos os secrets de produção
4. Rodar seed de produção:
   ```bash
   npx tsx server/seed-prod.ts
   ```
5. Publish

---

## 📊 Dados de Seed Padrão

### Motoristas
| Nome    | Email                          | Senha    | Role  | Veículo Favorito |
|---------|--------------------------------|----------|-------|------------------|
| Misael  | programacao1215@hotmail.com    | senha123 | admin | TQQ0A07          |
| Robson  | robson@frota.com               | senha123 | driver| TQQ0A94          |
| Luan    | luan@frota.com                 | senha123 | driver| TQS4C30          |
| Gustavo | gustavo@frota.com              | senha123 | driver| TQU0H17          |

### Veículos
| Placa   | Modelo            | Motorista Padrão |
|---------|-------------------|------------------|
| TQQ0A94 | Dolphi Mini PT    | Robson           |
| TQQ0A07 | Dolphi Mini Azul  | Misael           |
| TQS4C30 | Dolphi Mini BR    | Luan             |
| TQU0H17 | Dolphi Mini BR    | Gustavo          |

---

## 🐛 Problemas Conhecidos e Soluções

### 1. Veículos não aparecem na produção
**Causa:** Banco de produção vazio  
**Solução:** Rodar seed de produção com `DATABASE_URL_PROD`

### 2. Erro "Invalid hook call"
**Causa:** `useState` usado em vez de `useEffect`  
**Solução:** Trocar para `useEffect` com dependencies

### 3. SelectItem com value vazio
**Causa:** Radix UI não aceita `<SelectItem value="">`  
**Solução:** Usar `value={field.value || undefined}` e `placeholder`

### 4. Drizzle and() com um argumento
**Causa:** `and()` requer 2+ argumentos  
**Solução:** Verificar `conditions.length` antes de usar `and()`

---

## 📝 Notas Finais

- Timezone: **America/Sao_Paulo**
- Idioma: **pt-BR** em toda UI
- Formato de moeda: **BRL (R$)**
- Formato de data: **DD/MM/YYYY HH:mm**
- Split de repasse: **60% empresa / 40% motorista**
- Indicador de favorito: **⭐**

---

**Versão:** 1.0.0  
**Última atualização:** Novembro 2024  
**Autor:** Sistema desenvolvido com Replit Agent
