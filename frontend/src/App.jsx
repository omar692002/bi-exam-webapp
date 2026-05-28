import { useState } from 'react'
import { Box, Grid } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

import theme    from './theme'
import { useData } from './hooks/useData'
import * as api from './api'

import NavBar      from './components/layout/NavBar'
import FilterBar   from './components/layout/FilterBar'
import ErrorBanner from './components/common/ErrorBanner'
import Section     from './components/common/Section'
import Loader      from './components/common/Loader'

import KpiCard        from './components/kpi/KpiCard'
import ComboChartCard from './components/charts/ComboChartCard'
import BarChartCard   from './components/charts/BarChartCard'
import PieChartCard   from './components/charts/PieChartCard'
import DataTable      from './components/tables/DataTable'

/**
 * Keeps stale data visible (dimmed) while a refetch is in flight.
 * Only falls back to <Loader> on the very first load (data === null).
 */
function Slot({ state, height = 300, children }) {
  if (state.data === null) return <Loader height={height} />
  return (
    <Box sx={{
      opacity: state.loading ? 0.5 : 1,
      transition: 'opacity 0.2s ease',
      pointerEvents: state.loading ? 'none' : 'auto',
    }}>
      {children(state.data)}
    </Box>
  )
}

export default function App() {
  const [year,    setYear]    = useState('')
  const [quarter, setQuarter] = useState('')
  const [month,   setMonth]   = useState('')

  // Full filter tuple — used by charts that support all three dimensions
  const f = [year, quarter, month]

  // --- Data fetching -----------------------------------------------------------

  // Available years come from a dedicated endpoint, not from the chart data.
  const yearsData     = useData(api.getAvailableYears, [])
  const availableYears = yearsData.data ?? []

  // Revenue Overview: monthly breakdown — only year makes sense as a filter here
  // (filtering by month would collapse the chart to a single bar; by quarter to 3).
  const overTime = useData(api.getRevenueOverTime, [])

  // Key Metrics KPIs: full filter (year / quarter / month)
  const kpis = useData(() => api.getKpis(...f), f)

  // Sales Analysis: full filter
  const byCategory = useData(() => api.getSalesByCategory(...f),     f)
  const byCountry  = useData(() => api.getSalesByCountry(...f),      f)
  const byProduct  = useData(() => api.getSalesByProduct(...f),      f)
  const byType     = useData(() => api.getSalesByCustomerType(...f), f)

  // Time Trends – Revenue by Quarter: only year is meaningful here.
  // Filtering by quarter would conflict with the row dimension (all quarters on rows);
  // filtering by month makes no sense on a quarterly chart.
  const byQuarter = useData(() => api.getRevenueByQuarter(year, '', ''), [year])

  // Tax & Finance: full filter
  const tax = useData(() => api.getTaxAnalysis(...f), f)

  // Top Rankings: full filter
  const topCustomers = useData(() => api.getTopCustomers(10, ...f), f)
  const topProducts  = useData(() => api.getTopProducts(10, ...f),  f)
  const topEmployees = useData(() => api.getTopEmployees(10, ...f), f)

  // --- Loading / error state ---------------------------------------------------

  const filterDependent = [
    kpis, byCategory, byCountry, byProduct, byType,
    byQuarter, tax, topCustomers, topProducts, topEmployees,
  ]
  const isLoading = filterDependent.some(d => d.loading)
  const errors    = [...filterDependent, overTime].filter(d => d.error).map(d => d.error)

  // --- Helpers -----------------------------------------------------------------

  // Appends the active filter label to a chart title.
  // `dims` controls which filter dimensions contribute to the label.
  const activeLabel   = (dims) => dims.filter(Boolean).join(' · ')
  const tagChart = (state, dims) => {
    const lbl = activeLabel(dims)
    if (!state.data || !lbl) return state
    return { ...state, data: { ...state.data, title: `${state.data.title} — ${lbl}` } }
  }

  // Full label: year · quarter · month
  const tagged     = (state) => tagChart(state, [year, quarter, month])
  // Year-only label (for Time Trends charts that only use year)
  const taggedYear = (state) => tagChart(state, [year])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <NavBar />

      <FilterBar
        year={year}       onYearChange={setYear}       availableYears={availableYears}
        quarter={quarter} onQuarterChange={setQuarter}
        month={month}     onMonthChange={setMonth}
        isLoading={isLoading}
      />

      <Box component="main" sx={{ p: 4, pt: '136px', bgcolor: 'background.default', minHeight: '100vh' }}>
        <ErrorBanner errors={errors} />

        {/* ── Key Metrics ─────────────────────────────────────────────────── */}
        <Section title="Key Metrics">
          {kpis.data === null ? (
            <Grid container spacing={2.5}>
              {[...Array(6)].map((_, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}><Loader height={100} /></Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ opacity: kpis.loading ? 0.5 : 1, transition: 'opacity 0.2s ease' }}>
              <Grid container spacing={2.5}>
                {kpis.data.kpis.map(kpi => (
                  <Grid item xs={12} sm={6} md={4} key={kpi.label}>
                    <KpiCard label={kpi.label} value={kpi.value} unit={kpi.unit} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Section>

        {/* ── Revenue Overview ────────────────────────────────────────────── */}
        {/* Not filterable by quarter/month — filtering by year only makes sense here */}
        <Section title="Revenue Overview">
          <Slot state={overTime} height={520}>
            {d => <ComboChartCard data={d} />}
          </Slot>
        </Section>

        {/* ── Sales Analysis ──────────────────────────────────────────────── */}
        <Section title="Sales Analysis">
          <Grid container spacing={5}>
            <Grid item xs={12} md={6}>
              <Slot state={tagged(byCategory)} height={560}>
                {d => <BarChartCard data={d} horizontal />}
              </Slot>
            </Grid>
            <Grid item xs={12} md={6}>
              <Slot state={tagged(byCountry)} height={560}>
                {d => <BarChartCard data={d} horizontal />}
              </Slot>
            </Grid>
            <Grid item xs={12} lg={8}>
              <Slot state={tagged(byProduct)} height={560}>
                {d => <BarChartCard data={d} horizontal />}
              </Slot>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Slot state={tagged(byType)} height={520}>
                {d => <PieChartCard data={d} />}
              </Slot>
            </Grid>
          </Grid>
        </Section>

        {/* ── Time Trends ─────────────────────────────────────────────────── */}
        {/* Revenue by Quarter: always shows all quarters; filtered by year only.
            Quarter / month from the global bar are intentionally not applied here —
            you cannot slice a dimension that is already on the row axis. */}
        <Section title="Time Trends">
          <Slot state={taggedYear(byQuarter)} height={520}>
            {d => <BarChartCard data={d} />}
          </Slot>
        </Section>

        {/* ── Tax & Finance ───────────────────────────────────────────────── */}
        <Section title="Tax & Finance">
          <Slot state={tagged(tax)} height={460}>
            {d => <BarChartCard data={d} horizontal />}
          </Slot>
        </Section>

        {/* ── Top Rankings ────────────────────────────────────────────────── */}
        <Section title="Top Rankings">
          <Grid container spacing={5}>
            <Grid item xs={12} md={4}>
              <Slot state={topCustomers}>{d => <DataTable data={d} />}</Slot>
            </Grid>
            <Grid item xs={12} md={4}>
              <Slot state={topProducts}>{d => <DataTable data={d} />}</Slot>
            </Grid>
            <Grid item xs={12} md={4}>
              <Slot state={topEmployees}>{d => <DataTable data={d} />}</Slot>
            </Grid>
          </Grid>
        </Section>
      </Box>
    </ThemeProvider>
  )
}
