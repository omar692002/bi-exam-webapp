package com.bi.exam.controller;

import com.bi.exam.dto.ChartDataDto;
import com.bi.exam.dto.KpiSummaryDto;
import com.bi.exam.dto.TableDataDto;
import com.bi.exam.service.AnalyticsService;
import jakarta.inject.Inject;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

/**
 * REST endpoints serving BI analytics derived from the SSAS cube.
 * All responses are chart-/table-/KPI-ready DTOs consumable by the React
 * dashboard without any further reshaping.
 */
@Path("/api/analytics")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Analytics", description = "MDX-driven BI analytics endpoints")
public class AnalyticsController {

    @Inject AnalyticsService service;

    // ------------------------------------------------------------------
    // KPI dashboard summary
    // ------------------------------------------------------------------
    @GET
    @Path("/kpis")
    public KpiSummaryDto kpis() {
        return service.kpiSummary();
    }

    // ------------------------------------------------------------------
    // Charts
    // ------------------------------------------------------------------
    @GET
    @Path("/sales-by-product")
    public ChartDataDto salesByProduct() {
        return service.salesByProduct();
    }

    @GET
    @Path("/sales-by-category")
    public ChartDataDto salesByCategory() {
        return service.salesByCategory();
    }

    @GET
    @Path("/sales-by-customer-type")
    public ChartDataDto salesByCustomerType() {
        return service.salesByCustomerType();
    }

    @GET
    @Path("/sales-by-country")
    public ChartDataDto salesByCountry() {
        return service.salesByCountry();
    }

    @GET
    @Path("/revenue-over-time")
    public ChartDataDto revenueOverTime() {
        return service.revenueOverTime();
    }

    @GET
    @Path("/revenue-by-quarter")
    public ChartDataDto revenueByQuarter() {
        return service.revenueByQuarter();
    }

    @GET
    @Path("/tax-analysis")
    public ChartDataDto taxAnalysis() {
        return service.taxAnalysis();
    }

    // ------------------------------------------------------------------
    // Top-N tables
    // ------------------------------------------------------------------
    @GET
    @Path("/top-customers")
    public TableDataDto topCustomers(@QueryParam("n") @DefaultValue("10") @Min(1) @Max(100) int n) {
        return service.topCustomers(n);
    }

    @GET
    @Path("/top-products")
    public TableDataDto topProducts(@QueryParam("n") @DefaultValue("10") @Min(1) @Max(100) int n) {
        return service.topProducts(n);
    }

    @GET
    @Path("/top-employees")
    public TableDataDto topEmployees(@QueryParam("n") @DefaultValue("10") @Min(1) @Max(100) int n) {
        return service.topEmployees(n);
    }
}
