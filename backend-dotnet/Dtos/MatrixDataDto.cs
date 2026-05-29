namespace BiBackend.Dtos;

public sealed record MatrixRowDto(string Label, IReadOnlyList<double> Values);

/// <summary>
/// Cross-tab / heatmap payload: one measure pivoted across two dimensions.
/// <see cref="ColumnLabels"/> are the column-dimension members; each
/// <see cref="MatrixRowDto"/> holds one row-dimension member and its value per column.
/// </summary>
public sealed record MatrixDataDto(
    string Title,
    string RowHeader,
    IReadOnlyList<string> ColumnLabels,
    IReadOnlyList<MatrixRowDto> Rows);
