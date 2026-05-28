using BiBackend.Config;
using BiBackend.Exceptions;
using Microsoft.AnalysisServices.AdomdClient;
using Microsoft.Extensions.Options;

namespace BiBackend.Mdx;

/// <summary>
/// Native ADOMD.NET client: keeps a single long-lived connection to SSAS and
/// serializes commands via a semaphore. Replaces the PowerShell subprocess
/// bridge — no process spawn, no assembly load, no temp files per request.
/// </summary>
public sealed class SsasClient : IAsyncDisposable, IDisposable
{
    private readonly ILogger<SsasClient> _log;
    private readonly SsasOptions _opts;
    private readonly SemaphoreSlim _gate = new(1, 1);
    private AdomdConnection? _connection;

    public SsasClient(IOptions<SsasOptions> opts, ILogger<SsasClient> log)
    {
        _opts = opts.Value;
        _log = log;
    }

    private string ConnectionString =>
        $"Data Source={_opts.DataSource};Initial Catalog={_opts.Catalog}";

    public string DataSource => _opts.DataSource;
    public string Catalog => _opts.Catalog;
    public string Cube => _opts.Cube;

    private AdomdConnection EnsureOpen()
    {
        if (_connection is { State: System.Data.ConnectionState.Open })
            return _connection;

        try { _connection?.Dispose(); } catch { /* ignore */ }
        _connection = new AdomdConnection(ConnectionString);
        _connection.Open();
        _log.LogInformation("Opened ADOMD connection to {DS}/{Catalog}", _opts.DataSource, _opts.Catalog);
        return _connection;
    }

    public List<Dictionary<string, object?>> Execute(string mdx)
    {
        if (string.IsNullOrWhiteSpace(mdx))
            throw new ArgumentException("MDX must not be blank", nameof(mdx));

        _gate.Wait();
        var sw = System.Diagnostics.Stopwatch.StartNew();
        try
        {
            var conn = EnsureOpen();
            using var cmd = conn.CreateCommand();
            cmd.CommandText = mdx;

            List<Dictionary<string, object?>> rows;
            try
            {
                rows = ReadAll(cmd);
            }
            catch (AdomdConnectionException)
            {
                // Stale connection — reopen once and retry.
                _log.LogWarning("ADOMD connection stale, reconnecting...");
                try { _connection?.Dispose(); } catch { }
                _connection = null;
                var conn2 = EnsureOpen();
                using var cmd2 = conn2.CreateCommand();
                cmd2.CommandText = mdx;
                rows = ReadAll(cmd2);
            }

            _log.LogDebug("MDX OK in {Ms} ms, {Rows} rows", sw.ElapsedMilliseconds, rows.Count);
            return rows;
        }
        catch (MdxExecutionException) { throw; }
        catch (Exception ex)
        {
            _log.LogError(ex, "MDX execution failed");
            throw new MdxExecutionException("SSAS query failed: " + ex.Message, mdx, ex);
        }
        finally
        {
            _gate.Release();
        }
    }

    private static List<Dictionary<string, object?>> ReadAll(AdomdCommand cmd)
    {
        using var reader = cmd.ExecuteReader();
        var fc = reader.FieldCount;
        var cols = new string[fc];
        for (var i = 0; i < fc; i++) cols[i] = reader.GetName(i);

        var rows = new List<Dictionary<string, object?>>();
        while (reader.Read())
        {
            var row = new Dictionary<string, object?>(fc, StringComparer.Ordinal);
            for (var i = 0; i < fc; i++)
            {
                var v = reader.GetValue(i);
                row[cols[i]] = v is DBNull ? null : v;
            }
            rows.Add(row);
        }
        return rows;
    }

    public void Dispose()
    {
        try { _connection?.Dispose(); } catch { }
        _gate.Dispose();
    }

    public ValueTask DisposeAsync()
    {
        Dispose();
        return ValueTask.CompletedTask;
    }
}
