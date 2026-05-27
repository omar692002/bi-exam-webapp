package com.bi.exam.dto;

public record TimeFilter(String year, String quarter, String month) {

    public static TimeFilter of(String year, String quarter, String month) {
        return new TimeFilter(
                blankToEmpty(year),
                blankToEmpty(quarter),
                blankToEmpty(month));
    }

    public boolean hasYear()    { return !year.isBlank(); }
    public boolean hasQuarter() { return !quarter.isBlank(); }
    public boolean hasMonth()   { return !month.isBlank(); }
    public boolean isEmpty()    { return !hasYear() && !hasQuarter() && !hasMonth(); }

    private static String blankToEmpty(String s) {
        return s == null ? "" : s.trim();
    }
}
