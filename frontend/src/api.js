import axios from 'axios'

const http = axios.create({ baseURL: 'http://localhost:8080/api' })

const tp = (year, quarter, month) => ({
  ...(year    ? { year }    : {}),
  ...(quarter ? { quarter } : {}),
  ...(month   ? { month }   : {}),
})

export const getAvailableYears  = ()         => http.get('/analytics/years').then(r => r.data)
export const getKpis            = (y, q, m) => http.get('/analytics/kpis',                 { params: tp(y, q, m) }).then(r => r.data)
export const getRevenueOverTime = ()         => http.get('/analytics/revenue-over-time').then(r => r.data)

export const getSalesByProduct      = (y, q, m) => http.get('/analytics/sales-by-product',      { params: tp(y, q, m) }).then(r => r.data)
export const getSalesByCategory     = (y, q, m) => http.get('/analytics/sales-by-category',     { params: tp(y, q, m) }).then(r => r.data)
export const getSalesByCustomerType = (y, q, m) => http.get('/analytics/sales-by-customer-type',{ params: tp(y, q, m) }).then(r => r.data)
export const getSalesByCountry      = (y, q, m) => http.get('/analytics/sales-by-country',      { params: tp(y, q, m) }).then(r => r.data)
export const getRevenueByQuarter    = (y, q, m) => http.get('/analytics/revenue-by-quarter',    { params: tp(y, q, m) }).then(r => r.data)
export const getTaxAnalysis         = (y, q, m) => http.get('/analytics/tax-analysis',          { params: tp(y, q, m) }).then(r => r.data)

export const getTopCustomers = (n = 10, y, q, m) => http.get('/analytics/top-customers', { params: { n, ...tp(y, q, m) } }).then(r => r.data)
export const getTopProducts  = (n = 10, y, q, m) => http.get('/analytics/top-products',  { params: { n, ...tp(y, q, m) } }).then(r => r.data)
export const getTopEmployees = (n = 10, y, q, m) => http.get('/analytics/top-employees', { params: { n, ...tp(y, q, m) } }).then(r => r.data)
