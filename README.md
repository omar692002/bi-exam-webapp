# BI Exam — Web Application

Full-stack BI dashboard consuming the `ExamMultidimensionnel` SSAS multidimensional cube, cube `VDS`.

## Stack

| Layer    | Technology                                                      |
|----------|-----------------------------------------------------------------|
| Cube     | SQL Server Analysis Services — catalog `ExamMultidimensionnel` |
| Backend  | Java 17+, Quarkus 3.16.4, Maven                                 |
| SSAS bridge | PowerShell + ADOMD.NET v15 (Windows GAC), direct TCP 2383   |
| Frontend | React (Vite), Material UI, Recharts, Axios                      |

No IIS, no msmdpump, no olap4j required. ADOMD.NET connects directly to SSAS on port 2383.

## Prerequisites

1. **SSAS** running locally — service `SQL Server Analysis Services (MSSQLSERVER)` must be started, with `ExamMultidimensionnel` cube deployed.
2. **Java 17+** and **Maven 3.9+**
3. **Node 18+**

## Quick start

```powershell
# Terminal 1 — backend
cd backend
mvn quarkus:dev
# → http://localhost:8080
# → http://localhost:8080/swagger-ui  (API explorer)
# → http://localhost:8080/api/health  (SSAS connectivity probe)

# Terminal 2 — frontend
cd frontend
npm install   # only needed once
npm run dev
# → http://localhost:5173
```

## Layout

```
webApp/
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/bi/exam/
│       ├── config/        SsasProperties
│       ├── controller/    AnalyticsController, HealthController
│       ├── service/       AnalyticsService
│       ├── repository/    AnalyticsRepository
│       ├── mdx/           MdxConstants, MdxQueryBuilder, SsasBridge, ResultSetMapper
│       ├── dto/           ChartDataDto, KpiDto, KpiSummaryDto, TableDataDto, ChartSeriesDto
│       └── exception/     BiException, MdxExecutionException, GlobalExceptionMapper
└── frontend/
    └── src/
        ├── api.js
        ├── App.jsx         KPI row + 4 tabs
        └── components/     KpiCard, ChartCard, DataTable
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | SSAS connectivity probe |
| GET | `/api/analytics/kpis` | 6 KPI headline values |
| GET | `/api/analytics/sales-by-category` | Revenue by product category |
| GET | `/api/analytics/sales-by-product` | Revenue by brand |
| GET | `/api/analytics/sales-by-country` | Revenue by country |
| GET | `/api/analytics/sales-by-customer-type` | Revenue by customer type |
| GET | `/api/analytics/revenue-over-time` | Revenue per year |
| GET | `/api/analytics/revenue-by-quarter` | Revenue per quarter |
| GET | `/api/analytics/tax-analysis` | Tax vs revenue by category |
| GET | `/api/analytics/top-customers?n=10` | Top N customers by revenue |
| GET | `/api/analytics/top-products?n=10` | Top N products by revenue |
| GET | `/api/analytics/top-employees?n=10` | Top N employees by revenue |
