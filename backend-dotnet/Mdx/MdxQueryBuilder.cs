using System.Text;

namespace BiBackend.Mdx;

public sealed class MdxQueryBuilder
{
    public enum Direction { ASC, DESC, BASC, BDESC }

    private readonly HashSet<string> _measures = new();
    private string? _rowDimension;
    private readonly List<string> _filters = new();
    private string? _orderByMeasure;
    private Direction _orderDirection = Direction.DESC;
    private int? _topN;
    private bool _nonEmpty = true;
    private string _cube = MdxConstants.CUBE;

    public static MdxQueryBuilder Create() => new();

    public MdxQueryBuilder Cube(string cube) { _cube = cube; return this; }

    public MdxQueryBuilder Measure(params string[] measureMembers)
    {
        foreach (var m in measureMembers) _measures.Add(m);
        return this;
    }

    public MdxQueryBuilder Rows(string dimensionMember)
    {
        _rowDimension = dimensionMember;
        return this;
    }

    public MdxQueryBuilder Filter(string? member)
    {
        if (!string.IsNullOrWhiteSpace(member)) _filters.Add(member!);
        return this;
    }

    public MdxQueryBuilder OrderBy(string measure, Direction direction)
    {
        _orderByMeasure = measure;
        _orderDirection = direction;
        return this;
    }

    public MdxQueryBuilder Top(int n, string measure)
    {
        _topN = n;
        _orderByMeasure = measure;
        return this;
    }

    public MdxQueryBuilder NonEmpty(bool nonEmpty) { _nonEmpty = nonEmpty; return this; }

    public string Build()
    {
        if (_measures.Count == 0)
            throw new InvalidOperationException("At least one measure must be set.");
        if (_rowDimension is null)
            throw new InvalidOperationException("Row dimension must be set via Rows(...).");

        var sb = new StringBuilder();
        sb.Append("SELECT ");
        if (_nonEmpty) sb.Append("NON EMPTY ");
        sb.Append('{').Append(string.Join(", ", _measures)).Append("} ON COLUMNS, ");

        if (_nonEmpty) sb.Append("NON EMPTY ");
        sb.Append(BuildRowsExpression()).Append(" ON ROWS ");
        sb.Append("FROM ").Append(_cube);

        if (_filters.Count > 0)
            sb.Append(" WHERE (").Append(string.Join(", ", _filters)).Append(')');

        return sb.ToString();
    }

    private string BuildRowsExpression()
    {
        var members = _rowDimension + ".Members";
        if (_topN.HasValue && _orderByMeasure is not null)
            return $"TopCount({members}, {_topN}, {_orderByMeasure})";
        if (_orderByMeasure is not null)
            return $"Order({members}, {_orderByMeasure}, {_orderDirection})";
        return members;
    }
}
