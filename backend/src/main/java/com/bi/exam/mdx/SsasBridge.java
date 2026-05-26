package com.bi.exam.mdx;

import com.bi.exam.config.SsasProperties;
import com.bi.exam.exception.MdxExecutionException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

/**
 * Executes MDX queries against SSAS via a PowerShell/ADOMD.NET subprocess.
 *
 * <p>Bypasses both the olap4j-xmla driver (unavailable on Maven Central) and
 * msmdpump/IIS by using the ADOMD.NET client (GAC v15) which connects directly
 * to SSAS on TCP port 2383.  Each call spawns a short-lived PowerShell process,
 * writes the MDX to a temp file (to avoid quoting issues), and parses the
 * JSON output back into a list of row maps.</p>
 */
@ApplicationScoped
public class SsasBridge {

    private static final Logger LOG = Logger.getLogger(SsasBridge.class);

    private static final String ADOMD_ASM =
            "Microsoft.AnalysisServices.AdomdClient, Version=15.0.0.0, " +
            "Culture=neutral, PublicKeyToken=89845dcd8080cc91";

    private static final String PS_TEMPLATE =
            "$ErrorActionPreference = 'Stop'\n" +
            "Add-Type -AssemblyName '" + ADOMD_ASM + "'\n" +
            "$mdx = [System.IO.File]::ReadAllText('{{MDX_FILE}}', [System.Text.Encoding]::UTF8)\n" +
            "$conn = New-Object Microsoft.AnalysisServices.AdomdClient.AdomdConnection(" +
            "'Data Source={{DATA_SOURCE}};Initial Catalog={{CATALOG}}')\n" +
            "$conn.Open()\n" +
            "try {\n" +
            "    $cmd = $conn.CreateCommand()\n" +
            "    $cmd.CommandText = $mdx\n" +
            "    $reader = $cmd.ExecuteReader()\n" +
            "    try {\n" +
            "        $fc = $reader.FieldCount\n" +
            "        $cols = @()\n" +
            "        for ($i = 0; $i -lt $fc; $i++) { $cols += $reader.GetName($i) }\n" +
            "        $rows = [System.Collections.Generic.List[hashtable]]::new()\n" +
            "        while ($reader.Read()) {\n" +
            "            $row = [ordered]@{}\n" +
            "            for ($i = 0; $i -lt $fc; $i++) {\n" +
            "                $v = $reader.GetValue($i)\n" +
            "                if ($null -eq $v -or $v -is [System.DBNull]) { $row[$cols[$i]] = $null }\n" +
            "                else { $row[$cols[$i]] = $v }\n" +
            "            }\n" +
            "            $rows.Add($row)\n" +
            "        }\n" +
            "    } finally { $reader.Close() }\n" +
            "} finally { $conn.Close() }\n" +
            "ConvertTo-Json -InputObject @($rows) -Depth 3 -Compress\n";

    @Inject
    SsasProperties props;

    private final ObjectMapper json = new ObjectMapper();

    /**
     * Execute an MDX statement and return its result as a list of row maps.
     * Each map key is the raw column name from ADOMD.NET; values are Java
     * primitives (Double, Long, String, null).
     */
    public List<Map<String, Object>> execute(String mdx) {
        if (mdx == null || mdx.isBlank()) {
            throw new IllegalArgumentException("MDX must not be blank");
        }
        LOG.debugf("Executing MDX via ADOMD.NET bridge:%n%s", mdx);
        long t0 = System.currentTimeMillis();

        Path mdxFile = null;
        Path scriptFile = null;
        try {
            mdxFile = Files.createTempFile("ssas_mdx_", ".txt");
            Files.writeString(mdxFile, mdx, StandardCharsets.UTF_8);

            String script = PS_TEMPLATE
                    .replace("{{MDX_FILE}}", mdxFile.toString())
                    .replace("{{DATA_SOURCE}}", props.dataSource())
                    .replace("{{CATALOG}}", props.catalog());

            scriptFile = Files.createTempFile("ssas_ps_", ".ps1");
            Files.writeString(scriptFile, script, StandardCharsets.UTF_8);

            List<Map<String, Object>> result = runScript(scriptFile, mdx);
            LOG.debugf("MDX bridge OK in %d ms, %d rows", System.currentTimeMillis() - t0, result.size());
            return result;

        } catch (IOException e) {
            throw new MdxExecutionException("Failed to prepare SSAS bridge files: " + e.getMessage(), mdx, e);
        } finally {
            silentDelete(mdxFile);
            silentDelete(scriptFile);
        }
    }

    private List<Map<String, Object>> runScript(Path scriptFile, String mdx) {
        try {
            ProcessBuilder pb = new ProcessBuilder(
                    "powershell.exe", "-NoProfile", "-NonInteractive",
                    "-ExecutionPolicy", "Bypass",
                    "-File", scriptFile.toString()
            );
            pb.redirectErrorStream(false);
            Process proc = pb.start();

            String stdout = new String(proc.getInputStream().readAllBytes(), StandardCharsets.UTF_8).trim();
            String stderr = new String(proc.getErrorStream().readAllBytes(), StandardCharsets.UTF_8).trim();
            int exit;
            try {
                exit = proc.waitFor();
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                throw new MdxExecutionException("SSAS bridge interrupted", mdx, ie);
            }

            if (exit != 0) {
                throw new MdxExecutionException(
                        "SSAS PowerShell bridge failed (exit " + exit + "): " + stderr, mdx, null);
            }
            if (stderr != null && !stderr.isBlank()) {
                LOG.warnf("SSAS bridge stderr: %s", stderr);
            }
            if (stdout.isEmpty() || stdout.equals("null") || stdout.equals("[]")) {
                return List.of();
            }
            return json.readValue(stdout, new TypeReference<List<Map<String, Object>>>() {});

        } catch (IOException e) {
            throw new MdxExecutionException("SSAS bridge I/O error: " + e.getMessage(), mdx, e);
        }
    }

    private void silentDelete(Path p) {
        if (p != null) {
            try { Files.deleteIfExists(p); } catch (IOException ignored) { }
        }
    }
}
