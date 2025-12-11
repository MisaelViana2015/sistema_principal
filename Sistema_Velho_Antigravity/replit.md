## Overview
Rota Verde is a mobile-first management system designed to optimize electric vehicle fleet operations. It provides comprehensive tools for shift management, real-time ride tracking, cost recording, and automated revenue sharing. The system offers real-time KPIs, detailed dashboards with export capabilities, and an audit log for critical actions, enhancing efficiency and transparency for EV fleet businesses.

## User Preferences
I prefer detailed explanations.
I want iterative development.
Ask before making major changes.
Do not make changes to the folder `Z`.
Do not make changes to the file `Y`.

## System Architecture

### UI/UX Decisions
The system features a mobile-first design with a bottom navigation bar, supporting both dark and light themes. It utilizes `IconBadge` for visual hierarchy, `Lucide React` icons, real-time KPI cards with gradients, and large touch-friendly buttons. Typography uses Inter for text and JetBrains Mono for data. `shadcn/ui` ensures consistent UI components. Specific design elements include color-coded vehicle selection, streamlined admin ride navigation, and mobile-responsive chart labels that hide zero values. The login page features a modern, animated CSS design with radial/conic gradients, "electric road" lines, a CSS-drawn BYD car (desktop only), spinning border login card, neon input field effects, and a green gradient submit button, all while maintaining React Hook Form and Zod validation.

### Technical Implementations
The frontend is built with React, Vite, Tailwind CSS, and `shadcn/ui`. The backend uses Node.js and Express. Data persistence is handled by PostgreSQL (Neon) with Drizzle ORM. Authentication is session-based with role management (admin/driver) and ownership verification. Core logic includes strict shift management, automated 60/40 revenue splitting, pt-BR localization, and comprehensive audit logs. The system employs cache invalidation and real-time polling for UI updates. It includes an intelligent version checking system that notifies users of updates without forcing reloads and a session keep-alive mechanism with retry logic to prevent premature logouts. Low-value rides have a 2-minute cooldown, while high-value rides require password validation. Shift closure automatically calculates and persists aggregated financial metrics. An odometer validation system prevents KM regression using backend validation against `kmInicial` and previous `kmFinal` records, providing context-aware error messages.

### Feature Specifications
The system supports Admin and Driver roles with distinct access levels.
- **Shift Management**: Includes security features like password confirmation for closure and the ability to reopen the last closed shift. Admins have comprehensive shift editing capabilities, including timestamps, odometer readings, status changes, and inline ride/cost management with robust backend validation. Admins can override KM regression validation rules when editing shifts via the "Editar Turno Completo" dialog, accommodating legitimate scenarios like personal vehicle use between shifts. The system automatically sends `adminOverride: true` flag, bypassing KM validation, and logs these actions with action type `editar_turno_override_km` in the audit logs table. A status normalization function maps legacy database values (e.g., "closed") to the expected Portuguese enum values ("em_andamento", "finalizado") to prevent validation errors.
- **Ride Management**: Drivers have a read-only, paginated view of their rides.
- **Dashboards**: Dynamic data filtering, adaptive charts, and CSV export.
- **Vehicle Management**: Modules for maintenance, tire tracking, recurring fixed costs with payment tracking (including a detailed payment management system with status badges, year-based navigation, dual-bar comparative charts, and a vertical color gradient system for summary cards), and preventive maintenance alerts. Preventive maintenance includes real-time alerts based on mileage (e.g., Tire Rotation every 5,000 km, BYD Revision every 20,000 km), a visual dashboard, one-click registration, batched backend queries, and transactional integrity with pessimistic locking to prevent KM regression.
- **Financial Analytics (`Análise` Tab)**: Seven specialized tabs for detailed financial analysis, including core financial metrics (Financeiro), driver performance (Motoristas), vehicle economics (Veículos - in development), maintenance history (Manutenção - in development), tire tracking (Pneus - in development), cost distribution (Receitas x Despesas), and highlights/top performers (Destaques - in development). Features break-even analysis, profit/loss KPIs, and consistent temporal filters.
- **CX (`Caixa`) Page**: Allows viewing and PDF export of shift closures.
- **Driver Performance (`Desempenho`)**: Weekly and monthly views with interactive charts and performance rankings based on efficiency indicators.
- **Admin Shift Management (`Turnos` Tab)**: Provides administrators with comprehensive tools including extended period filters, multi-filter system, paginated lists, quick-view summaries, and full CRUD capabilities for shifts.
- **Driver Rankings (`/rankings`)**: Admin-only comparative performance dashboard with weighted score calculation.
- **Fraud Detection System (`Fraude` Tab)**: An advanced, admin-only automated fraud detection engine with robust statistical analysis, machine learning clustering, and 17 heuristic rules. The system features:
  - **Statistical Baseline Analysis**: Individual driver baselines (30-day window) and global fleet baselines (60-day window) for comparative anomaly detection
  - **Calibrated Risk Scoring**: Weighted scoring system (5/10/20/40 points) mapping to severity levels (low/medium/high/critical)
  - **17 Detection Rules**: Including KM regression analysis, revenue/KM anomalies, revenue/hour deviations, shift duration validation, inter-shift odometer verification, and machine learning clustering outlier detection
  - **K-means Clustering (v3.0)**: Advanced behavioral pattern analysis using K-means algorithm with k=3 clusters. Features include:
    - **Feature Extraction**: Uses `revenuePerKm`, `revenuePerHour`, and `ridesPerHour` as clustering dimensions
    - **Automatic Recalculation**: Clusters recalculated when stale (>24 hours) or missing, ensuring fresh baselines
    - **CLUSTER_OUTLIER Rule**: 17th fraud rule triggering when shift's Euclidean distance from nearest cluster centroid exceeds 3.0 threshold (20 points, high severity)
    - **Persistent Storage**: Cluster centroids stored in `risk_clusters` table with timestamps for staleness tracking
    - **Module**: `server/riskClusters.ts` implements K-means engine with feature extraction, distance calculation, and cluster assignment
  - **Visual Risk Heatmap**: Interactive calendar-based visualization showing risk scores by driver and day with color-coded cells (OK/Low/Medium/High/Critical). Features comprehensive statistics (critical days, suspicious days, average scores) and 30-day rolling window display. Accessed via `/api/fraud/heatmap?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` endpoint which aggregates fraud_events by driver/day and returns matrix with maxRiskScore per cell. Component: `FraudHeatmap.tsx`
  - **Automatic Persistence**: All fraud events are automatically persisted to the `fraud_events` table with complete metadata
  - **Daily Reports**: Comprehensive daily fraud summaries with per-driver statistics via `relatorioFraudeDiario()` endpoint
  - **Visual Badge Alert**: Real-time anomaly count badge on Fraude tab, updating every 60 seconds from `/api/fraud/summary`
  - **Review Workflow**: Admin review capabilities with status tracking, review notes, and false positive marking
  - **Detailed Rules View**: Expandable shift details showing all 17 fraud rules with pass/fail indicators (✓/X), expected vs actual values, comprehensive explanations, severity badges, and categorization by 6 groups (Odômetro, Eficiência, Produtividade, Volume, Baseline Individual, Duração)
  - **Full Shift Fraud Report**: Comprehensive shift audit system accessible for ALL shifts (not just suspicious ones) via "Ver Detalhes" button. Features include:
    - Complete shift metadata (driver, vehicle, timestamps, status)
    - Financial KPIs (revenue, km, efficiency metrics)
    - All 17 fraud rules with detailed explanations grouped by 6 categories
    - Pass/fail indicators (✓/✗) with expected vs actual values
    - PDF export capability for professional audit documentation
    - Dialog component: `FraudShiftFullReportDialog.tsx`
    - Backend aggregator: `getShiftFullReport()` in `fraudEngine.ts`
    - API endpoint: `/api/fraud/shift/:shiftId/full-report`
  - **Known Limitation**: Risk level mapping ("high"→"suspeito", "critical"→"critico") is applied at API response layer for UI consistency. Database stores raw English values ("low", "medium", "high", "critical"). API query filters use raw values but all UI displays use mapped Portuguese values.
- **API**: A comprehensive RESTful API supports all core functionalities.

### System Design Choices
- **Database Migrations**: Uses Drizzle ORM with a custom non-interactive script for automated and safe database schema synchronization (`drizzle-kit push`) during deployment, ensuring data integrity.

## External Dependencies
- **PostgreSQL (Neon)**: Main database.
- **Drizzle ORM**: Database interaction layer.
- **connect-pg-simple**: PostgreSQL session store.
- **Recharts**: For data visualization and charting.
- **lucide-react**: Icon library.
- **csv-parse**: For parsing CSV data.
- **jsPDF + jspdf-autotable**: For generating PDF documents.