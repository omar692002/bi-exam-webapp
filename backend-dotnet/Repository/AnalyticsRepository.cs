using BiBackend.Dtos;
using BiBackend.Mdx;

namespace BiBackend.Repository;

public sealed class AnalyticsRepository
{
    private readonly SsasClient _ssas;
    private readonly ResultSetMapper _mapper;

    // SSAS month attribute uses integer keys 1–12; English names sent from the UI must be mapped.
    private static readonly Dictionary<string, int> MonthKeys = new(StringComparer.OrdinalIgnoreCase)
    {
        ["January"]=1,  ["February"]=2,  ["March"]=3,
        ["April"]=4,    ["May"]=5,       ["June"]=6,
        ["July"]=7,     ["August"]=8,    ["September"]=9,
        ["October"]=10, ["November"]=11, ["December"]=12,
    };

    // SSAS quarter attribute uses integer keys 1–4; "Q1"–"Q4" sent from the UI must be mapped.
    private static readonly Dictionary<string, int> QuarterKeys = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Q1"]=1, ["Q2"]=2, ["Q3"]=3, ["Q4"]=4,
    };

    public AnalyticsRepository(SsasClient ssas, ResultSetMapper mapper)
    {
        _ssas = ssas;
        _mapper = mapper;
    }

    public double ScalarMeasure(string measure, TimeFilter tf)
    {
        var sb = new System.Text.StringBuilder();
        sb.Append("SELECT {").Append(measure).Append("} ON COLUMNS FROM ").Append(MdxConstants.CUBE);
        if (!tf.IsEmpty)
        {
            var slicers = BuildSlicers(tf);
            if (slicers.Count > 0)
                sb.Append(" WHERE (").Append(string.Join(", ", slicers)).Append(')');
        }
        var rows = _ssas.Execute(sb.ToString());
        if (rows.Count == 0) return 0d;
        return _mapper.ToDouble(rows[0].Values.First());
    }

    public ChartDataDto Chart(string title, string rowDimension, TimeFilter tf, params string[] measures)
    {
        var builder = MdxQueryBuilder.Create()
            .Measure(measures)
            .Rows(rowDimension);
        ApplyFilters(builder, tf);
        return _mapper.ToChart(_ssas.Execute(builder.Build()), title);
    }

    public ChartDataDto Ranked(string title, string rowDimension, TimeFilter tf,
                               string orderMeasure, params string[] measures)
    {
        var all = EnsureContains(measures, orderMeasure);
        var builder = MdxQueryBuilder.Create()
            .Measure(all)
            .Rows(rowDimension)
            .OrderBy(orderMeasure, MdxQueryBuilder.Direction.BDESC);
        ApplyFilters(builder, tf);
        return _mapper.ToChart(_ssas.Execute(builder.Build()), title);
    }

    public TableDataDto TopN(string title, string rowHeader, string rowDimension,
                             int n, TimeFilter tf, string orderMeasure, params string[] measures)
    {
        var all = EnsureContains(measures, orderMeasure);
        var builder = MdxQueryBuilder.Create()
            .Measure(all)
            .Rows(rowDimension)
            .Top(n, orderMeasure);
        ApplyFilters(builder, tf);
        return _mapper.ToTable(_ssas.Execute(builder.Build()), title, rowHeader);
    }

    /// <summary>Returns the distinct year member names available in the cube.</summary>
    public IReadOnlyList<string> YearList()
    {
        var mdx = $"SELECT NON EMPTY {{{MdxConstants.M_REVENUE}}} ON COLUMNS, " +
                  $"NON EMPTY {MdxConstants.DATE_YEAR}.Members ON ROWS FROM {MdxConstants.CUBE}";
        var rows = _ssas.Execute(mdx);
        if (rows.Count == 0) return Array.Empty<string>();
        var labelKey = rows[0].Keys.FirstOrDefault(k => !k.Contains("[Measures]"));
        if (labelKey is null) return Array.Empty<string>();
        return rows
            .Select(r => r[labelKey]?.ToString() ?? "")
            .Where(s => !string.IsNullOrEmpty(s))
            .ToList();
    }

    private void ApplyFilters(MdxQueryBuilder builder, TimeFilter tf)
    {
        foreach (var s in BuildSlicers(tf)) builder.Filter(s);
    }

    private static List<string> BuildSlicers(TimeFilter tf)
    {
        var slicers = new List<string>();
        if (tf.HasYear)
            slicers.Add($"{MdxConstants.DATE_YEAR}.[{tf.Year}]");

        if (tf.HasMonth)
        {
            // Use key-based (&[n]) access — more reliable than name-based when the SSAS
            // month attribute stores integer keys (1–12) with localized member names.
            if (MonthKeys.TryGetValue(tf.Month, out var mKey))
                slicers.Add($"{MdxConstants.DATE_MONTH}.&[{mKey}]");
            else
                slicers.Add($"{MdxConstants.DATE_MONTH}.[{tf.Month}]");
        }
        else if (tf.HasQuarter)
        {
            // Same key-based approach for quarters (keys 1–4).
            if (QuarterKeys.TryGetValue(tf.Quarter, out var qKey))
                slicers.Add($"{MdxConstants.DATE_QUARTER}.&[{qKey}]");
            else
                slicers.Add($"{MdxConstants.DATE_QUARTER}.[{tf.Quarter}]");
        }

        return slicers;
    }

    private static string[] EnsureContains(string[] measures, string required)
    {
        foreach (var m in measures) if (m == required) return measures;
        var outArr = new string[measures.Length + 1];
        outArr[0] = required;
        Array.Copy(measures, 0, outArr, 1, measures.Length);
        return outArr;
    }
}
