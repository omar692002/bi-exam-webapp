using BiBackend.Dtos;
using BiBackend.Mdx;
using BiBackend.Repository;

namespace BiBackend.Services;

public sealed class AnalyticsService
{
    private readonly AnalyticsRepository _repo;

    public AnalyticsService(AnalyticsRepository repo) => _repo = repo;

    // ── KPIs (with period-over-period delta when a year is selected) ──────────────

    public KpiSummaryDto KpiSummary(TimeFilter tf)
    {
        var current = ComputeKpis(tf);

        // Period-over-period: compare against the same slice in the previous year.
        if (tf.HasYear && int.TryParse(tf.Year, out var year))
        {
            var prev = ComputeKpis(TimeFilter.Of((year - 1).ToString(), tf.Quarter, tf.Month));
            var merged = current.Select((k, i) =>
            {
                var p = prev[i].Value;
                double? delta = p != 0d ? (k.Value - p) / p * 100d : null;
                return k with { PreviousValue = p, DeltaPct = delta };
            }).ToList();
            return new KpiSummaryDto(merged);
        }

        return new KpiSummaryDto(current);
    }

    private List<KpiDto> ComputeKpis(TimeFilter tf) => new()
    {
        new("Total Revenue",        _repo.ScalarMeasure(MdxConstants.M_REVENUE,              tf),        "USD"),
        new("Units Sold",           _repo.ScalarMeasure(MdxConstants.M_QUANTITY,             tf),        "units"),
        new("Order Lines",          _repo.ScalarMeasure(MdxConstants.M_ORDER_LINES,          tf),        "lines"),
        new("Tax Collected",        _repo.ScalarMeasure(MdxConstants.M_TAX_AMOUNT,           tf),        "USD"),
        new("Avg Order Line Value", _repo.ScalarMeasure(MdxConstants.M_AVG_ORDER_LINE_VALUE, tf),        "USD"),
        new("Revenue per Unit",     _repo.ScalarMeasure(MdxConstants.M_REVENUE_PER_UNIT,     tf),        "USD"),
        new("Avg Qty / Line",       _repo.ScalarMeasure(MdxConstants.M_AVG_QTY_PER_LINE,     tf),        "units"),
        new("Effective Tax Rate",   _repo.ScalarMeasure(MdxConstants.M_TAX_RATE_PCT,         tf) * 100d, "%")
    };

    // ── Sales breakdowns ─────────────────────────────────────────────────────────

    public ChartDataDto SalesByProduct(TimeFilter tf) =>
        _repo.Ranked("Revenue by Product Brand",
            MdxConstants.PRODUCT_BRAND, tf,
            MdxConstants.M_REVENUE, MdxConstants.M_REVENUE, MdxConstants.M_QUANTITY);

    public ChartDataDto SalesByCategory(TimeFilter tf) =>
        _repo.Ranked("Revenue by Product Category",
            MdxConstants.PRODUCT_CATEGORY, tf,
            MdxConstants.M_REVENUE, MdxConstants.M_REVENUE, MdxConstants.M_QUANTITY);

    public ChartDataDto SalesByColor(TimeFilter tf) =>
        _repo.Ranked("Revenue by Product Color",
            MdxConstants.PRODUCT_COLOR, tf,
            MdxConstants.M_REVENUE, MdxConstants.M_REVENUE, MdxConstants.M_QUANTITY);

    public ChartDataDto SalesByCustomerType(TimeFilter tf) =>
        _repo.Chart("Revenue by Customer Type",
            MdxConstants.CUSTOMER_TYPE, tf,
            MdxConstants.M_REVENUE, MdxConstants.M_ORDER_LINES);

    public ChartDataDto SalesByCustomerStatus(TimeFilter tf) =>
        _repo.Chart("Revenue by Customer Status",
            MdxConstants.CUSTOMER_STATUS, tf,
            MdxConstants.M_REVENUE, MdxConstants.M_ORDER_LINES);

    public ChartDataDto SalesByCountry(TimeFilter tf) =>
        _repo.Ranked("Revenue by Country",
            MdxConstants.CUSTOMER_COUNTRY, tf,
            MdxConstants.M_REVENUE, MdxConstants.M_REVENUE, MdxConstants.M_QUANTITY);

    public ChartDataDto SalesByCity(TimeFilter tf) =>
        _repo.Ranked("Revenue by City",
            MdxConstants.CUSTOMER_CITY, tf,
            MdxConstants.M_REVENUE, MdxConstants.M_REVENUE, MdxConstants.M_QUANTITY);

    public ChartDataDto SalesByEmployeeDepartment(TimeFilter tf) =>
        _repo.Ranked("Revenue by Department",
            MdxConstants.EMPLOYEE_DEPT, tf,
            MdxConstants.M_REVENUE, MdxConstants.M_REVENUE, MdxConstants.M_ORDER_LINES);

    public ChartDataDto SalesByEmployeeTitle(TimeFilter tf) =>
        _repo.Ranked("Revenue by Job Title",
            MdxConstants.EMPLOYEE_TITLE, tf,
            MdxConstants.M_REVENUE, MdxConstants.M_REVENUE, MdxConstants.M_ORDER_LINES);

    public ChartDataDto SalesByEmploymentType(TimeFilter tf) =>
        _repo.Chart("Revenue by Employment Type",
            MdxConstants.EMPLOYEE_TYPE, tf,
            MdxConstants.M_REVENUE, MdxConstants.M_ORDER_LINES);

    /// <summary>Top brands with Revenue, Quantity & Order Lines — rendered as a bubble scatter.</summary>
    public ChartDataDto ProductScatter(int n, TimeFilter tf) =>
        _repo.Ranked($"Price vs Volume — Top {n} Brands",
            MdxConstants.PRODUCT_BRAND, tf,
            MdxConstants.M_REVENUE,
            MdxConstants.M_REVENUE, MdxConstants.M_QUANTITY, MdxConstants.M_ORDER_LINES);

    // ── Time intelligence ────────────────────────────────────────────────────────

    public ChartDataDto SalesByYear() =>
        _repo.Chart("Revenue & Units by Year",
            MdxConstants.DATE_YEAR, TimeFilter.Of("", "", ""),
            MdxConstants.M_REVENUE, MdxConstants.M_QUANTITY);

    public ChartDataDto SalesByMonth(TimeFilter tf) =>
        _repo.ChartRowSet("Revenue & Units by Month",
            AnalyticsRepository.OrderedMonths, tf,
            MdxConstants.M_REVENUE, MdxConstants.M_QUANTITY);

    public ChartDataDto RevenueOverTime() =>
        _repo.ChartRowSet("Revenue & Units Over Time",
            AnalyticsRepository.OrderedMonths, TimeFilter.Of("", "", ""),
            MdxConstants.M_REVENUE, MdxConstants.M_QUANTITY);

    public ChartDataDto RevenueByQuarter(TimeFilter tf) =>
        // [Dim Date].[Quarter] is the row dimension — strip quarter/month slicers to avoid MDX conflict.
        _repo.Chart("Revenue by Quarter",
            MdxConstants.DATE_QUARTER, TimeFilter.Of(tf.Year, "", ""),
            MdxConstants.M_REVENUE, MdxConstants.M_QUANTITY);

    /// <summary>
    /// Period-over-period growth. With multiple years the natural comparison is
    /// Year-over-Year; the current dataset spans a single year, so we report
    /// Month-over-Month, which yields a meaningful growth curve.
    /// </summary>
    public ChartDataDto RevenueGrowth()
    {
        var years = _repo.YearList();
        var multiYear = years.Count > 1;

        var src = multiYear
            ? _repo.Chart("Revenue Growth", MdxConstants.DATE_YEAR, TimeFilter.Of("", "", ""), MdxConstants.M_REVENUE)
            : _repo.ChartRowSet("Revenue Growth", AnalyticsRepository.OrderedMonths, TimeFilter.Of("", "", ""), MdxConstants.M_REVENUE);

        var revenue = src.Series.Count > 0 ? src.Series[0].Data : Array.Empty<double>();
        var growth = new List<double>(revenue.Count);
        for (var i = 0; i < revenue.Count; i++)
        {
            if (i == 0 || revenue[i - 1] == 0d) growth.Add(0d);
            else growth.Add(Math.Round((revenue[i] - revenue[i - 1]) / revenue[i - 1] * 100d, 1));
        }

        var growthLabel = multiYear ? "YoY Growth %" : "MoM Growth %";
        var title = multiYear ? "Revenue Growth (Year-over-Year)" : "Revenue Growth (Month-over-Month)";
        return new ChartDataDto(title, src.Labels, new List<ChartSeriesDto>
        {
            new("Revenue", revenue),
            new(growthLabel, growth)
        });
    }

    /// <summary>Monthly Revenue plus a running-total (year-to-date cumulative) series.</summary>
    public ChartDataDto RevenueYtd(TimeFilter tf)
    {
        var src = _repo.ChartRowSet("Year-to-Date Revenue",
            AnalyticsRepository.OrderedMonths, TimeFilter.Of(tf.Year, "", ""), MdxConstants.M_REVENUE);

        var monthly = src.Series.Count > 0 ? src.Series[0].Data : Array.Empty<double>();
        var cumulative = new List<double>(monthly.Count);
        var running = 0d;
        foreach (var v in monthly) { running += v; cumulative.Add(running); }

        return new ChartDataDto("Year-to-Date Revenue", src.Labels, new List<ChartSeriesDto>
        {
            new("Monthly Revenue", monthly),
            new("Cumulative", cumulative)
        });
    }

    // ── Cross-tab / heatmap ──────────────────────────────────────────────────────

    public MatrixDataDto RevenueHeatmap(TimeFilter tf) =>
        _repo.Matrix("Revenue — Category × Quarter", "Category",
            MdxConstants.PRODUCT_CATEGORY, "Category Name",
            MdxConstants.DATE_QUARTER, "Quarter",
            MdxConstants.M_REVENUE, tf);

    // ── Tax & finance ────────────────────────────────────────────────────────────

    public ChartDataDto TaxAnalysis(TimeFilter tf) =>
        _repo.Chart("Tax vs Revenue by Category",
            MdxConstants.PRODUCT_CATEGORY, tf,
            MdxConstants.M_REVENUE, MdxConstants.M_TAX_AMOUNT);

    // ── Top-N rankings ───────────────────────────────────────────────────────────

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

    public IReadOnlyList<string> AvailableYears() => _repo.YearList();
}
