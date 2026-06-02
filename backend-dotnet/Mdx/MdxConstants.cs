namespace BiBackend.Mdx;

public static class MdxConstants
{
    public const string CUBE = "[VDS]";

    // Base measures
    public const string M_REVENUE              = "[Measures].[Revenue]";
    public const string M_QUANTITY             = "[Measures].[Quantity Sold]";
    public const string M_TAX_AMOUNT           = "[Measures].[Tax Amount]";
    public const string M_AVG_UNIT_PRICE       = "[Measures].[Avg Unit Price]";
    public const string M_ORDER_LINES          = "[Measures].[Number of Order Lines]";

    // Calculated measures
    public const string M_AVG_ORDER_LINE_VALUE = "[Measures].[Average_Order_Line_Value]";
    public const string M_REVENUE_PER_UNIT     = "[Measures].[Revenue_per_Unit]";
    public const string M_REVENUE_NET          = "[Measures].[Revenue_Excluding_Tax]";
    public const string M_TAX_RATE_PCT         = "[Measures].[Tax_Rate_Percentage]";
    public const string M_AVG_QTY_PER_LINE     = "[Measures].[Avg_Quantity_per_Order_Line]";

    // Dim Date
    public const string DIM_DATE               = "[Dim Date]";
    public const string DATE_HIER_CALENDAR     = "[Dim Date].[Calander]";
    public const string DATE_YEAR              = "[Dim Date].[Year]";
    public const string DATE_QUARTER           = "[Dim Date].[Quarter]";
    public const string DATE_MONTH             = "[Dim Date].[Month]";
    public const string DATE_KEY               = "[Dim Date].[Date Key]";

    // Dim Customer
    public const string DIM_CUSTOMER           = "[Dim Customer]";
    public const string CUSTOMER_ID            = "[Dim Customer].[Customer ID]";
    public const string CUSTOMER_CATEGORY      = "[Dim Customer].[Category Name]";
    public const string CUSTOMER_CITY          = "[Dim Customer].[City]";
    public const string CUSTOMER_COUNTRY       = "[Dim Customer].[Country]";
    public const string CUSTOMER_STATUS        = "[Dim Customer].[Customer Status]";
    public const string CUSTOMER_TYPE          = "[Dim Customer].[Customer Type]";

    // Dim Product
    public const string DIM_PRODUCT            = "[Dim Product]";
    public const string PRODUCT_ID             = "[Dim Product].[Product ID]";
    public const string PRODUCT_BRAND          = "[Dim Product].[Brand Name]";
    public const string PRODUCT_CATEGORY       = "[Dim Product].[Category Name]";
    public const string PRODUCT_COLOR          = "[Dim Product].[Color]";

    // Dim Employee
    public const string DIM_EMPLOYEE           = "[Dim Employee]";
    public const string EMPLOYEE_ID            = "[Dim Employee].[Employee ID]";
    public const string EMPLOYEE_DEPT          = "[Dim Employee].[Department Name]";
    public const string EMPLOYEE_TITLE         = "[Dim Employee].[Job Title]";
    public const string EMPLOYEE_TYPE          = "[Dim Employee].[Employment Type]";
}
