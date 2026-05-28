# BI Exam — Web Application

Full-stack BI dashboard consuming the `ExamMultidimensionnel` SSAS multidimensional cube, cube `VDS`.

## Stack

| Layer        | Technology                                                                |
|--------------|---------------------------------------------------------------------------|
| Cube         | SQL Server Analysis Services — catalog `ExamMultidimensionnel`           |
| Backend (A)  | Java 17+, Quarkus 3.16.4, Maven                                           |
| Backend (B)  | .NET 9, ASP.NET Core, native ADOMD.NET (NuGet) — faster, recommended      |
| SSAS bridge (A) | PowerShell + ADOMD.NET v15 (Windows GAC), direct TCP 2383              |
| SSAS bridge (B) | In-process `AdomdConnection` (singleton, semaphore-guarded), TCP 2383  |
| Frontend     | React (Vite), Material UI, Recharts, Axios                                |

Two backends are shipped side-by-side. Both expose the **same 11 endpoints with the same JSON contract** on the same port (8080), so the frontend works with either — pick one.

No IIS, no msmdpump, no olap4j required. ADOMD.NET connects directly to SSAS on port 2383.

## Which backend should I run?

| | Backend A — Quarkus (`backend/`) | Backend B — ASP.NET Core (`backend-dotnet/`) |
|---|---|---|
| Per-query overhead | ~1–3 s (PowerShell cold start + ADOMD load) | ~5–20 ms (in-process ADOMD) |
| Smoothness | Visibly laggy on filter changes | Snappy |
| Requires | Java 17+, Maven | .NET 9 SDK |

**Run B for the smoothest experience.** A is kept as a reference implementation and works without the .NET SDK installed.

> Only one backend at a time — both listen on `http://localhost:8080`.

## Prerequisites

1. **SSAS** running locally — service `SQL Server Analysis Services (MSSQLSERVER)` must be started, with `ExamMultidimensionnel` cube deployed.
2. **Node 18+** (for the frontend)
3. For Backend A: **Java 17+** and **Maven 3.9+**
4. For Backend B: **.NET 9 SDK** (https://dotnet.microsoft.com/download)

## Quick start

```powershell
# === Terminal 1 — pick ONE backend ===

# Option A — Quarkus
cd backend
mvn quarkus:dev

# Option B — ASP.NET Core (recommended)
cd backend-dotnet
dotnet run

# Either one serves:
# → http://localhost:8080
# → http://localhost:8080/swagger-ui   (API explorer)
# → http://localhost:8080/api/health   (SSAS connectivity probe)

# === Terminal 2 — frontend ===
cd frontend
npm install   # only needed once
npm run dev
# → http://localhost:5173
```

## Layout

```
webApp/
├── backend/                  Quarkus REST API (original)
│   ├── pom.xml
│   └── src/main/java/com/bi/exam/
│       ├── config/           SsasProperties
│       ├── controller/       AnalyticsController, HealthController
│       ├── service/          AnalyticsService
│       ├── repository/       AnalyticsRepository
│       ├── mdx/              MdxConstants, MdxQueryBuilder, SsasBridge, ResultSetMapper
│       ├── dto/              ChartDataDto, KpiDto, KpiSummaryDto, TableDataDto, ChartSeriesDto
│       └── exception/        BiException, MdxExecutionException, GlobalExceptionMapper
├── backend-dotnet/           ASP.NET Core REST API (low-latency alternative)
│   ├── BiBackend.csproj
│   ├── Program.cs            DI, CORS, Swagger, global exception handler
│   ├── appsettings.json      Ssas:{DataSource,Catalog,Cube}, CORS, Kestrel
│   ├── Config/               SsasOptions
│   ├── Controllers/          AnalyticsController, HealthController
│   ├── Services/             AnalyticsService
│   ├── Repository/           AnalyticsRepository
│   ├── Mdx/                  MdxConstants, MdxQueryBuilder, ResultSetMapper, SsasClient (native ADOMD)
│   ├── Dtos/                 ChartData, Kpi, TableData, TimeFilter
│   └── Exceptions/           BiException, MdxExecutionException
└── frontend/
    └── src/
        ├── api.js
        ├── App.jsx           KPI row + 4 tabs
        └── components/       KpiCard, ChartCard, DataTable
```

## API endpoints (identical on both backends)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | SSAS connectivity probe |
| GET | `/api/analytics/kpis` | 6 KPI headline values |
| GET | `/api/analytics/sales-by-category` | Revenue by product category |
| GET | `/api/analytics/sales-by-product` | Revenue by brand |
| GET | `/api/analytics/sales-by-country` | Revenue by country |
| GET | `/api/analytics/sales-by-customer-type` | Revenue by customer type |
| GET | `/api/analytics/revenue-over-time` | Revenue per month |
| GET | `/api/analytics/revenue-by-quarter` | Revenue per quarter |
| GET | `/api/analytics/tax-analysis` | Tax vs revenue by category |
| GET | `/api/analytics/top-customers?n=10` | Top N customers by revenue |
| GET | `/api/analytics/top-products?n=10` | Top N products by revenue |
| GET | `/api/analytics/top-employees?n=10` | Top N employees by revenue |

All analytics endpoints accept optional `?year=`, `?quarter=`, `?month=` query parameters for time slicing.

## Configuration

### Backend A — `backend/src/main/resources/application.properties`
```properties
ssas.data-source=localhost
ssas.catalog=ExamMultidimensionnel
ssas.cube=VDS
quarkus.http.port=8080
```

### Backend B — `backend-dotnet/appsettings.json`
```json
{
  "Kestrel": { "Endpoints": { "Http": { "Url": "http://localhost:8080" } } },
  "Ssas": {
    "DataSource": "localhost",
    "Catalog": "ExamMultidimensionnel",
    "Cube": "VDS"
  },
  "Cors": { "Origins": ["http://localhost:5173", "http://localhost:3000"] }
}
```
