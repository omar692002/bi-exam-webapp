package com.bi.exam.dto;

import java.util.List;

/**
 * Dashboard overview: a row of KPI cards.
 */
public record KpiSummaryDto(List<KpiDto> kpis) {
}
