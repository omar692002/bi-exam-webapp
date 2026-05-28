namespace BiBackend.Dtos;

public sealed record TableDataDto(
    string Title,
    IReadOnlyList<string> Columns,
    IReadOnlyList<IReadOnlyList<object?>> Rows);
