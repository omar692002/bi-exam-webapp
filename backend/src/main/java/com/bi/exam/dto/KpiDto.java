package com.bi.exam.dto;

/**
 * One headline KPI value (revenue, units sold, tax, etc.).
 */
public record KpiDto(String label, double value, String unit) {
}
