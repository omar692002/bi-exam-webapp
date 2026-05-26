package com.bi.exam.dto;

import java.util.List;

/**
 * Generic chart-ready payload: labels on the X axis, one or more named series.
 * Used by bar / line / pie / area charts.
 */
public record ChartDataDto(String title,
                           List<String> labels,
                           List<ChartSeriesDto> series) {
}
