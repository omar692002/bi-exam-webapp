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

import KpiCard      from './components/kpi/KpiCard'
import ComboChartCard from './components/charts/ComboChartCard'
import BarChartCard  from './components/charts/BarChartCard'
import PieChartCard  from './components/charts/PieChartCard'
import DataTable     from './components/tables/DataTable'

/**
 * Keeps stale data visible (dimmed) while a refetch is in flight.
 * Only falls back to <Loader> on the very first load (data === null).
 * This prevents layout shifts and size glitches when filters change.
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

  const f = [year, quarter, month]

  // Revenue over time is year-level — intentionally never re-filtered
  const overTime     = useData(api.getRevenueOverTime, [])

  const kpis         = useData(() => api.getKpis(...f),                f)
  const byCategory   = useData(() => api.getSalesByCategory(...f),     f)
  const byCountry    = useData(() => api.getSalesByCountry(...f),      f)
  const byProduct    = useData(() => api.getSalesByProduct(...f),      f)
  const byType       = useData(() => api.getSalesByCustomerType(...f), f)
  const byQuarter    = useData(() => api.getRevenueByQuarter(...f),    f)
  const tax          = useData(() => api.getTaxAnalysis(...f),         f)
  const topCustomers = useData(() => api.getTopCustomers(10, ...f),    f)
  const topProducts  = useData(() => api.getTopProducts(10, ...f),     f)
  const topEmployees = useData(() => api.getTopEmployees(10, ...f),    f)

  const availableYears = overTime.data?.labels ?? []

  const filterDependent = [
    kpis, byCategory, byCountry, byProduct, byType,
    byQuarter, tax, topCustomers, topProducts, topEmployees,
  ]
  const isLoading = filterDependent.some(d => d.loading)
  const errors    = [...filterDependent, overTime].filter(d => d.error).map(d => d.error)

  // Appends the active filter label to a chart title without mutating state
  const label = [year, quarter, month].filter(Boolean).join(' · ')
  const tagged = (state) => {
    if (!state.data || !label) return state
    return { ...state, data: { ...state.data, title: `${state.data.title} — ${label}` } }
  }

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
        <Section title="Time Trends">
          <Slot state={tagged(byQuarter)} height={520}>
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
