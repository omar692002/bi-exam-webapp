# BI Exam — End-to-End Business Intelligence Project

A complete BI pipeline built for the 2nd-year engineering BI exam:

```
   SQL Server OLTP/staging          SSIS (ETL)            SSAS Multidimensional         REST API            React SPA
  ┌────────────────────┐        ┌──────────────┐        ┌────────────────────┐     ┌────────────┐     ┌──────────────┐
  │  BI_EXAM database  │ ─────▶ │  examETL     │ ─────▶ │  Cube  VDS         │ ──▶ │ .NET / Java│ ──▶ │  Vite + MUI  │
  │  (dbo.* tables)    │   load │  *.dtsx      │ process│  ExamMultidimension.│ MDX │  port 8080 │ REST│  port 5173   │
  └────────────────────┘        └──────────────┘        └────────────────────┘     └────────────┘     └──────────────┘
        star schema                dimensions+fact            measures + KPIs        analytics API       6-page dashboard
```

This README documents **all three layers** so the project can be understood end to end:
1. [The Data Warehouse](#part-1--data-warehouse) — source DB, ETL, star schema
2. [The OLAP Cube](#part-2--olap-cube-ssas-multidimensional) — dimensions, measures, calculated members
3. [The Web Application](#part-3--web-application) — backends, REST API, React dashboard

> **Folder layout on disk** (the three projects are siblings):
> ```
> exam/
> ├── examETL/                 SSIS ETL project (loads the warehouse)
> ├── ExamMultidimensionnel/   SSAS multidimensional project (the cube)   ← this repo does NOT track it
> └── webApp/                  Full-stack web app (this git repository)
> ```

---

## Part 1 — Data Warehouse

### 1.1 Source database

| | |
|---|---|
| Engine | Microsoft SQL Server |
| Database | **`BI_EXAM`** (schema `dbo`) |
| Connection | `Provider=SQLNCLI11.1; Data Source=OmarMnif; Initial Catalog=BI_EXAM` |

The warehouse is modelled as a classic **star schema**: one central fact table referencing four dimension tables.

### 1.2 ETL — `examETL` (SQL Server Integration Services)

Two SSIS packages populate the warehouse from the operational data:

| Package | Responsibility |
|---|---|
| **`Dimensions.dtsx`** | Loads / refreshes the four dimension tables (`Dim_Customer`, `Dim_Product`, `Dim_Employee`, `Dim_Date`). |
| **`Fact.dtsx`** | Loads the `Fact_SalesLines` fact table (one row per order line), resolving the dimension foreign keys. |

Run order: **dimensions first, then the fact** (so the fact's FKs resolve against populated dimensions).

### 1.3 Star schema

**Fact table — `dbo.Fact_SalesLines`** · grain = **one sales order line**

| Column | Role |
|---|---|
| `OrderDetailID` | Primary key (degenerate) |
| `ProductID`, `CustomerID`, `SalesRepID`, `DateKey` | Foreign keys → the four dimensions |
| `Quantity` | Measure — units on the line |
| `UnitPrice` | Measure — price per unit |
| `TaxAmount` | Measure — tax on the line |
| `LineTotal` | Measure — line revenue |
| `DiscountPercent` | Measure — discount applied |

**Dimension tables** (key columns + the descriptive columns that matter; several extra operational columns exist in the DW but were not all promoted into the cube):

| Dimension | Key | Notable columns | Computed columns |
|---|---|---|---|
| `Dim_Customer` | `CustomerID` | `CustomerType`, `CategoryName`, `City`, `State`, `Country`, `CustomerStatus`, `Rating`, `IsActive`, `RegistrationDate` | `FullName = FirstName + ' ' + LastName` |
| `Dim_Product` | `ProductID` | `ProductName`, `BrandName`, `Color`, `CategoryName`, `StandardCost`, `ListPrice` | — |
| `Dim_Employee` | `EmployeeID` | `DepartmentName`, `JobTitle`, `EmploymentType`, `EmploymentStatus`, `HireDate` | `FullName = FirstName + ' ' + LastName` |
| `Dim_Date` | `DateKey` | `FullDate`, `Year`, `Quarter`, `Month`, `Week`, `DayOfMonth`, `IsWeekend`, `IsHoliday` | `MonthName = DATENAME(month, FullDate)`, `QuarterName = 'Q' + CAST(Quarter AS VARCHAR)` |

> **Why month names appear in French and quarters as `Q2`:** `MonthName` is computed by SQL Server's `DATENAME(month, …)`, which follows the server's locale (French) — hence `mai`, `juin`, `juillet`… And `QuarterName` is literally `'Q' + quarter number`. The cube uses these computed columns as the member captions.

---

## Part 2 — OLAP Cube (SSAS Multidimensional)

Project `ExamMultidimensionnel` (SQL Server Data Tools / Visual Studio), catalog deployed as
**`ExamMultidimensionnel`**, single cube **`VDS`**.

### 2.1 Data Source & Data Source View

- **Data Source (`DS.ds`)** → points at the `BI_EXAM` database.
- **Data Source View (`VDS.dsv`)** → imports the 5 tables and their relationships
  (`FK_Fact_SalesLines_Dim_Customer / _Dim_Product / _Dim_Employee / _Dim_Date`), giving the star schema inside the cube.

### 2.2 Dimensions & attributes kept

Only a meaningful subset of the warehouse columns was promoted to cube attributes:

| Cube dimension | Key attribute (member name) | Attributes kept | Hierarchy |
|---|---|---|---|
| **Dim Customer** | Customer ID (named by `FullName`) | City · Customer Type · Category Name · Country · Customer Status | — |
| **Dim Product** | Product ID (named by `ProductName`) | Brand Name · Color · Category Name | — |
| **Dim Employee** | Employee ID (named by `FullName`) | Department Name · Job Title · Employment Type | — *(joined to the fact via `SalesRepID`)* |
| **Dim Date** *(Type = Time)* | Date Key (named by `FullDate`) | Year · Quarter · Month | **`Calander`**: Year → Quarter → Month → Date Key |

> The user hierarchy name `Calander` keeps the original (intentional) spelling from the cube and is referenced verbatim in MDX.

### 2.3 Measures (measure group `Fact Sales Lines`)

| Measure | Source column | Aggregation | Format |
|---|---|---|---|
| **Revenue** | `LineTotal` | `Sum` | Currency |
| **Quantity Sold** | `Quantity` | `Sum` | `#,##0` |
| **Tax Amount** | `TaxAmount` | `Sum` | Currency |
| **Avg Unit Price** | `UnitPrice` | `AverageOfChildren` | Currency |
| **Number of Order Lines** | *(row count)* | `Count` | `#,##0` |

### 2.4 Calculated measures (MDX script)

Five calculated members are derived **from the aggregated base measures** — the correct
"aggregate-then-divide" OLAP pattern (the ratio is recomputed from the totals at whatever level
you slice, giving a properly *weighted* result). Each division is guarded against divide-by-zero
with `IIF(... = 0, NULL, ...)`:

| Calculated measure | Formula | Notes |
|---|---|---|
| `Average_Order_Line_Value` | `Revenue / Number of Order Lines` | guarded |
| `Revenue_per_Unit` | `Revenue / Quantity Sold` | guarded · weighted "effective price" |
| `Revenue_Including_Tax` | `Revenue + Tax Amount` | additive, no guard needed |
| `Tax_Rate_Percentage` | `Tax Amount / Revenue` | guarded · shown as % |
| `Avg_Quantity_per_Order_Line` | `Quantity Sold / Number of Order Lines` | guarded |

### 2.5 Build / deploy / process

In Visual Studio (SSDT): **Build → Deploy** the `ExamMultidimensionnel` project to the local SSAS
instance, then **Process** the cube (Process Full) so the measures populate. The web app reads the
cube over MDX; it never queries the warehouse SQL directly.

> ℹ️ The current dataset spans a **single year (2025, months May–November)**, so several
> dimensions are effectively single-valued (Country = Tunisia, Employee Department/Title/Employment
> Type, Product Color). The dashboard intentionally focuses on the dimensions that carry real
> cardinality (Category, Brand, City, Customer Type/Status, time).

---

## Part 3 — Web Application

A React single-page dashboard backed by a REST API that translates HTTP requests into **MDX**
queries against the cube.

### 3.1 Backends (pick one — same contract, same port 8080)

Two interchangeable backends expose the **identical JSON API**:

| | Backend A — Quarkus (`backend/`) | Backend B — ASP.NET Core (`backend-dotnet/`) ⭐ |
|---|---|---|
| SSAS access | PowerShell + ADOMD.NET v15 (GAC), TCP 2383 | In-process `AdomdConnection` (singleton + semaphore), TCP 2383 |
| Per-query overhead | ~1–3 s (process spawn + assembly load) | ~5–20 ms |
| Requires | Java 17+, Maven | .NET 9 SDK |

**Backend B (.NET) is the recommended one** and is where all the newer analytics endpoints live.
No IIS / msmdpump / olap4j — ADOMD.NET connects straight to SSAS on port 2383.

Request flow: `Controller → AnalyticsService → AnalyticsRepository → MdxQueryBuilder → SsasClient (ADOMD) → ResultSetMapper → DTO (camelCase JSON)`.

### 3.2 REST API

All `/api/analytics/*` endpoints accept optional **`?year=`, `?quarter=`, `?month=`** time slicers.

**KPIs & reference**

| Method · Path | Description |
|---|---|
| `GET /api/health` | SSAS connectivity probe |
| `GET /api/analytics/years` | Distinct years available in the cube |
| `GET /api/analytics/kpis` | 8 headline KPIs (+ YoY delta when a year is selected) |

**Sales / dimension breakdowns**

| Path | Breakdown |
|---|---|
| `/sales-by-category` | Revenue & units by product category |
| `/sales-by-product` | by product brand |
| `/sales-by-product-color` | by color |
| `/sales-by-city` | by customer city |
| `/sales-by-country` | by country |
| `/sales-by-customer-type` | by customer type |
| `/sales-by-customer-status` | by customer status |
| `/sales-by-employee-department` · `/sales-by-employee-title` · `/sales-by-employment-type` | by employee attributes |
| `/product-scatter?n=20` | top brands with Revenue + Quantity + Order Lines (bubble scatter) |

**Time intelligence**

| Path | Output |
|---|---|
| `/revenue-over-time` | Revenue & units per month (chronological) |
| `/sales-by-year` · `/sales-by-month` · `/revenue-by-quarter` | grain-specific series for drill-down |
| `/revenue-growth` | Revenue + period-over-period growth % (YoY if multi-year, else MoM) |
| `/revenue-ytd` | Monthly revenue + cumulative running total |
| `/revenue-heatmap` | Category × Quarter cross-tab (matrix) |

**Tax & rankings**

| Path | Output |
|---|---|
| `/tax-analysis` | Tax vs revenue by category |
| `/top-customers?n=10` · `/top-products?n=10` · `/top-employees?n=10` | Top-N leaderboards |

Swagger / OpenAPI explorer: **http://localhost:8080/swagger-ui**.

### 3.3 Frontend (React + Vite + MUI + Recharts)

A **multi-page** dashboard with a fixed left sidebar, a top bar holding a **global period filter**
(Year / Quarter / Month) shared across every page, and a warm, editorial light theme
(cream background, burgundy + sage accents) inspired by Claude's aesthetic.

**Pages (sidebar sections):**

| Route | Page | What it shows |
|---|---|---|
| `/` | **Overview** | 8 KPI cards (with YoY delta chips), auto-generated insight strip, revenue momentum, category bar + seasonality heatmap, top customers/products |
| `/sales` | **Sales** | Revenue by category & brand, by city, customer type (donut) + status |
| `/time` | **Time Intelligence** | **Drill-down explorer** (Year → Quarter → Month, click to descend), MoM/YoY growth, YTD cumulative area, Category × Quarter heatmap, long-term trend |
| `/customers` | **Customers** | Type & status segments, revenue by city, top customers leaderboard |
| `/products` | **Products** | Category & brand mix, price-vs-volume bubble scatter, best sellers |
| `/workforce` | **Workforce & Tax** | Sales-rep leaderboard, tax vs revenue by category |

**Interactivity & UX details**

- **OLAP drill-down**: clicking a bar on the Time page descends the Date `Calander` hierarchy by
  updating the shared period filter; a breadcrumb shows the path and lets you climb back up.
- **Dual-axis clarity**: any chart with two Y-scales shows a color-coded *axis key*
  (e.g. *◀ Revenue (left) · Units (right) ▶*).
- **Legend toggles**, hover tooltips, skeleton loaders, and graceful empty-states throughout.
- Chart components: `BarChartCard`, `ComboChartCard`, `PieChartCard`, `AreaChartCard`,
  `GrowthChartCard`, `ScatterCard`, `HeatmapCard`, all built on a shared `ChartCard` frame;
  data flows through `useData` / `usePeriodData` hooks and a `FilterContext`.

---

## Prerequisites

1. **SQL Server** with the `BI_EXAM` warehouse (loaded via the `examETL` SSIS packages).
2. **SSAS (Multidimensional)** running locally with the `ExamMultidimensionnel` cube deployed & processed.
3. **Node 18+** for the frontend.
4. **.NET 9 SDK** (Backend B) — or **Java 17+ & Maven** (Backend A).

## Quick start

```powershell
# === Terminal 1 — pick ONE backend (both serve http://localhost:8080) ===

# Recommended — ASP.NET Core
cd backend-dotnet
dotnet run

# Alternative — Quarkus
cd backend
mvn quarkus:dev

# Health probe:   http://localhost:8080/api/health
# API explorer:   http://localhost:8080/swagger-ui

# === Terminal 2 — frontend ===
cd frontend
npm install      # first run only
npm run dev      # → http://localhost:5173
```

> Only one backend at a time — both listen on `http://localhost:8080`.

## Project layout (this repository = `webApp/`)

```
webApp/
├── backend/                  Quarkus REST API (reference implementation)
├── backend-dotnet/           ASP.NET Core REST API (recommended)
│   ├── Controllers/          AnalyticsController, HealthController
│   ├── Services/             AnalyticsService (KPIs, growth, YTD, heatmap)
│   ├── Repository/           AnalyticsRepository (MDX builders)
│   ├── Mdx/                  MdxConstants, MdxQueryBuilder, ResultSetMapper, SsasClient
│   └── Dtos/                 ChartData, Kpi, TableData, MatrixData, TimeFilter
└── frontend/
    └── src/
        ├── api.js            All API calls
        ├── App.jsx           Router + theme + FilterProvider
        ├── theme.js          Warm light theme (exports PALETTE)
        ├── context/          FilterContext (global period filter)
        ├── hooks/            useData, usePeriodData
        ├── pages/            Overview, Sales, TimeIntelligence, Customers, Products, WorkforceTax
        └── components/
            ├── layout/       AppShell, Sidebar, TopBar
            ├── kpi/          KpiCard, KpiRow
            ├── charts/       Bar/Combo/Pie/Area/Growth/Scatter/Heatmap + ChartCard, AxisKey
            ├── tables/       DataTable
            └── common/       Section, DataSlot, Loader, EmptyState, ErrorBanner, InsightStrip
```

## Configuration

**Backend B — `backend-dotnet/appsettings.json`**
```json
{
  "Kestrel": { "Endpoints": { "Http": { "Url": "http://localhost:8080" } } },
  "Ssas": { "DataSource": "localhost", "Catalog": "ExamMultidimensionnel", "Cube": "VDS" },
  "Cors": { "Origins": ["http://localhost:5173", "http://localhost:3000"] }
}
```

**Backend A — `backend/src/main/resources/application.properties`**
```properties
ssas.data-source=localhost
ssas.catalog=ExamMultidimensionnel
ssas.cube=VDS
quarkus.http.port=8080
```
