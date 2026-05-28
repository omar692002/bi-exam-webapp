namespace BiBackend.Config;

public sealed class SsasOptions
{
    public const string SectionName = "Ssas";

    public string DataSource { get; set; } = "localhost";
    public string Catalog { get; set; } = "ExamMultidimensionnel";
    public string Cube { get; set; } = "VDS";
}
