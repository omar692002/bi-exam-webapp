namespace BiBackend.Dtos;

public sealed record KpiDto(
    string Label,
    double Value,
    string Unit,
    double? PreviousValue = null,
    double? DeltaPct = null);

public sealed record KpiSummaryDto(IReadOnlyList<KpiDto> Kpis);
