import axios from 'axios'

const http = axios.create({ baseURL: 'http://localhost:8080/api' })

const tp = (year, quarter, month) => ({
  ...(year    ? { year }    : {}),
  ...(quarter ? { quarter } : {}),
  ...(month   ? { month }   : {}),
})

const get = (path, params) => http.get(path, { params }).then(r => r.data)

// ── Reference ────────────────────────────────────────────────────────────────
export const getAvailableYears = () => get('/analytics/years')

// ── KPIs ─────────────────────────────────────────────────────────────────────
export const getKpis = (y, q, m) => get('/analytics/kpis', tp(y, q, m))

// ── Sales breakdowns ───────────────────────────────────────────────────────────
export const getSalesByProduct       = (y, q, m) => get('/analytics/sales-by-product',        tp(y, q, m))
export const getSalesByCategory       = (y, q, m) => get('/analytics/sales-by-category',       tp(y, q, m))
export const getSalesByColor          = (y, q, m) => get('/analytics/sales-by-product-color',  tp(y, q, m))
export const getSalesByCustomerType   = (y, q, m) => get('/analytics/sales-by-customer-type',  tp(y, q, m))
export const getSalesByCustomerStatus = (y, q, m) => get('/analytics/sales-by-customer-status',tp(y, q, m))
export const getSalesByCountry        = (y, q, m) => get('/analytics/sales-by-country',         tp(y, q, m))
export const getSalesByCity           = (y, q, m) => get('/analytics/sales-by-city',            tp(y, q, m))
export const getSalesByDepartment     = (y, q, m) => get('/analytics/sales-by-employee-department', tp(y, q, m))
export const getSalesByJobTitle       = (y, q, m) => get('/analytics/sales-by-employee-title',  tp(y, q, m))
export const getSalesByEmploymentType = (y, q, m) => get('/analytics/sales-by-employment-type', tp(y, q, m))
export const getProductScatter        = (n = 20, y, q, m) => get('/analytics/product-scatter', { n, ...tp(y, q, m) })

// ── Time intelligence ──────────────────────────────────────────────────────────
export const getRevenueOverTime = ()        => get('/analytics/revenue-over-time')
export const getRevenueByQuarter = (y, q, m) => get('/analytics/revenue-by-quarter', tp(y, q, m))
export const getSalesByYear      = ()        => get('/analytics/sales-by-year')
export const getSalesByMonth     = (y, q, m) => get('/analytics/sales-by-month', tp(y, q, m))
export const getRevenueGrowth    = ()        => get('/analytics/revenue-growth')
export const getRevenueYtd       = (y, q, m) => get('/analytics/revenue-ytd', tp(y, q, m))
export const getRevenueHeatmap   = (y, q, m) => get('/analytics/revenue-heatmap', tp(y, q, m))

// ── Tax & finance ──────────────────────────────────────────────────────────────
export const getTaxAnalysis = (y, q, m) => get('/analytics/tax-analysis', tp(y, q, m))

// ── Top-N rankings ───────────────────────────────────────────────────────────
export const getTopCustomers = (n = 10, y, q, m) => get('/analytics/top-customers', { n, ...tp(y, q, m) })
export const getTopProducts  = (n = 10, y, q, m) => get('/analytics/top-products',  { n, ...tp(y, q, m) })
export const getTopEmployees = (n = 10, y, q, m) => get('/analytics/top-employees', { n, ...tp(y, q, m) })
