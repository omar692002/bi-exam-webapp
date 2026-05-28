using BiBackend.Dtos;
using BiBackend.Mdx;

namespace BiBackend.Repository;

public sealed class AnalyticsRepository
{
    private readonly SsasClient _ssas;
    private readonly ResultSetMapper _mapper;

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
            slicers.Add($"{MdxConstants.DATE_MONTH}.[{tf.Month}]");
        else if (tf.HasQuarter)
            slicers.Add($"{MdxConstants.DATE_QUARTER}.[{tf.Quarter}]");
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
