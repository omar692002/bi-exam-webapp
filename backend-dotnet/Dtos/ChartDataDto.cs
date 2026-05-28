namespace BiBackend.Dtos;

public sealed record ChartSeriesDto(string Name, IReadOnlyList<double> Data);

public sealed record ChartDataDto(
    string Title,
    IReadOnlyList<string> Labels,
    IReadOnlyList<ChartSeriesDto> Series);
