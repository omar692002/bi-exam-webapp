# BI Exam — Web Application: Progress Tracker

> **For future Claude sessions:** read this file first to understand the project state and pick up where the previous session stopped.

Last updated: 2026-05-28

---

## 1. Project goal

Build a full-stack **BI dashboard web application** consuming the existing SSAS multidimensional cube `ExamMultidimensionnel` (catalog), cube `VDS`, deployed locally.

The backend must execute **MDX** queries against the cube (NOT SQL against the warehouse) and expose them as REST endpoints. The frontend must be a React dashboard consuming those endpoints.

Location: `C:\Users\User\Desktop\cours2emeIng\BI\exam\webApp`

---

## 2. Stack (locked-in decisions)

| Layer        | Tech                                                                  |
|--------------|-----------------------------------------------------------------------|
| Cube         | SSAS Multidimensional — catalog `ExamMultidimensionnel`, cube `VDS`   |
| Backend (A)  | Java 17+, Quarkus 3.16.4, Maven — original implementation             |
| Backend (B)  | .NET 9, ASP.NET Core, native ADOMD.NET (NuGet) — added 2026-05-28 for low-latency execution |
| SSAS↔Java    | PowerShell subprocess + ADOMD.NET v15 (GAC) — direct TCP port 2383    |
| SSAS↔.NET    | In-process AdomdConnection (singleton, semaphore-guarded) — TCP 2383  |
| Frontend     | React (Vite), Material UI, Recharts, Axios                            |

## 3. Cube reference

**Base measures (5):** Revenue, Quantity Sold, Tax Amount, Avg Unit Price, Number of Order Lines

**Calculated measures (5):** Average_Order_Line_Value, Revenue_per_Unit, Revenue_Excluding_Tax, Tax_Rate_Percentage, Avg_Quantity_per_Order_Line

**Dimensions:**
- `Dim Date` (Type=Time) — hierarchy `Calander` (typo preserved in cube), levels Year → Quarter → Month → DateKey
- `Dim Customer` — Customer ID, Category Name, City, Country, Customer Status, Customer Type
- `Dim Product` — Product ID, Brand Name, Category Name, Color
- `Dim Employee` — Employee ID, Department Name, Job Title, Employment Type

---

## 4. Architecture

```
webApp/
├── backend/                         Quarkus REST API (original)
│   ├── pom.xml                      Quarkus 3.16.4, no olap4j
│   └── src/main/java/com/bi/exam/
│       ├── BiBackendApplication.java
│       ├── config/                  SsasProperties (dataSource, catalog, cube)
│       ├── controller/              AnalyticsController, HealthController
│       ├── service/                 AnalyticsService
│       ├── repository/              AnalyticsRepository
│       ├── mdx/                     MdxConstants, MdxQueryBuilder, SsasBridge, ResultSetMapper
│       ├── dto/                     ChartDataDto, KpiDto, KpiSummaryDto, TableDataDto, ChartSeriesDto
│       ├── exception/               BiException, MdxExecutionException, GlobalExceptionMapper
│       └── util/                    MdxUtils
├── backend-dotnet/                  ASP.NET Core REST API (low-latency alternative)
│   ├── BiBackend.csproj             .NET 9 + Microsoft.AnalysisServices.AdomdClient.NetCore
│   ├── Program.cs                   DI, CORS, Swagger, global exception handler
│   ├── appsettings.json             Ssas:{DataSource,Catalog,Cube}, Cors:Origins, Kestrel http://localhost:8080
│   ├── Config/SsasOptions.cs
│   ├── Controllers/                 AnalyticsController, HealthController
│   ├── Services/                    AnalyticsService
│   ├── Repository/                  AnalyticsRepository
│   ├── Mdx/                         MdxConstants, MdxQueryBuilder, ResultSetMapper, SsasClient (native ADOMD)
│   ├── Dtos/                        ChartDataDto, KpiDto, TableDataDto, TimeFilter
│   └── Exceptions/                  BiException, MdxExecutionException
└── frontend/                        React (Vite) dashboard
    └── src/
        ├── api.js                   All 11 API call functions
        ├── App.jsx                  Main dashboard — KPI row + 4 tabs
        └── components/
            ├── KpiCard.jsx          KPI metric card
            ├── ChartCard.jsx        BarChartCard, LineChartCard, PieChartCard
            └── DataTable.jsx        MUI sticky-header table
```

### How the .NET SsasClient works (backend-dotnet)

1. On first request, opens a single `AdomdConnection` to `Data Source=localhost;Initial Catalog=ExamMultidimensionnel` and keeps it open for the app lifetime
2. Commands are serialized through a `SemaphoreSlim(1,1)` (ADOMD connections aren't thread-safe)
3. If the connection drops (e.g. SSAS restart), `AdomdConnectionException` triggers a one-shot reconnect-and-retry
4. `ResultSetMapper` converts row-dicts into `ChartDataDto` / `TableDataDto`, same shape as the Java DTOs (camelCase JSON)
5. **No subprocess, no temp files, no assembly load per request** — typical query overhead ≈ 5–20 ms vs 1–3 s for the PS bridge

### How SsasBridge works (backend — Quarkus)

1. Java writes MDX query to a temp `.txt` file  
2. Java writes a PowerShell script to a temp `.ps1` file  
3. The PS script loads `Microsoft.AnalysisServices.AdomdClient` (GAC v15), opens a direct TCP connection to SSAS on `localhost:2383`, runs the MDX, reads results, emits JSON  
4. Java parses the JSON with Jackson into `List<Map<String,Object>>`  
5. `ResultSetMapper` converts the flat row-maps into `ChartDataDto` / `TableDataDto` / scalar values

---

## 5. Implementation status

### Backend (Quarkus, original)

| # | Task                                              | Status   | Notes                                             |
|---|---------------------------------------------------|----------|---------------------------------------------------|
| 1 | webApp folder + git init                          | ✅ Done  |                                                   |
| 2 | Quarkus project generation (pom.xml)              | ✅ Done  | No external repos needed                          |
| 3 | Layered package structure + DTOs + exceptions     | ✅ Done  |                                                   |
| 4 | SSAS bridge — SsasBridge + ResultSetMapper        | ✅ Done  | Replaced olap4j-xmla; uses ADOMD.NET via PS       |
| 5 | MDX builder layer                                 | ✅ Done  | MdxConstants, MdxQueryBuilder                    |
| 6 | Analytics endpoints (11 total)                    | ✅ Done  | Controller → Service → Repository → Bridge        |
| 7 | Backend compiles cleanly                          | ✅ Done  | `mvn package -DskipTests` passes                  |

### Backend (ASP.NET Core, added 2026-05-28 — runs on same port 8080)

| #  | Task                                             | Status   | Notes                                                                |
|----|--------------------------------------------------|----------|----------------------------------------------------------------------|
| B1 | backend-dotnet/ scaffold + csproj                | ✅ Done  | .NET 9, NuGet: Microsoft.AnalysisServices.AdomdClient.NetCore 19.84.1 |
| B2 | DTOs ported (camelCase JSON, same shape as Java) | ✅ Done  | ChartData/Kpi/Table/TimeFilter as C# records                         |
| B3 | MDX layer ported                                 | ✅ Done  | MdxConstants, MdxQueryBuilder, ResultSetMapper                       |
| B4 | Native ADOMD client (SsasClient)                 | ✅ Done  | Singleton AdomdConnection + SemaphoreSlim + reconnect-on-failure     |
| B5 | Analytics + Health controllers (same 11 routes)  | ✅ Done  | Same paths and query params as Quarkus version                       |
| B6 | Global exception handler + CORS + Swagger        | ✅ Done  | Same error envelope shape; CORS for 5173/3000                        |
| B7 | `dotnet build` passes                            | ✅ Done  | 0 warnings, 0 errors                                                 |

### Frontend

| # | Task                                              | Status   | Notes                                             |
|---|---------------------------------------------------|----------|---------------------------------------------------|
| 8 | Vite + MUI + Recharts + Axios scaffold            | ✅ Done  |                                                   |
| 9 | KpiCard, BarChartCard, LineChartCard, PieChartCard| ✅ Done  |                                                   |
| 10| DataTable component                               | ✅ Done  |                                                   |
| 11| Main App dashboard — 4 tabs                       | ✅ Done  | Sales / Time Trends / Tax & Finance / Top N       |
| 12| Frontend builds cleanly                           | ✅ Done  | `npm run build` passes (chunk-size warn is OK)    |
| 13| End-to-end tested with real cube data             | ✅ Done  | All 11 endpoints return real data; dashboard live |

---

## 6. Known blockers / open issues

**None.** Previous issues #1 and #2 (olap4j-xmla + msmdpump) have been eliminated:

- **Issue #1 resolved**: Dropped olap4j entirely. ADOMD.NET v15 is already in the Windows GAC and connects directly to SSAS on TCP 2383.
- **Issue #2 resolved**: No msmdpump/IIS needed. ADOMD.NET uses direct TCP, not HTTP.

### Bugs fixed during integration testing (2026-05-26)

1. **`ResultSetMapper.toDouble` package-private** — made `public` so `AnalyticsRepository` could call it across packages.
2. **PowerShell 5.1 single-item array unwrapping** — `@($rows) | ConvertTo-Json` outputs `{}` (object) for single-row results. Fixed by using `ConvertTo-Json -InputObject @($rows)` instead of the pipe.
3. **ADOMD.NET column ordering** — ADOMD.NET puts measure columns **first** and the dimension-member column **last** (opposite of what was assumed). `ResultSetMapper` now identifies the label column by finding the first key that does not contain `[Measures]`. Also, SSAS emits an "All" aggregate row with a null member caption as the first row — these are now filtered out automatically.

---

## 7. To run the app

> **Only run ONE backend at a time** — both listen on port 8080. Stop one before starting the other.

### Backend A — Quarkus (dev mode)
```
cd backend
mvn quarkus:dev
```
→ http://localhost:8080 · Swagger: /swagger-ui · Health: /api/health

### Backend B — ASP.NET Core (recommended for smooth loading)
```
cd backend-dotnet
dotnet run
```
→ http://localhost:8080 · Swagger: /swagger-ui · Health: /api/health

### Frontend (Vite dev server)
```
cd frontend
npm run dev
```
→ Runs on http://localhost:5173 (no code change needed — both backends expose the same `/api/...` contract)

---

## 8. Decisions log

- **SSAS connectivity:** ADOMD.NET via PowerShell subprocess (direct TCP 2383). Replaced olap4j+msmdpump because ADOMD.NET v15 was already in the GAC and port 2383 was open. (Decided 2026-05-26.)
- **Java version:** 17 (Quarkus baseline), user has 18 installed → compatible.
- **Cube hierarchy name:** kept the `Calander` typo from the cube.
- **No SQL scripts rule:** still applies.
- **Frontend tabs:** Sales Analysis / Time Trends / Tax & Finance / Top N Rankings.
- **Second backend (ASP.NET Core) added 2026-05-28:** The PowerShell-subprocess bridge added ~1–3s of cold-start overhead per request. The new `backend-dotnet/` uses native ADOMD.NET in-process — a singleton `AdomdConnection` guarded by a semaphore — bringing per-query overhead down to ~5–20 ms. Both backends are kept (same 11 endpoints, same JSON contract) so they can be switched without touching the frontend.
