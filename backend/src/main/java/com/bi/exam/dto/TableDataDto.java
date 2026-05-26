package com.bi.exam.dto;

import java.util.List;

/**
 * Tabular result: columns + row arrays. Used by top-N tables and detail grids.
 */
public record TableDataDto(String title,
                           List<String> columns,
                           List<List<Object>> rows) {
}
