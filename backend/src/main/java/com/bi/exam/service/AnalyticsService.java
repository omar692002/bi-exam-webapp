package com.bi.exam.service;

import com.bi.exam.dto.ChartDataDto;
import com.bi.exam.dto.KpiDto;
import com.bi.exam.dto.KpiSummaryDto;
import com.bi.exam.dto.TableDataDto;
import com.bi.exam.mdx.MdxConstants;
import com.bi.exam.repository.AnalyticsRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;

/**
 * Business orchestration layer for analytics: hides MDX details from the
 * controllers, names each KPI / chart, and wires the right measures and
 * dimensions for each visualisation.
 */
@ApplicationScoped
public class AnalyticsService {

    @Inject AnalyticsRepository repo;

    // ------------------------------------------------------------------
    // KPI dashboard summary
    // ------------------------------------------------------------------
    public KpiSummaryDto kpiSummary() {
        return new KpiSummaryDto(List.of(
                new KpiDto("Total Revenue",          repo.scalarMeasure(MdxConstants.M_REVENUE),         "USD"),
                new KpiDto("Units Sold",             repo.scalarMeasure(MdxConstants.M_QUANTITY),        "units"),
                new KpiDto("Tax Collected",          repo.scalarMeasure(MdxConstants.M_TAX_AMOUNT),      "USD"),
                new KpiDto("Order Lines",            repo.scalarMeasure(MdxConstants.M_ORDER_LINES),     "lines"),
                new KpiDto("Avg Order Line Value",   repo.scalarMeasure(MdxConstants.M_AVG_ORDER_LINE_VALUE), "USD"),
                new KpiDto("Effective Tax Rate",     repo.scalarMeasure(MdxConstants.M_TAX_RATE_PCT) * 100d, "%")
        ));
    }

    // ------------------------------------------------------------------
    // Sales by product / category / customer / employee
    // ------------------------------------------------------------------
    public ChartDataDto salesByProduct() {
        return repo.ranked("Revenue by Product Brand",
                MdxConstants.PRODUCT_BRAND,
                MdxConstants.M_REVENUE,
                MdxConstants.M_REVENUE,
                MdxConstants.M_QUANTITY);
    }

    public ChartDataDto salesByCategory() {
        return repo.ranked("Revenue by Product Category",
                MdxConstants.PRODUCT_CATEGORY,
                MdxConstants.M_REVENUE,
                MdxConstants.M_REVENUE,
                MdxConstants.M_QUANTITY);
    }

    public ChartDataDto salesByCustomerType() {
        return repo.chart("Revenue by Customer Type",
                MdxConstants.CUSTOMER_TYPE,
                MdxConstants.M_REVENUE,
                MdxConstants.M_ORDER_LINES);
    }

    public ChartDataDto salesByCountry() {
        return repo.ranked("Revenue by Country",
                MdxConstants.CUSTOMER_COUNTRY,
                MdxConstants.M_REVENUE,
                MdxConstants.M_REVENUE,
                MdxConstants.M_QUANTITY);
    }

    public ChartDataDto revenueOverTime() {
        return repo.chart("Revenue Over Time (Year)",
                MdxConstants.DATE_YEAR,
                MdxConstants.M_REVENUE,
                MdxConstants.M_REVENUE_WITH_TAX);
    }

    public ChartDataDto revenueByQuarter() {
        return repo.chart("Revenue by Quarter",
                MdxConstants.DATE_QUARTER,
                MdxConstants.M_REVENUE,
                MdxConstants.M_TAX_AMOUNT);
    }

    public ChartDataDto taxAnalysis() {
        return repo.chart("Tax vs Revenue by Category",
                MdxConstants.PRODUCT_CATEGORY,
                MdxConstants.M_REVENUE,
                MdxConstants.M_TAX_AMOUNT,
                MdxConstants.M_TAX_RATE_PCT);
    }

    // ------------------------------------------------------------------
    // Top-N tables
    // ------------------------------------------------------------------
    public TableDataDto topCustomers(int n) {
        return repo.topN("Top " + n + " Customers", "Customer",
                MdxConstants.CUSTOMER_ID, n,
                MdxConstants.M_REVENUE,
                MdxConstants.M_REVENUE,
                MdxConstants.M_ORDER_LINES,
                MdxConstants.M_QUANTITY);
    }

    public TableDataDto topProducts(int n) {
        return repo.topN("Top " + n + " Products", "Product",
                MdxConstants.PRODUCT_ID, n,
                MdxConstants.M_REVENUE,
                MdxConstants.M_REVENUE,
                MdxConstants.M_QUANTITY);
    }

    public TableDataDto topEmployees(int n) {
        return repo.topN("Top " + n + " Sales Reps", "Employee",
                MdxConstants.EMPLOYEE_ID, n,
                MdxConstants.M_REVENUE,
                MdxConstants.M_REVENUE,
                MdxConstants.M_ORDER_LINES);
    }
}
