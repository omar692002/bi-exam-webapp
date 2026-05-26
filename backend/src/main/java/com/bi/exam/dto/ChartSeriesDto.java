package com.bi.exam.dto;

import java.util.List;

/**
 * Single named series on a chart (e.g. "Revenue") with numeric values aligned
 * positionally to the parent {@link ChartDataDto#labels()}.
 */
public record ChartSeriesDto(String name, List<Double> data) {
}
