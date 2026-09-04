# FraudShield AI - Frontend Data Audit

This document outlines all hardcoded and mock data currently present in the FraudShield AI frontend, mapping them to the required backend architecture, APIs, and database tables.

---

## 1. Complete Architecture Summary

FraudShield AI currently consists of a purely static, client-side React (Next.js) frontend. The application uses hardcoded JSON arrays, state variables, and static text to simulate a functional fraud monitoring workstation. 

To make this application fully operational, we must transition to a **Client-Server Architecture**:
* **Frontend (Next.js)**: Acts as the presentation layer. Will fetch data via REST APIs for historical/aggregate data and connect via WebSockets for real-time transaction streaming and alerts.
* **Backend (FastAPI)**: Will serve REST endpoints, handle WebSocket connections, query the database, and interface with the ML pipelines.
* **Database (SQLite/PostgreSQL)**: Will store transactions, alerts, patterns, customer profiles, system metrics, and model metadata.
* **ML Engine**: Will evaluate transactions in real-time and provide risk scores, SHAP values, and pattern cluster IDs.

### Categories
* **A.** Static UI content (Labels, Headers, Tooltips)
* **B.** Database-driven data (Lists, Tables, Profiles)
* **C.** ML-generated data (Risk Scores, SHAP values, Fraud Probabilities)
* **D.** Real-time streaming data (Live Monitor Feed, Notification Bell)
* **E.** Calculated analytics (Charts, KPIs, Aggregations)
* **F.** Configuration (Rules, Thresholds)
* **G.** System health (CPU, Mem, Pipeline status)

---

## 2. List of Frontend Files (Routes)

The application implements the following routing structure:
* `src/app/page.tsx` (`/`) - Landing Page
* `src/app/(dashboard)/layout.tsx` - Shared Dashboard Shell (Sidebar & Header)
* `src/app/(dashboard)/dashboard/page.tsx` (`/dashboard`) - Overview Dashboard
* `src/app/(dashboard)/live/page.tsx` (`/live`) - Live Monitor
* `src/app/(dashboard)/analyze/page.tsx` (`/analyze`) - Analyze Transaction
* `src/app/(dashboard)/transactions/page.tsx` (`/transactions`) - Transactions List
* `src/app/(dashboard)/transactions/[id]/page.tsx` (`/transactions/[id]`) - Transaction Details
* `src/app/(dashboard)/alerts/page.tsx` (`/alerts`) - Fraud Alerts
* `src/app/(dashboard)/alerts/[id]/page.tsx` (`/alerts/[id]`) - Alert Investigation
* `src/app/(dashboard)/patterns/page.tsx` (`/patterns`) - Fraud Patterns
* `src/app/(dashboard)/patterns/[id]/page.tsx` (`/patterns/[id]`) - Pattern Details
* `src/app/(dashboard)/models/page.tsx` (`/models`) - Model Intelligence
* `src/app/(dashboard)/data/page.tsx` (`/data`) - Data Center
* `src/app/(dashboard)/system/page.tsx` (`/system`) - System Health

---

## 3. Hardcoded Data Locations & API Mapping

### Global Shell (`layout.tsx`)
* **Component**: Top Navigation Bar
* **Current Hardcoded Value**: Alert Badge (8), System Status ("Operational").
* **Backend Needed?**: Yes (Category D, G).
* **API Endpoint**: `GET /api/v1/system/status`, `WS /ws/notifications`
* **DB Table**: `alerts`, `system_health`
* **Logic**: Real-time push for new alerts.

### Overview Dashboard (`/dashboard`)
* **Component**: Top KPIs
* **Current Hardcoded Value**: 124,592 transactions, 1,842 blocked, 1.4% rate, +12% trend.
* **Backend Needed?**: Yes (Category E).
* **API Endpoint**: `GET /api/v1/analytics/kpis?timeframe=today`
* **DB Table**: `transactions`, `alerts`
* **Logic**: SQL `COUNT()`, `SUM()` grouped by timestamp. Requires aggregate logic.

* **Component**: Volume & Fraud Trend (Area Chart)
* **Current Hardcoded Value**: Static `data` array with time, volume, fraud entries (00:00 to 20:00).
* **Backend Needed?**: Yes (Category E).
* **API Endpoint**: `GET /api/v1/analytics/volume-trend?interval=1h`
* **DB Table**: `transactions`
* **Logic**: Time-series aggregation.

### Live Monitor (`/live`)
* **Component**: Live Transaction Feed & Metrics
* **Current Hardcoded Value**: Simulated setInterval adding mock transactions to an array. Hardcoded throughput (142/s), avg response time (45ms).
* **Backend Needed?**: Yes (Category D, C).
* **API Endpoint**: `WS /ws/live-transactions`
* **DB Table**: `transactions`
* **Logic**: Real-time WebSocket feed pushing newly evaluated transactions straight from the ML Engine.

### Analyze Transaction (`/analyze`)
* **Component**: Manual evaluation form & SHAP chart
* **Current Hardcoded Value**: Placeholder risk score (88), probability (92%), SHAP values (Amount +15, Time +12).
* **Backend Needed?**: Yes (Category C).
* **API Endpoint**: `POST /api/v1/ml/analyze`
* **DB Table**: N/A (Direct inference)
* **Logic**: Passes JSON payload to ML model, returns exact risk score, sub-scores, and SHAP feature importances. Requires ML Output.

### Transactions Explorer (`/transactions` & `/transactions/[id]`)
* **Component**: Transaction Data Table & Details View
* **Current Hardcoded Value**: Mock list of ~10 transactions. Static customer names, IP addresses, locations.
* **Backend Needed?**: Yes (Category B, C).
* **API Endpoint**: `GET /api/v1/transactions`, `GET /api/v1/transactions/{id}`
* **DB Table**: `transactions`, `customers`
* **Logic**: Standard CRUD. Requires pagination, filtering (date, status, risk level). 

### Fraud Alerts (`/alerts` & `/alerts/[id]`)
* **Component**: Alerts Table & Investigation Timeline
* **Current Hardcoded Value**: Hardcoded alert rows (e.g., "ALRT-2025-000842"). Hardcoded investigation steps.
* **Backend Needed?**: Yes (Category B).
* **API Endpoint**: `GET /api/v1/alerts`, `POST /api/v1/alerts/{id}/action`
* **DB Table**: `alerts`, `alert_history`
* **Logic**: Requires state machine (Open -> Under Investigation -> Resolved).

### Fraud Patterns (`/patterns` & `/patterns/[id]`)
* **Component**: Detected Clusters Table & Characteristics
* **Current Hardcoded Value**: Array of patterns (e.g., "High Velocity Small Amounts"). Hardcoded geographic distribution (Maharashtra 352, Karnataka 218).
* **Backend Needed?**: Yes (Category C, E).
* **API Endpoint**: `GET /api/v1/patterns`, `GET /api/v1/patterns/{id}`
* **DB Table**: `fraud_patterns`
* **Logic**: ML unsupervised clustering outputs (e.g., Isolation Forest / DBSCAN). Batch calculated nightly or continuously.

### Model Intelligence (`/models`)
* **Component**: Model Performance Metrics
* **Current Hardcoded Value**: Accuracy (99.8%), Precision (94.2%), Recall (89.5%). ROC curve array, Feature importance bar chart.
* **Backend Needed?**: Yes (Category C, E).
* **API Endpoint**: `GET /api/v1/ml/metrics`
* **DB Table**: `model_metrics`, `model_registry`
* **Logic**: Data extracted from ML pipeline evaluation phases (e.g., XGBoost, Random Forest evaluation logs).

### Data Center (`/data`)
* **Component**: Pipeline throughput & Storage Usage
* **Current Hardcoded Value**: Volume (12.4 TB), Hot/Warm/Cold pie chart, Active Pipelines list.
* **Backend Needed?**: Yes (Category G).
* **API Endpoint**: `GET /api/v1/system/data-center`
* **DB Table**: `data_sources`, `pipeline_metrics`
* **Logic**: System level checks, database size queries.

### System Health (`/system`)
* **Component**: Hardware & Network Metrics
* **Current Hardcoded Value**: CPU (34%), RAM (58%), active incidents (0).
* **Backend Needed?**: Yes (Category G, D).
* **API Endpoint**: `GET /api/v1/system/health`, `WS /ws/system-metrics`
* **DB Table**: `system_logs`
* **Logic**: Real-time polling or WS for server hardware metrics.

---

## 4. Recommended API Mapping (REST)

To fully support the frontend, the backend should implement the following core controllers:

* **`AnalyticsController`**: `/api/v1/analytics/*` (KPIs, time-series charts, aggregations)
* **`TransactionController`**: `/api/v1/transactions/*` (Search, filter, fetch by ID)
* **`AlertController`**: `/api/v1/alerts/*` (List, update status, add comment, escalate)
* **`PatternController`**: `/api/v1/patterns/*` (List discovered patterns, rule generation)
* **`ModelController`**: `/api/v1/models/*` (Run inference, fetch ROC/PR curves, fetch feature importances)
* **`SystemController`**: `/api/v1/system/*` (Health checks, disk usage, active background pipelines)

---

## 5. Recommended WebSocket Mapping

* **`ws://<host>/ws/live`**: Pushes an array of newly processed transactions every 1-2 seconds for the `/live` page.
* **`ws://<host>/ws/notifications`**: Pushes a lightweight JSON payload whenever a new `High Risk` alert is generated by the ML model.

---

## 6. Architectural Problems Discovered (Frontend Specific)

1. **State Management**: The frontend currently uses localized React state (`useState`) within individual pages. Once backend integration begins, a global state manager (like Zustand or React Query) will be heavily required to cache KPI data, share active alerts between the Sidebar and the Alerts page, and manage WebSocket connections centrally without reconnecting on every route change.
2. **Missing Loading States**: Because data is currently hardcoded, there are no skeleton loaders, spinners, or error boundaries. These must be introduced when wrapping components in data-fetching hooks (e.g. `isLoading`, `isError` from React Query).
3. **Pagination**: The tables in `/transactions` and `/alerts` currently show a static subset of data. Pagination UI components (Next/Prev, page numbers) are missing and will need to be added to support server-side pagination.
4. **Mocked Timestamps**: Dates are hardcoded to "May 29, 2025". The frontend will need a utility (e.g., `date-fns` or `dayjs`) to format incoming ISO 8601 timestamps gracefully to relative times ("2 mins ago").
5. **Chart Extensibility**: Recharts components are currently tightly coupled to perfectly shaped mock objects. Data transformations will be necessary immediately after fetching from the API to fit the expected `{ name: string, val: number }` Recharts format.
