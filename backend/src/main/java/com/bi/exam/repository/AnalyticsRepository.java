package com.bi.exam.repository;

import com.bi.exam.dto.ChartDataDto;
import com.bi.exam.dto.TableDataDto;
import com.bi.exam.mdx.MdxConstants;
import com.bi.exam.mdx.MdxQueryBuilder;
import com.bi.exam.mdx.ResultSetMapper;
import com.bi.exam.mdx.SsasBridge;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.Map;

/**
 * Data-access façade for analytics queries.
 * Builds MDX with {@link MdxQueryBuilder}, runs it via {@link SsasBridge},
 * and shapes results into chart-/table-ready DTOs through {@link ResultSetMapper}.
 */
@ApplicationScoped
public class AnalyticsRepository {

    @Inject SsasBridge bridge;
    @Inject ResultSetMapper mapper;

    /** Aggregate value of a single measure across the whole cube (KPI card). */
    public double scalarMeasure(String measure) {
        String mdx = "SELECT {" + measure + "} ON COLUMNS FROM " + MdxConstants.CUBE;
        List<Map<String, Object>> rows = bridge.execute(mdx);
        if (rows.isEmpty()) return 0d;
        Object v = rows.get(0).values().iterator().next();
        return mapper.toDouble(v);
    }

    /** Generic chart query: one row dimension, one or more measures. */
    public ChartDataDto chart(String title, String rowDimension, String... measures) {
        String mdx = MdxQueryBuilder.create()
                .measure(measures)
                .rows(rowDimension)
                .build();
        return mapper.toChart(bridge.execute(mdx), title);
    }

    /** Top-N table sorted by the supplied measure (descending). */
    public TableDataDto topN(String title, String rowHeader, String rowDimension,
                             int n, String orderMeasure, String... measures) {
        String[] all = ensureContains(measures, orderMeasure);
        String mdx = MdxQueryBuilder.create()
                .measure(all)
                .rows(rowDimension)
                .top(n, orderMeasure)
                .build();
        return mapper.toTable(bridge.execute(mdx), title, rowHeader);
    }

    /** Sorted chart (descending) by the supplied measure. */
    public ChartDataDto ranked(String title, String rowDimension,
                               String orderMeasure, String... measures) {
        String[] all = ensureContains(measures, orderMeasure);
        String mdx = MdxQueryBuilder.create()
                .measure(all)
                .rows(rowDimension)
                .orderBy(orderMeasure, MdxQueryBuilder.Direction.BDESC)
                .build();
        return mapper.toChart(bridge.execute(mdx), title);
    }

    private String[] ensureContains(String[] measures, String required) {
        for (String m : measures) if (m.equals(required)) return measures;
        String[] out = new String[measures.length + 1];
        out[0] = required;
        System.arraycopy(measures, 0, out, 1, measures.length);
        return out;
    }
}