package com.bi.exam.mdx;

/**
 * Centralised MDX identifiers for the ExamMultidimensionnel cube.
 * Single source of truth: rename a measure in the cube → change it here only.
 */
public final class MdxConstants {

    private MdxConstants() { }

    public static final String CUBE = "[VDS]";

    // ---------- Base measures ----------
    public static final String M_REVENUE              = "[Measures].[Revenue]";
    public static final String M_QUANTITY             = "[Measures].[Quantity Sold]";
    public static final String M_TAX_AMOUNT           = "[Measures].[Tax Amount]";
    public static final String M_AVG_UNIT_PRICE       = "[Measures].[Avg Unit Price]";
    public static final String M_ORDER_LINES          = "[Measures].[Number of Order Lines]";

    // ---------- Calculated measures ----------
    public static final String M_AVG_ORDER_LINE_VALUE = "[Measures].[Average_Order_Line_Value]";
    public static final String M_REVENUE_PER_UNIT     = "[Measures].[Revenue_per_Unit]";
    public static final String M_REVENUE_WITH_TAX     = "[Measures].[Revenue_Including_Tax]";
    public static final String M_TAX_RATE_PCT         = "[Measures].[Tax_Rate_Percentage]";
    public static final String M_AVG_QTY_PER_LINE     = "[Measures].[Avg_Quantity_per_Order_Line]";

    // ---------- Dimension : Date ----------
    public static final String DIM_DATE               = "[Dim Date]";
    public static final String DATE_HIER_CALENDAR     = "[Dim Date].[Calander]";   // typo preserved from cube
    public static final String DATE_YEAR              = "[Dim Date].[Year]";
    public static final String DATE_QUARTER           = "[Dim Date].[Quarter]";
    public static final String DATE_MONTH             = "[Dim Date].[Month]";
    public static final String DATE_KEY               = "[Dim Date].[Date Key]";

    // ---------- Dimension : Customer ----------
    public static final String DIM_CUSTOMER           = "[Dim Customer]";
    public static final String CUSTOMER_ID            = "[Dim Customer].[Customer ID]";
    public static final String CUSTOMER_CATEGORY      = "[Dim Customer].[Category Name]";
    public static final String CUSTOMER_CITY          = "[Dim Customer].[City]";
    public static final String CUSTOMER_COUNTRY       = "[Dim Customer].[Country]";
    public static final String CUSTOMER_STATUS        = "[Dim Customer].[Customer Status]";
    public static final String CUSTOMER_TYPE          = "[Dim Customer].[Customer Type]";

    // ---------- Dimension : Product ----------
    public static final String DIM_PRODUCT            = "[Dim Product]";
    public static final String PRODUCT_ID             = "[Dim Product].[Product ID]";
    public static final String PRODUCT_BRAND          = "[Dim Product].[Brand Name]";
    public static final String PRODUCT_CATEGORY       = "[Dim Product].[Category Name]";
    public static final String PRODUCT_COLOR          = "[Dim Product].[Color]";

    // ---------- Dimension : Employee ----------
    public static final String DIM_EMPLOYEE           = "[Dim Employee]";
    public static final String EMPLOYEE_ID            = "[Dim Employee].[Employee ID]";
    public static final String EMPLOYEE_DEPT          = "[Dim Employee].[Department Name]";
    public static final String EMPLOYEE_TITLE         = "[Dim Employee].[Job Title]";
    public static final String EMPLOYEE_TYPE          = "[Dim Employee].[Employment Type]";
}
