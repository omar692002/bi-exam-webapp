package com.bi.exam.mdx;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Fluent builder for MDX SELECT statements.
 *
 * <p>Generated layout:</p>
 * <pre>
 *   SELECT NON EMPTY { measures } ON COLUMNS,
 *          NON EMPTY [ TopCount(...) | Order(...) | rowDim.Members ] ON ROWS
 *   FROM   [VDS]
 *   WHERE  ( filter1, filter2, ... )
 * </pre>
 *
 * <p>This builder intentionally covers the common analytics patterns we need
 * (KPIs, bar / line charts, top-N tables, filtered slices) without exposing
 * the full MDX surface. For one-off exotic queries the executor will happily
 * run any raw MDX string.</p>
 */
public final class MdxQueryBuilder {

    private final Set<String> measures = new LinkedHashSet<>();
    private String rowDimension;
    private final List<String> filters = new ArrayList<>();
    private String orderByMeasure;
    private Direction orderDirection = Direction.DESC;
    private Integer topN;
    private boolean nonEmpty = true;
    private String cube = MdxConstants.CUBE;

    public enum Direction { ASC, DESC, BASC, BDESC }

    public static MdxQueryBuilder create() {
        return new MdxQueryBuilder();
    }

    public MdxQueryBuilder cube(String cube) {
        this.cube = cube;
        return this;
    }

    public MdxQueryBuilder measure(String... measureMembers) {
        this.measures.addAll(Arrays.asList(measureMembers));
        return this;
    }

    /** Dimension whose members populate the ROWS axis (e.g. [Dim Product].[Brand Name]). */
    public MdxQueryBuilder rows(String dimensionMember) {
        this.rowDimension = dimensionMember;
        return this;
    }

    /** Add a slicer member to the WHERE clause. */
    public MdxQueryBuilder filter(String member) {
        if (member != null && !member.isBlank()) {
            this.filters.add(member);
        }
        return this;
    }

    public MdxQueryBuilder orderBy(String measure, Direction direction) {
        this.orderByMeasure = measure;
        this.orderDirection = direction;
        return this;
    }

    public MdxQueryBuilder top(int n, String measure) {
        this.topN = n;
        this.orderByMeasure = measure;
        return this;
    }

    public MdxQueryBuilder nonEmpty(boolean nonEmpty) {
        this.nonEmpty = nonEmpty;
        return this;
    }

    public String build() {
        if (measures.isEmpty()) {
            throw new IllegalStateException("At least one measure must be set.");
        }
        if (rowDimension == null) {
            throw new IllegalStateException("Row dimension must be set via rows(...).");
        }

        StringBuilder sb = new StringBuilder();
        sb.append("SELECT ");
        if (nonEmpty) sb.append("NON EMPTY ");
        sb.append('{').append(String.join(", ", measures)).append("} ON COLUMNS, ");

        if (nonEmpty) sb.append("NON EMPTY ");
        sb.append(buildRowsExpression()).append(" ON ROWS ");
        sb.append("FROM ").append(cube);

        if (!filters.isEmpty()) {
            sb.append(" WHERE (").append(String.join(", ", filters)).append(')');
        }
        return sb.toString();
    }

    private String buildRowsExpression() {
        String members = rowDimension + ".Members";
        if (topN != null && orderByMeasure != null) {
            return "TopCount(" + members + ", " + topN + ", " + orderByMeasure + ")";
        }
        if (orderByMeasure != null) {
            return "Order(" + members + ", " + orderByMeasure + ", " + orderDirection + ")";
        }
        return members;
    }
}
