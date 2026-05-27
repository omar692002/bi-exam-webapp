package com.bi.exam.service;

import com.bi.exam.dto.ChartDataDto;
import com.bi.exam.dto.KpiDto;
import com.bi.exam.dto.KpiSummaryDto;
import com.bi.exam.dto.TableDataDto;
import com.bi.exam.dto.TimeFilter;
import com.bi.exam.mdx.MdxConstants;
import com.bi.exam.repository.AnalyticsRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;

@ApplicationScoped
public class AnalyticsService {

    @Inject AnalyticsRepository repo;

    public KpiSummaryDto kpiSummary(TimeFilter tf) {
        return new KpiSummaryDto(List.of(
                new KpiDto("Total Revenue",        repo.scalarMeasure(MdxConstants.M_REVENUE,              tf),         "USD"),
                new KpiDto("Units Sold",           repo.scalarMeasure(MdxConstants.M_QUANTITY,             tf),         "units"),
                new KpiDto("Tax Collected",        repo.scalarMeasure(MdxConstants.M_TAX_AMOUNT,           tf),         "USD"),
                new KpiDto("Order Lines",          repo.scalarMeasure(MdxConstants.M_ORDER_LINES,          tf),         "lines"),
                new KpiDto("Avg Order Line Value", repo.scalarMeasure(MdxConstants.M_AVG_ORDER_LINE_VALUE, tf),         "USD"),
                new KpiDto("Effective Tax Rate",   repo.scalarMeasure(MdxConstants.M_TAX_RATE_PCT,         tf) * 100d,  "%")
        ));
    }

    public ChartDataDto salesByProduct(TimeFilter tf) {
        return repo.ranked("Revenue by Product Brand",
                MdxConstants.PRODUCT_BRAND, tf,
                MdxConstants.M_REVENUE, MdxConstants.M_REVENUE, MdxConstants.M_QUANTITY);
    }

    public ChartDataDto salesByCategory(TimeFilter tf) {
        return repo.ranked("Revenue by Product Category",
                MdxConstants.PRODUCT_CATEGORY, tf,
                MdxConstants.M_REVENUE, MdxConstants.M_REVENUE, MdxConstants.M_QUANTITY);
    }

    public ChartDataDto salesByCustomerType(TimeFilter tf) {
        return repo.chart("Revenue by Customer Type",
                MdxConstants.CUSTOMER_TYPE, tf,
                MdxConstants.M_REVENUE, MdxConstants.M_ORDER_LINES);
    }

    public ChartDataDto salesByCountry(TimeFilter tf) {
        return repo.ranked("Revenue by City",
                MdxConstants.CUSTOMER_CITY, tf,
                MdxConstants.M_REVENUE, MdxConstants.M_REVENUE, MdxConstants.M_QUANTITY);
    }

    public ChartDataDto revenueOverTime() {
        return repo.chart("Revenue by Month",
                MdxConstants.DATE_MONTH, TimeFilter.of("", "", ""),
                MdxConstants.M_REVENUE, MdxConstants.M_REVENUE_WITH_TAX);
    }

    public ChartDataDto revenueByQuarter(TimeFilter tf) {
        // [Dim Date].[Quarter] is the row dimension — it cannot also be a WHERE slicer.
        // Only the year filter is passed; quarter/month filters are stripped to avoid the MDX conflict.
        return repo.chart("Revenue by Quarter",
                MdxConstants.DATE_QUARTER, TimeFilter.of(tf.year(), "", ""),
                MdxConstants.M_REVENUE, MdxConstants.M_TAX_AMOUNT);
    }

    public ChartDataDto taxAnalysis(TimeFilter tf) {
        return repo.chart("Tax vs Revenue by Category",
                MdxConstants.PRODUCT_CATEGORY, tf,
                MdxConstants.M_REVENUE, MdxConstants.M_TAX_AMOUNT);
    }

    public TableDataDto topCustomers(int n, TimeFilter tf) {
        return repo.topN("Top " + n + " Customers", "Customer",
                MdxConstants.CUSTOMER_ID, n, tf,
                MdxConstants.M_REVENUE, MdxConstants.M_REVENUE, MdxConstants.M_ORDER_LINES, MdxConstants.M_QUANTITY);
    }

    public TableDataDto topProducts(int n, TimeFilter tf) {
        return repo.topN("Top " + n + " Products", "Product",
                MdxConstants.PRODUCT_ID, n, tf,
                MdxConstants.M_REVENUE, MdxConstants.M_REVENUE, MdxConstants.M_QUANTITY);
    }

    public TableDataDto topEmployees(int n, TimeFilter tf) {
        return repo.topN("Top " + n + " Sales Reps", "Employee",
                MdxConstants.EMPLOYEE_ID, n, tf,
                MdxConstants.M_REVENUE, MdxConstants.M_REVENUE, MdxConstants.M_ORDER_LINES);
    }
}
