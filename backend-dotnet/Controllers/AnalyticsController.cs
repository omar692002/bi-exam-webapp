using BiBackend.Dtos;
using BiBackend.Services;
using Microsoft.AspNetCore.Mvc;

namespace BiBackend.Controllers;

[ApiController]
[Route("api/analytics")]
public sealed class AnalyticsController : ControllerBase
{
    private readonly AnalyticsService _service;

    public AnalyticsController(AnalyticsService service) => _service = service;

    private static TimeFilter Tf(string? y, string? q, string? m) => TimeFilter.Of(y, q, m);

    [HttpGet("kpis")]
    public KpiSummaryDto Kpis(
        [FromQuery] string? year, [FromQuery] string? quarter, [FromQuery] string? month)
        => _service.KpiSummary(Tf(year, quarter, month));

    [HttpGet("sales-by-product")]
    public ChartDataDto SalesByProduct(
        [FromQuery] string? year, [FromQuery] string? quarter, [FromQuery] string? month)
        => _service.SalesByProduct(Tf(year, quarter, month));

    [HttpGet("sales-by-category")]
    public ChartDataDto SalesByCategory(
        [FromQuery] string? year, [FromQuery] string? quarter, [FromQuery] string? month)
        => _service.SalesByCategory(Tf(year, quarter, month));

    [HttpGet("sales-by-customer-type")]
    public ChartDataDto SalesByCustomerType(
        [FromQuery] string? year, [FromQuery] string? quarter, [FromQuery] string? month)
        => _service.SalesByCustomerType(Tf(year, quarter, month));

    [HttpGet("sales-by-country")]
    public ChartDataDto SalesByCountry(
        [FromQuery] string? year, [FromQuery] string? quarter, [FromQuery] string? month)
        => _service.SalesByCountry(Tf(year, quarter, month));

    [HttpGet("sales-by-city")]
    public ChartDataDto SalesByCity(
        [FromQuery] string? year, [FromQuery] string? quarter, [FromQuery] string? month)
        => _service.SalesByCity(Tf(year, quarter, month));

    [HttpGet("sales-by-customer-status")]
    public ChartDataDto SalesByCustomerStatus(
        [FromQuery] string? year, [FromQuery] string? quarter, [FromQuery] string? month)
        => _service.SalesByCustomerStatus(Tf(year, quarter, month));

    [HttpGet("sales-by-product-color")]
    public ChartDataDto SalesByProductColor(
        [FromQuery] string? year, [FromQuery] string? quarter, [FromQuery] string? month)
        => _service.SalesByColor(Tf(year, quarter, month));

    [HttpGet("sales-by-employee-department")]
    public ChartDataDto SalesByEmployeeDepartment(
        [FromQuery] string? year, [FromQuery] string? quarter, [FromQuery] string? month)
        => _service.SalesByEmployeeDepartment(Tf(year, quarter, month));

    [HttpGet("sales-by-employee-title")]
    public ChartDataDto SalesByEmployeeTitle(
        [FromQuery] string? year, [FromQuery] string? quarter, [FromQuery] string? month)
        => _service.SalesByEmployeeTitle(Tf(year, quarter, month));

    [HttpGet("sales-by-employment-type")]
    public ChartDataDto SalesByEmploymentType(
        [FromQuery] string? year, [FromQuery] string? quarter, [FromQuery] string? month)
        => _service.SalesByEmploymentType(Tf(year, quarter, month));

    [HttpGet("product-scatter")]
    public ChartDataDto ProductScatter(
        [FromQuery] int n = 20,
        [FromQuery] string? year = null, [FromQuery] string? quarter = null, [FromQuery] string? month = null)
        => _service.ProductScatter(Math.Clamp(n, 1, 100), Tf(year, quarter, month));

    [HttpGet("revenue-over-time")]
    public ChartDataDto RevenueOverTime() => _service.RevenueOverTime();

    [HttpGet("revenue-by-quarter")]
    public ChartDataDto RevenueByQuarter(
        [FromQuery] string? year, [FromQuery] string? quarter, [FromQuery] string? month)
        => _service.RevenueByQuarter(Tf(year, quarter, month));

    [HttpGet("sales-by-year")]
    public ChartDataDto SalesByYear() => _service.SalesByYear();

    [HttpGet("sales-by-month")]
    public ChartDataDto SalesByMonth(
        [FromQuery] string? year, [FromQuery] string? quarter, [FromQuery] string? month)
        => _service.SalesByMonth(Tf(year, quarter, month));

    [HttpGet("revenue-growth")]
    public ChartDataDto RevenueGrowth() => _service.RevenueGrowth();

    [HttpGet("revenue-ytd")]
    public ChartDataDto RevenueYtd(
        [FromQuery] string? year, [FromQuery] string? quarter, [FromQuery] string? month)
        => _service.RevenueYtd(Tf(year, quarter, month));

    [HttpGet("revenue-heatmap")]
    public MatrixDataDto RevenueHeatmap(
        [FromQuery] string? year, [FromQuery] string? quarter, [FromQuery] string? month)
        => _service.RevenueHeatmap(Tf(year, quarter, month));

    [HttpGet("tax-analysis")]
    public ChartDataDto TaxAnalysis(
        [FromQuery] string? year, [FromQuery] string? quarter, [FromQuery] string? month)
        => _service.TaxAnalysis(Tf(year, quarter, month));

    [HttpGet("top-customers")]
    public TableDataDto TopCustomers(
        [FromQuery] int n = 10,
        [FromQuery] string? year = null, [FromQuery] string? quarter = null, [FromQuery] string? month = null)
        => _service.TopCustomers(Math.Clamp(n, 1, 100), Tf(year, quarter, month));

    [HttpGet("top-products")]
    public TableDataDto TopProducts(
        [FromQuery] int n = 10,
        [FromQuery] string? year = null, [FromQuery] string? quarter = null, [FromQuery] string? month = null)
        => _service.TopProducts(Math.Clamp(n, 1, 100), Tf(year, quarter, month));

    [HttpGet("top-employees")]
    public TableDataDto TopEmployees(
        [FromQuery] int n = 10,
        [FromQuery] string? year = null, [FromQuery] string? quarter = null, [FromQuery] string? month = null)
        => _service.TopEmployees(Math.Clamp(n, 1, 100), Tf(year, quarter, month));

    [HttpGet("years")]
    public IReadOnlyList<string> Years() => _service.AvailableYears();
}
