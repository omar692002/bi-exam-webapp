using BiBackend.Dtos;
using BiBackend.Mdx;
using BiBackend.Repository;

namespace BiBackend.Services;

public sealed class AnalyticsService
{
    private readonly AnalyticsRepository _repo;

    public AnalyticsService(AnalyticsRepository repo) => _repo = repo;

    public KpiSummaryDto KpiSummary(TimeFilter tf) => new(new List<KpiDto>
    {
        new("Total Revenue",        _repo.ScalarMeasure(MdxConstants.M_REVENUE,              tf),         "USD"),
        new("Units Sold",           _repo.ScalarMeasure(MdxConstants.M_QUANTITY,             tf),         "units"),
        new("Tax Collected",        _repo.ScalarMeasure(MdxConstants.M_TAX_AMOUNT,           tf),         "USD"),
        new("Order Lines",          _repo.ScalarMeasure(MdxConstants.M_ORDER_LINES,          tf),         "lines"),
        new("Avg Order Line Value", _repo.ScalarMeasure(MdxConstants.M_AVG_ORDER_LINE_VALUE, tf),         "USD"),
        new("Effective Tax Rate",   _repo.ScalarMeasure(MdxConstants.M_TAX_RATE_PCT,         tf) * 100d,  "%")
    });

    public ChartDataDto SalesByProduct(TimeFilter tf) =>
        _repo.Ranked("Revenue by Product Brand",
            MdxConstants.PRODUCT_BRAND, tf,
            MdxConstants.M_REVENUE, MdxConstants.M_REVENUE, MdxConstants.M_QUANTITY);

    public ChartDataDto SalesByCategory(TimeFilter tf) =>
        _repo.Ranked("Revenue by Product Category",
            MdxConstants.PRODUCT_CATEGORY, tf,
            MdxConstants.M_REVENUE, MdxConstants.M_REVENUE, MdxConstants.M_QUANTITY);

    public ChartDataDto SalesByCustomerType(TimeFilter tf) =>
        _repo.Chart("Revenue by Customer Type",
            MdxConstants.CUSTOMER_TYPE, tf,
            MdxConstants.M_REVENUE, MdxConstants.M_ORDER_LINES);

    public ChartDataDto SalesByCountry(TimeFilter tf) =>
        _repo.Ranked("Revenue by City",
            MdxConstants.CUSTOMER_CITY, tf,
            MdxConstants.M_REVENUE, MdxConstants.M_REVENUE, MdxConstants.M_QUANTITY);

    public ChartDataDto RevenueOverTime() =>
        _repo.Chart("Revenue by Month",
            MdxConstants.DATE_MONTH, TimeFilter.Of("", "", ""),
            MdxConstants.M_REVENUE, MdxConstants.M_REVENUE_WITH_TAX);

    public ChartDataDto RevenueByQuarter(TimeFilter tf) =>
        // [Dim Date].[Quarter] is the row dimension — strip quarter/month slicers to avoid MDX conflict.
        _repo.Chart("Revenue by Quarter",
            MdxConstants.DATE_QUARTER, TimeFilter.Of(tf.Year, "", ""),
            MdxConstants.M_REVENUE, MdxConstants.M_TAX_AMOUNT);

    public ChartDataDto TaxAnalysis(TimeFilter tf) =>
        _repo.Chart("Tax vs Revenue by Category",
            MdxConstants.PRODUCT_CATEGORY, tf,
            MdxConstants.M_REVENUE, MdxConstants.M_TAX_AMOUNT);

    public TableDataDto TopCustomers(int n, TimeFilter tf) =>
        _repo.TopN($"Top {n} Customers", "Customer",
            MdxConstants.CUSTOMER_ID, n, tf,
            MdxConstants.M_REVENUE, MdxConstants.M_REVENUE, MdxConstants.M_ORDER_LINES, MdxConstants.M_QUANTITY);

    public TableDataDto TopProducts(int n, TimeFilter tf) =>
        _repo.TopN($"Top {n} Products", "Product",
            MdxConstants.PRODUCT_ID, n, tf,
            MdxConstants.M_REVENUE, MdxConstants.M_REVENUE, MdxConstants.M_QUANTITY);

    public TableDataDto TopEmployees(int n, TimeFilter tf) =>
        _repo.TopN($"Top {n} Sales Reps", "Employee",
            MdxConstants.EMPLOYEE_ID, n, tf,
            MdxConstants.M_REVENUE, MdxConstants.M_REVENUE, MdxConstants.M_ORDER_LINES);
}
