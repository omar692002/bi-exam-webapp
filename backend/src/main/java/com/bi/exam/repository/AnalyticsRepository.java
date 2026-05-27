package com.bi.exam.repository;

import com.bi.exam.dto.ChartDataDto;
import com.bi.exam.dto.TableDataDto;
import com.bi.exam.dto.TimeFilter;
import com.bi.exam.mdx.MdxConstants;
import com.bi.exam.mdx.MdxQueryBuilder;
import com.bi.exam.mdx.ResultSetMapper;
import com.bi.exam.mdx.SsasBridge;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@ApplicationScoped
public class AnalyticsRepository {

    @Inject SsasBridge bridge;
    @Inject ResultSetMapper mapper;

    /** Scalar measure with optional time slicer (for KPI cards). */
    public double scalarMeasure(String measure, TimeFilter tf) {
        StringBuilder sb = new StringBuilder();
        sb.append("SELECT {").append(measure).append("} ON COLUMNS FROM ").append(MdxConstants.CUBE);
        if (!tf.isEmpty()) {
            List<String> slicers = buildSlicers(tf);
            sb.append(" WHERE (").append(String.join(", ", slicers)).append(")");
        }
        List<Map<String, Object>> rows = bridge.execute(sb.toString());
        if (rows.isEmpty()) return 0d;
        return mapper.toDouble(rows.get(0).values().iterator().next());
    }

    /** Generic chart query with optional time slicer. */
    public ChartDataDto chart(String title, String rowDimension, TimeFilter tf, String... measures) {
        MdxQueryBuilder builder = MdxQueryBuilder.create()
                .measure(measures)
                .rows(rowDimension);
        applyFilters(builder, tf);
        return mapper.toChart(bridge.execute(builder.build()), title);
    }

    /** Sorted (desc) chart with optional time slicer. */
    public ChartDataDto ranked(String title, String rowDimension, TimeFilter tf,
                               String orderMeasure, String... measures) {
        String[] all = ensureContains(measures, orderMeasure);
        MdxQueryBuilder builder = MdxQueryBuilder.create()
                .measure(all)
                .rows(rowDimension)
                .orderBy(orderMeasure, MdxQueryBuilder.Direction.BDESC);
        applyFilters(builder, tf);
        return mapper.toChart(bridge.execute(builder.build()), title);
    }

    /** Top-N table with optional time slicer. */
    public TableDataDto topN(String title, String rowHeader, String rowDimension,
                             int n, TimeFilter tf, String orderMeasure, String... measures) {
        String[] all = ensureContains(measures, orderMeasure);
        MdxQueryBuilder builder = MdxQueryBuilder.create()
                .measure(all)
                .rows(rowDimension)
                .top(n, orderMeasure);
        applyFilters(builder, tf);
        return mapper.toTable(bridge.execute(builder.build()), title, rowHeader);
    }

    // ------------------------------------------------------------------

    private void applyFilters(MdxQueryBuilder builder, TimeFilter tf) {
        buildSlicers(tf).forEach(builder::filter);
    }

    private List<String> buildSlicers(TimeFilter tf) {
        List<String> slicers = new ArrayList<>();
        if (tf.hasYear())
            slicers.add(MdxConstants.DATE_YEAR + ".[" + tf.year() + "]");
        // Month is more granular than quarter — use only one to avoid contradictory tuples
        // (e.g. quarter=Q2 + month=March is impossible since March is in Q1).
        if (tf.hasMonth())
            slicers.add(MdxConstants.DATE_MONTH + ".[" + tf.month() + "]");
        else if (tf.hasQuarter())
            slicers.add(MdxConstants.DATE_QUARTER + ".[" + tf.quarter() + "]");
        return slicers;
    }

    private String[] ensureContains(String[] measures, String required) {
        for (String m : measures) if (m.equals(required)) return measures;
        String[] out = new String[measures.length + 1];
        out[0] = required;
        System.arraycopy(measures, 0, out, 1, measures.length);
        return out;
    }
}
