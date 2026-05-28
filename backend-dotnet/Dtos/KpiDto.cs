namespace BiBackend.Dtos;

public sealed record KpiDto(string Label, double Value, string Unit);

public sealed record KpiSummaryDto(IReadOnlyList<KpiDto> Kpis);
