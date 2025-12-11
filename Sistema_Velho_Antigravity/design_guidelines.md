# Design Guidelines: Electric Fleet Management System

## Design Approach

**Selected Framework**: Material Design-inspired data management system
**Justification**: This is a utility-focused, information-dense productivity application requiring clear data hierarchy, efficient workflows, and mobile-first operation for drivers in active shifts.

**Core Principles**:
- Operational clarity over visual flair
- Data legibility and quick scanning
- Touch-friendly controls for mobile drivers
- Clear visual feedback for system states
- Professional, trustworthy interface for financial data

---

## Typography System

**Font Family**: 
- Primary: 'Inter' (Google Fonts) - excellent for data displays and numbers
- Monospace: 'JetBrains Mono' for license plates, financial values, and timestamps

**Type Scale**:
- Hero/Page Title: text-3xl/4xl font-bold (turno headers, dashboard title)
- Section Headers: text-xl/2xl font-semibold (card group titles, form sections)
- Card Titles: text-lg font-medium (individual metric cards, vehicle names)
- Body/Data: text-base font-normal (lists, descriptions)
- Labels: text-sm font-medium uppercase tracking-wide (field labels, categories)
- Metadata: text-sm (timestamps, secondary info)
- Financial Values: text-2xl/3xl font-bold tabular-nums (large monetary displays)
- Table Data: text-sm tabular-nums (numeric columns in tables)

**Special Treatments**:
- License plates: font-mono text-lg font-bold uppercase
- Currency values: Always prefix "R$" with tabular-nums for alignment
- Time displays: Use 24h format (HH:mm) consistently

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **4, 6, 8, 12, 16** (p-4, m-6, gap-8, py-12, space-y-16)
- Component padding: p-4 to p-6
- Section spacing: space-y-8 to space-y-12
- Page margins: px-4 (mobile) to px-8 (desktop)
- Card gaps: gap-4 to gap-6

**Container Strategy**:
- Mobile-first: Full width with px-4 padding
- Desktop max-width: max-w-7xl mx-auto
- Dashboard/tables: Can expand to full width for data visibility
- Forms: max-w-2xl for optimal reading

**Grid Patterns**:
- Metric cards (turno ativo): 2 columns mobile (grid-cols-2), 3-4 desktop (md:grid-cols-3 lg:grid-cols-4)
- Vehicle/driver lists: Single column mobile, 2-3 desktop
- Dashboard cards: 2x2 grid mobile, 4 across desktop

---

## Component Library

### Navigation
**Mobile Bottom Nav** (Primary - drivers on the go):
- Fixed bottom bar with 5 icons + labels: Turno (home), Dashboard, Veículos, Motoristas, Logs
- Active state: Bold icon + text with subtle indicator bar on top
- Admin submenu: Slide-up drawer with cadastro options

**Desktop Sidebar**:
- Collapsed by default (icons only) with expand button
- Full menu shows labels + icons
- Admin section clearly separated with divider

### Cards - Real-time Shift Metrics
**Large Value Cards** (during active shift):
- Bold value display: text-3xl font-bold tabular-nums
- Emoji icon for quick recognition (💰🔴💚🔵🟢📱🤝)
- Label below in text-sm
- Subtle border, rounded-lg, p-6
- Update with smooth transition when values change

**Info Cards** (vehicle/driver summary):
- Compact with icon/emoji left-aligned
- Two-line: Bold title + secondary info text-sm
- Favorite star (⭐) prominently displayed

### Action Buttons
**Primary Actions** (mobile-optimized):
- Full width on mobile: w-full
- Large touch targets: py-4 px-6 text-lg
- Bold labels with icon prefix
- Three main actions get distinct visual treatment:
  - [Adicionar Corrida]: Primary prominence
  - [Adicionar Custo]: Secondary style
  - [Encerrar Turno]: Caution/warning style (requires confirmation)

**Secondary Actions**:
- Icon + text, py-3 px-4, text-base
- Used in admin panels, filters

### Forms
**Shift Start Form**:
- Large vehicle selector with visual cards (not dropdown)
- Each vehicle shows: Placa (mono font), Modelo, Status indicator
- Favorite vehicle (⭐) card positioned first with subtle highlight
- KM input: Large numeric keypad-friendly input (text-2xl, type="number")

**Quick Entry Forms** (Corrida/Custo):
- Full-screen on mobile (not modal)
- Type selector: Large button pills (App/Particular or Recarga tipos)
- Value input dominates screen: text-4xl for easy entry
- Auto-focused currency input with R$ prefix
- Time defaults to "agora" with edit option

### Financial Summary (Encerramento)
**Structured Sections**:
1. **Corridas Lists** - Grouped by type:
   - Numbered list with time + value alignment
   - Emoji headers (📅 Aplicativo, 🤝 Particular)
   - Totals in bold with dotted leader lines

2. **Resumo Box**:
   - Bordered section with emphasis
   - Each line: Label (left) .... Value (right, bold)
   - Final values (Empresa/Motorista) in larger text

3. **KM Input Section**:
   - Side-by-side: Inicial (readonly) | Final (editable) 
   - Calculated KM rodados auto-updates
   - Large input for final KM entry

### Tables (Dashboard, Logs)
**Data Tables**:
- Sticky header row
- Alternating subtle row backgrounds for readability
- Numeric columns: text-right tabular-nums
- Mobile: Horizontal scroll with first column sticky
- Export CSV button: top-right of table

**Table Columns**:
- Timestamp: text-sm, secondary emphasis
- Names/Labels: text-base font-medium
- Financial values: text-base font-bold tabular-nums
- Status badges: rounded-full px-3 py-1 text-xs

### Status Indicators
**Vehicle Status**:
- Disponível: Success badge with green indicator
- Em Uso: Warning badge with shift ID reference
- Badge style: rounded-full, px-3, py-1, text-xs font-medium

**Shift Status**:
- Em andamento: Pulsing dot indicator
- Finalizado: Static checkmark

### Charts (Dashboard)
**Chart Library**: Use Recharts (React) via CDN
**Chart Types**:
- Bar chart: Líquido por motorista (categorical)
- Line chart: Líquido por dia (temporal)
- Donut chart: App vs Particular percentage

**Chart Styling**:
- Clean grid lines, subtle
- Bold data visualization
- Legend below charts
- Responsive sizing

### Filters
**Filter Bar**:
- Horizontal scroll on mobile
- Pill-style selectors for quick options (Hoje, Semana, Mês)
- Date range picker for custom periods
- Dropdown for motorista selection (Todos + individual)

### Alerts & Warnings
**Vehicle Warning** (using outro motorista's vehicle):
- Alert box with ⚠️ icon
- Clear message: "Este veículo é do {nome}. Confirmar uso?"
- Two action buttons: Cancel | Confirmar mesmo assim

**Validation Errors**:
- Inline below inputs with icon
- Full-width alert boxes for system blocks

---

## Animations

**Minimal, Functional Only**:
- Card value updates: Number count-up animation (0.5s)
- List items: Subtle fade-in when adding corrida/custo
- Navigation transitions: Slide (mobile), none (desktop)
- Loading states: Simple spinner for data fetches
- **No** decorative scroll effects, parallax, or hero animations

---

## Mobile-First Specifics

**Critical Mobile Patterns**:
- Bottom navigation always visible (safe area aware)
- Large tap targets (min 48px height)
- Numeric inputs trigger number keyboard
- Time inputs show time picker wheel
- Sheets/drawers for secondary actions (not modals blocking full screen)
- Pull-to-refresh on list views

**Desktop Enhancements**:
- Sidebar navigation replaces bottom nav
- Multi-column layouts for dashboard
- Hover states on interactive elements
- Keyboard shortcuts for power users (admin)

---

## Images

**No hero images** - This is an operational tool focused on data and functionality.

**Icon Usage**:
- Material Icons via CDN for UI controls (menu, add, check, close, etc.)
- Emojis for quick visual categories in metrics (💰🔴💚 etc.)
- Vehicle status: Simple colored dots/badges (no custom illustrations)