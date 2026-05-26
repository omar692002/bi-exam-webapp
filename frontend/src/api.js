import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:8080/api' })

export const getKpis = () => api.get('/analytics/kpis').then(r => r.data)
export const getSalesByProduct = () => api.get('/analytics/sales-by-product').then(r => r.data)
export const getSalesByCategory = () => api.get('/analytics/sales-by-category').then(r => r.data)
export const getSalesByCustomerType = () => api.get('/analytics/sales-by-customer-type').then(r => r.data)
export const getSalesByCountry = () => api.get('/analytics/sales-by-country').then(r => r.data)
export const getRevenueOverTime = () => api.get('/analytics/revenue-over-time').then(r => r.data)
export const getRevenueByQuarter = () => api.get('/analytics/revenue-by-quarter').then(r => r.data)
export const getTaxAnalysis = () => api.get('/analytics/tax-analysis').then(r => r.data)
export const getTopCustomers = (n = 10) => api.get(`/analytics/top-customers?n=${n}`).then(r => r.data)
export const getTopProducts = (n = 10) => api.get(`/analytics/top-products?n=${n}`).then(r => r.data)
export const getTopEmployees = (n = 10) => api.get(`/analytics/top-employees?n=${n}`).then(r => r.data)