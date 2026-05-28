namespace BiBackend.Dtos;

public sealed record TimeFilter(string Year, string Quarter, string Month)
{
    public static TimeFilter Of(string? year, string? quarter, string? month)
        => new(Blank(year), Blank(quarter), Blank(month));

    public bool HasYear    => !string.IsNullOrWhiteSpace(Year);
    public bool HasQuarter => !string.IsNullOrWhiteSpace(Quarter);
    public bool HasMonth   => !string.IsNullOrWhiteSpace(Month);
    public bool IsEmpty    => !HasYear && !HasQuarter && !HasMonth;

    private static string Blank(string? s) => s is null ? string.Empty : s.Trim();
}
