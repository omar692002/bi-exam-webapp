package com.bi.exam.mdx;

import com.bi.exam.dto.ChartDataDto;
import com.bi.exam.dto.ChartSeriesDto;
import com.bi.exam.dto.TableDataDto;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Converts the flat row-map results returned by {@link SsasBridge} into
 * chart-ready or table-ready DTOs.
 *
 * <p>ADOMD.NET returns measure columns first and the dimension-member column
 * last (e.g. {@code [Measures].[Revenue], ..., [Dim Product].[...][MEMBER_CAPTION]}).
 * This mapper identifies the label column as the first column whose key does NOT
 * contain {@code [Measures]}, and treats everything else as measure columns.</p>
 *
 * <p>Rows whose label value is {@code null} (the implicit "All" member that SSAS
 * includes as the first row) are skipped automatically.</p>
 */
@ApplicationScoped
public class ResultSetMapper {

    public ChartDataDto toChart(List<Map<String, Object>> rows, String title) {
        List<Map<String, Object>> filtered = skipNullLabels(rows);
        if (filtered.isEmpty()) return new ChartDataDto(title, List.of(), List.of());

        String labelKey = findLabelKey(filtered.get(0));
        List<String> measureKeys = findMeasureKeys(filtered.get(0), labelKey);

        List<String> labels = filtered.stream()
                .map(r -> formatLabel(r.get(labelKey)))
                .toList();

        List<ChartSeriesDto> series = new ArrayList<>();
        for (String mk : measureKeys) {
            List<Double> values = filtered.stream()
                    .map(r -> toDouble(r.get(mk)))
                    .toList();
            series.add(new ChartSeriesDto(prettyName(mk), values));
        }
        return new ChartDataDto(title, labels, series);
    }

    public TableDataDto toTable(List<Map<String, Object>> rows, String title, String rowHeader) {
        List<Map<String, Object>> filtered = skipNullLabels(rows);
        if (filtered.isEmpty()) return new TableDataDto(title, List.of(), List.of());

        String labelKey = findLabelKey(filtered.get(0));
        List<String> measureKeys = findMeasureKeys(filtered.get(0), labelKey);

        List<String> headers = new ArrayList<>();
        headers.add(rowHeader != null ? rowHeader : prettyName(labelKey));
        measureKeys.forEach(k -> headers.add(prettyName(k)));

        List<List<Object>> data = new ArrayList<>();
        for (Map<String, Object> row : filtered) {
            List<Object> r = new ArrayList<>();
            r.add(formatLabel(row.get(labelKey)));
            for (String mk : measureKeys) {
                r.add(toDouble(row.get(mk)));
            }
            data.add(r);
        }
        return new TableDataDto(title, headers, data);
    }

    /** Skip "All" aggregate rows that SSAS emits with a null member caption. */
    private List<Map<String, Object>> skipNullLabels(List<Map<String, Object>> rows) {
        if (rows.isEmpty()) return rows;
        String labelKey = findLabelKey(rows.get(0));
        return rows.stream()
                .filter(r -> r.get(labelKey) != null)
                .collect(Collectors.toList());
    }

    /**
     * The label column is the first column whose key does NOT contain "[Measures]".
     * ADOMD.NET places measures first; the dimension member comes last.
     */
    private String findLabelKey(Map<String, Object> row) {
        for (String key : row.keySet()) {
            if (!key.contains("[Measures]")) return key;
        }
        return row.keySet().iterator().next();
    }

    private List<String> findMeasureKeys(Map<String, Object> row, String labelKey) {
        return row.keySet().stream()
                .filter(k -> !k.equals(labelKey))
                .collect(Collectors.toList());
    }

    private String formatLabel(Object v) {
        return v == null ? "" : String.valueOf(v);
    }

    public double toDouble(Object v) {
        if (v == null) return 0d;
        if (v instanceof Number n) return n.doubleValue();
        try { return Double.parseDouble(String.valueOf(v)); }
        catch (NumberFormatException e) { return 0d; }
    }

    /** Strip MDX bracket path — e.g. "[Measures].[Revenue]" → "Revenue". */
    String prettyName(String raw) {
        if (raw == null) return "";
        if (raw.contains("[") && raw.contains("]")) {
            int last = raw.lastIndexOf('[');
            int end = raw.lastIndexOf(']');
            if (end > last) return raw.substring(last + 1, end);
        }
        return raw;
    }
}