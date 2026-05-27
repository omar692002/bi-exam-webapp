package com.bi.exam.controller;

import com.bi.exam.dto.ChartDataDto;
import com.bi.exam.dto.KpiSummaryDto;
import com.bi.exam.dto.TableDataDto;
import com.bi.exam.dto.TimeFilter;
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

@Path("/api/analytics")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Analytics", description = "MDX-driven BI analytics endpoints")
public class AnalyticsController {

    @Inject AnalyticsService service;

    private TimeFilter tf(String year, String quarter, String month) {
        return TimeFilter.of(year, quarter, month);
    }

    @GET @Path("/kpis")
    public KpiSummaryDto kpis(
            @QueryParam("year")    @DefaultValue("") String year,
            @QueryParam("quarter") @DefaultValue("") String quarter,
            @QueryParam("month")   @DefaultValue("") String month) {
        return service.kpiSummary(tf(year, quarter, month));
    }

    @GET @Path("/sales-by-product")
    public ChartDataDto salesByProduct(
            @QueryParam("year")    @DefaultValue("") String year,
            @QueryParam("quarter") @DefaultValue("") String quarter,
            @QueryParam("month")   @DefaultValue("") String month) {
        return service.salesByProduct(tf(year, quarter, month));
    }

    @GET @Path("/sales-by-category")
    public ChartDataDto salesByCategory(
            @QueryParam("year")    @DefaultValue("") String year,
            @QueryParam("quarter") @DefaultValue("") String quarter,
            @QueryParam("month")   @DefaultValue("") String month) {
        return service.salesByCategory(tf(year, quarter, month));
    }

    @GET @Path("/sales-by-customer-type")
    public ChartDataDto salesByCustomerType(
            @QueryParam("year")    @DefaultValue("") String year,
            @QueryParam("quarter") @DefaultValue("") String quarter,
            @QueryParam("month")   @DefaultValue("") String month) {
        return service.salesByCustomerType(tf(year, quarter, month));
    }

    @GET @Path("/sales-by-country")
    public ChartDataDto salesByCountry(
            @QueryParam("year")    @DefaultValue("") String year,
            @QueryParam("quarter") @DefaultValue("") String quarter,
            @QueryParam("month")   @DefaultValue("") String month) {
        return service.salesByCountry(tf(year, quarter, month));
    }

    @GET @Path("/revenue-over-time")
    public ChartDataDto revenueOverTime() {
        return service.revenueOverTime();
    }

    @GET @Path("/revenue-by-quarter")
    public ChartDataDto revenueByQuarter(
            @QueryParam("year")    @DefaultValue("") String year,
            @QueryParam("quarter") @DefaultValue("") String quarter,
            @QueryParam("month")   @DefaultValue("") String month) {
        return service.revenueByQuarter(tf(year, quarter, month));
    }

    @GET @Path("/tax-analysis")
    public ChartDataDto taxAnalysis(
            @QueryParam("year")    @DefaultValue("") String year,
            @QueryParam("quarter") @DefaultValue("") String quarter,
            @QueryParam("month")   @DefaultValue("") String month) {
        return service.taxAnalysis(tf(year, quarter, month));
    }

    @GET @Path("/top-customers")
    public TableDataDto topCustomers(
            @QueryParam("n")       @DefaultValue("10") @Min(1) @Max(100) int n,
            @QueryParam("year")    @DefaultValue("") String year,
            @QueryParam("quarter") @DefaultValue("") String quarter,
            @QueryParam("month")   @DefaultValue("") String month) {
        return service.topCustomers(n, tf(year, quarter, month));
    }

    @GET @Path("/top-products")
    public TableDataDto topProducts(
            @QueryParam("n")       @DefaultValue("10") @Min(1) @Max(100) int n,
            @QueryParam("year")    @DefaultValue("") String year,
            @QueryParam("quarter") @DefaultValue("") String quarter,
            @QueryParam("month")   @DefaultValue("") String month) {
        return service.topProducts(n, tf(year, quarter, month));
    }

    @GET @Path("/top-employees")
    public TableDataDto topEmployees(
            @QueryParam("n")       @DefaultValue("10") @Min(1) @Max(100) int n,
            @QueryParam("year")    @DefaultValue("") String year,
            @QueryParam("quarter") @DefaultValue("") String quarter,
            @QueryParam("month")   @DefaultValue("") String month) {
        return service.topEmployees(n, tf(year, quarter, month));
    }
}
