using BiBackend.Dtos;

namespace BiBackend.Mdx;

/// <summary>
/// Converts ADOMD row-maps into chart/table DTOs.
///
/// ADOMD.NET puts measure columns first and the dimension-member column LAST.
/// Label column = first key that does NOT contain "[Measures]".
/// SSAS emits an implicit "All" row with a null member caption — filtered out.
/// </summary>
public sealed class ResultSetMapper
{
    public ChartDataDto ToChart(IReadOnlyList<Dictionary<string, object?>> rows, string title)
    {
        var filtered = SkipNullLabels(rows);
        if (filtered.Count == 0) return new ChartDataDto(title, Array.Empty<string>(), Array.Empty<ChartSeriesDto>());

        var first = filtered[0];
        var labelKey = FindLabelKey(first);
        var measureKeys = FindMeasureKeys(first, labelKey);

        var labels = filtered.Select(r => FormatLabel(r[labelKey])).ToList();

        var series = new List<ChartSeriesDto>(measureKeys.Count);
        foreach (var mk in measureKeys)
        {
            var values = filtered.Select(r => ToDouble(r[mk])).ToList();
            series.Add(new ChartSeriesDto(PrettyName(mk), values));
        }
        return new ChartDataDto(title, labels, series);
    }

    public TableDataDto ToTable(IReadOnlyList<Dictionary<string, object?>> rows, string title, string rowHeader)
    {
        var filtered = SkipNullLabels(rows);
        if (filtered.Count == 0) return new TableDataDto(title, Array.Empty<string>(), Array.Empty<IReadOnlyList<object?>>());

        var first = filtered[0];
        var labelKey = FindLabelKey(first);
        var measureKeys = FindMeasureKeys(first, labelKey);

        var headers = new List<string>(measureKeys.Count + 1)
        {
            rowHeader ?? PrettyName(labelKey)
        };
        foreach (var k in measureKeys) headers.Add(PrettyName(k));

        var data = new List<IReadOnlyList<object?>>(filtered.Count);
        foreach (var row in filtered)
        {
            var r = new List<object?>(measureKeys.Count + 1) { FormatLabel(row[labelKey]) };
            foreach (var mk in measureKeys) r.Add(ToDouble(row[mk]));
            data.Add(r);
        }
        return new TableDataDto(title, headers, data);
    }

    /// <summary>
    /// Pivots a flat CrossJoin rowset (rowDim × colDim with one measure) into a matrix.
    /// The two non-measure columns are told apart by substring (<paramref name="rowToken"/>
    /// vs <paramref name="colToken"/>, e.g. "Category Name" vs "Quarter").
    /// </summary>
    public MatrixDataDto ToMatrix(IReadOnlyList<Dictionary<string, object?>> rows,
                                  string rowToken, string colToken, string title, string rowHeader)
    {
        if (rows.Count == 0)
            return new MatrixDataDto(title, rowHeader, Array.Empty<string>(), Array.Empty<MatrixRowDto>());

        var keys = rows[0].Keys;
        var rowKey = keys.FirstOrDefault(k => !k.Contains("[Measures]") && k.Contains(rowToken));
        var colKey = keys.FirstOrDefault(k => !k.Contains("[Measures]") && k.Contains(colToken));
        var measKey = keys.FirstOrDefault(k => k.Contains("[Measures]"));
        if (rowKey is null || colKey is null || measKey is null)
            return new MatrixDataDto(title, rowHeader, Array.Empty<string>(), Array.Empty<MatrixRowDto>());

        var valid = rows.Where(r => r[rowKey] is not null && r[colKey] is not null).ToList();

        var colLabels = new List<string>();
        var rowLabels = new List<string>();
        var cells = new Dictionary<(string, string), double>();
        foreach (var r in valid)
        {
            var rl = FormatLabel(r[rowKey]);
            var cl = FormatLabel(r[colKey]);
            if (!rowLabels.Contains(rl)) rowLabels.Add(rl);
            if (!colLabels.Contains(cl)) colLabels.Add(cl);
            cells[(rl, cl)] = ToDouble(r[measKey]);
        }
        colLabels.Sort(StringComparer.OrdinalIgnoreCase);

        var matrixRows = rowLabels
            .Select(rl => new MatrixRowDto(rl,
                colLabels.Select(cl => cells.TryGetValue((rl, cl), out var v) ? v : 0d).ToList()))
            .ToList();
        return new MatrixDataDto(title, rowHeader, colLabels, matrixRows);
    }

    private static List<Dictionary<string, object?>> SkipNullLabels(IReadOnlyList<Dictionary<string, object?>> rows)
    {
        if (rows.Count == 0) return new List<Dictionary<string, object?>>();
        var labelKey = FindLabelKey(rows[0]);
        // Drop the implicit "All" aggregate row (null caption) and any blank-captioned member.
        return rows.Where(r => !string.IsNullOrWhiteSpace(r[labelKey]?.ToString())).ToList();
    }

    private static string FindLabelKey(Dictionary<string, object?> row)
    {
        foreach (var key in row.Keys)
            if (!key.Contains("[Measures]")) return key;
        return row.Keys.First();
    }

    private static List<string> FindMeasureKeys(Dictionary<string, object?> row, string labelKey)
        => row.Keys.Where(k => !string.Equals(k, labelKey, StringComparison.Ordinal)).ToList();

    private static string FormatLabel(object? v) => v?.ToString() ?? string.Empty;

    public double ToDouble(object? v)
    {
        if (v is null) return 0d;
        if (v is double d) return d;
        if (v is float f) return f;
        if (v is decimal dec) return (double)dec;
        if (v is int i) return i;
        if (v is long l) return l;
        if (v is short s) return s;
        if (v is byte b) return b;
        if (v is IConvertible c) { try { return c.ToDouble(System.Globalization.CultureInfo.InvariantCulture); } catch { } }
        return double.TryParse(v.ToString(), System.Globalization.NumberStyles.Any,
                               System.Globalization.CultureInfo.InvariantCulture, out var parsed) ? parsed : 0d;
    }

    private static string PrettyName(string? raw)
    {
        if (string.IsNullOrEmpty(raw)) return string.Empty;
        if (raw.Contains('[') && raw.Contains(']'))
        {
            var last = raw.LastIndexOf('[');
            var end = raw.LastIndexOf(']');
            if (end > last) return raw.Substring(last + 1, end - last - 1);
        }
        return raw;
    }
}
