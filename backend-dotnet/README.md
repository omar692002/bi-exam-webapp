# Backend B — ASP.NET Core (BiBackend)

Low-latency REST API for the BI dashboard. Drop-in replacement for `../backend/` (Quarkus) — same 11 endpoints, same JSON shape, same port (8080).

## Why this exists

The Quarkus backend talks to SSAS through a PowerShell subprocess that loads ADOMD.NET on every request (~1–3 s of cold-start per call). This project uses the **native ADOMD.NET .NET client** in-process: one long-lived `AdomdConnection` opened at startup, commands serialized by a `SemaphoreSlim`, automatic reconnect on stale connections.

Typical per-query overhead drops from ~1–3 s to ~5–20 ms.

## Prerequisites

- **.NET 9 SDK** — https://dotnet.microsoft.com/download
- **SSAS** running locally on TCP 2383 with `ExamMultidimensionnel` deployed (same as the Quarkus backend)
- **Windows x64** (ADOMD.NET native dependencies; `RuntimeIdentifier=win-x64` in the csproj)

## Run

```powershell
dotnet run
```

Then:
- API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui
- Health probe: http://localhost:8080/api/health

> Stop the Quarkus backend first — both listen on 8080.

## Build

```powershell
dotnet build              # debug build
dotnet publish -c Release # release output in bin/Release/net9.0/win-x64/publish
```

## Layout

```
backend-dotnet/
├── BiBackend.csproj
├── Program.cs              DI, CORS, Swagger, global exception handler
├── appsettings.json        Ssas, CORS origins, Kestrel URL
├── Config/SsasOptions.cs
├── Controllers/
│   ├── AnalyticsController.cs   11 analytics endpoints
│   └── HealthController.cs      /api/health
├── Services/AnalyticsService.cs
├── Repository/AnalyticsRepository.cs
├── Mdx/
│   ├── MdxConstants.cs       cube identifiers (measures, dimensions)
│   ├── MdxQueryBuilder.cs    fluent SELECT NON EMPTY ... ON ROWS / TopCount / Order builder
│   ├── ResultSetMapper.cs    row-dicts → ChartDataDto / TableDataDto
│   └── SsasClient.cs         singleton AdomdConnection, semaphore, reconnect-on-failure
├── Dtos/
│   ├── ChartDataDto.cs       (also ChartSeriesDto)
│   ├── KpiDto.cs             (also KpiSummaryDto)
│   ├── TableDataDto.cs
│   └── TimeFilter.cs
└── Exceptions/MdxExecutionException.cs   (also BiException)
```

## Configuration (`appsettings.json`)

```json
{
  "Kestrel": { "Endpoints": { "Http": { "Url": "http://localhost:8080" } } },
  "Ssas": {
    "DataSource": "localhost",
    "Catalog": "ExamMultidimensionnel",
    "Cube": "VDS"
  },
  "Cors": { "Origins": [ "http://localhost:5173", "http://localhost:3000" ] }
}
```

Override per-environment in `appsettings.Development.json` or via environment variables (e.g. `Ssas__DataSource=10.0.0.5`).

## Endpoints

Identical to the Quarkus backend — see the root [README.md](../README.md#api-endpoints-identical-on-both-backends).

## How SSAS access works

1. `SsasClient` is registered as a **singleton**. On first request it opens an `AdomdConnection` (`Data Source=localhost;Initial Catalog=ExamMultidimensionnel`) and keeps it open.
2. All MDX commands go through `SsasClient.Execute(mdx)`, which acquires a `SemaphoreSlim(1,1)` (ADOMD connections are not thread-safe).
3. `AdomdCommand.ExecuteReader()` runs the MDX; rows are converted to `Dictionary<string, object?>`.
4. If the connection is detected stale (`AdomdConnectionException`), it's disposed and a one-shot reopen-and-retry happens.
5. `ResultSetMapper` converts row-dicts into `ChartDataDto` / `TableDataDto` — same logic as the Java mapper:
   - Label column = first key that does NOT contain `[Measures]` (ADOMD puts measures first, dimension member last).
   - Rows with a null label (SSAS's implicit "All" aggregate) are filtered out.

## NuGet packages

- `Microsoft.AnalysisServices.AdomdClient.NetCore.retail.amd64` 19.84.1 — official Microsoft client
- `Swashbuckle.AspNetCore` 6.8.1 — Swagger UI

## Error handling

`Program.cs` registers a global exception handler that converts:
- `MdxExecutionException` → HTTP 502 Bad Gateway
- `BiException` / `ArgumentException` → HTTP 400 Bad Request
- anything else → HTTP 500

Response body shape:
```json
{
  "timestamp": "2026-05-28T10:15:23.123Z",
  "status": 502,
  "error": "Bad Gateway",
  "message": "SSAS query failed: ...",
  "type": "MdxExecutionException"
}
```
