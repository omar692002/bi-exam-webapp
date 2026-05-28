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

function Slot({ state, height = 300, children }) {
  if (state.data === null) return <Loader height={height} />
  return (
    <Box sx={{
      width: '100%',
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

  // --- Data fetching -----------------------------------------------------------

  const yearsData      = useData(api.getAvailableYears, [])
  const availableYears = yearsData.data ?? []

  // Key Metrics: full filter
  const kpis = useData(() => api.getKpis(...f), f)

  // Sales Analysis: full filter
  const byCategory = useData(() => api.getSalesByCategory(...f),     f)
  const byCountry  = useData(() => api.getSalesByCountry(...f),      f)
  const byProduct  = useData(() => api.getSalesByProduct(...f),      f)
  const byType     = useData(() => api.getSalesByCustomerType(...f), f)

  // Revenue Trends:
  //   overTime — long-term trend (all periods, no slicer — shows Revenue + Units over all time)
  //   byQuarter — within-year distribution (year-filtered only; slicing by quarter would
  //               conflict with the row axis which already enumerates all 4 quarters)
  const overTime  = useData(api.getRevenueOverTime,                      [])
  const byQuarter = useData(() => api.getRevenueByQuarter(year, '', ''), [year])

  // Tax & Finance: full filter
  const tax = useData(() => api.getTaxAnalysis(...f), f)

  // Top Rankings: full filter
  const topCustomers = useData(() => api.getTopCustomers(10, ...f), f)
  const topProducts  = useData(() => api.getTopProducts(10, ...f),  f)
  const topEmployees = useData(() => api.getTopEmployees(10, ...f), f)

  // --- Loading / error --------------------------------------------------------

  const filterDependent = [
    kpis, byCategory, byCountry, byProduct, byType,
    byQuarter, tax, topCustomers, topProducts, topEmployees,
  ]
  const isLoading = filterDependent.some(d => d.loading)
  const errors    = [...filterDependent, overTime].filter(d => d.error).map(d => d.error)

  // --- Title tagging ----------------------------------------------------------

  const tag = (state, dims) => {
    const lbl = dims.filter(Boolean).join(' · ')
    if (!state.data || !lbl) return state
    return { ...state, data: { ...state.data, title: `${state.data.title} — ${lbl}` } }
  }
  const tagged     = (state) => tag(state, [year, quarter, month])
  const taggedYear = (state) => tag(state, [year])

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

        {/* ── 1. Key Metrics ──────────────────────────────────────────────── */}
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

        {/* ── 2. Sales Analysis ───────────────────────────────────────────── */}
        {/* CSS Grid — no MUI negative-margin trick, items fill cells natively */}
        <Section title="Sales Analysis">
          <Box sx={{ display: 'grid', gap: 4 }}>
            <Box>
              <Slot state={tagged(byCategory)} height={560}>
                {d => <BarChartCard data={d} horizontal />}
              </Slot>
            </Box>
            <Box>
              <Slot state={tagged(byProduct)} height={560}>
                {d => <BarChartCard data={d} horizontal />}
              </Slot>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 4 }}>
              <Box>
                <Slot state={tagged(byCountry)} height={560}>
                  {d => <BarChartCard data={d} horizontal />}
                </Slot>
              </Box>
              <Box>
                <Slot state={tagged(byType)} height={520}>
                  {d => <PieChartCard data={d} />}
                </Slot>
              </Box>
            </Box>
          </Box>
        </Section>

        {/* ── 3. Revenue Trends ───────────────────────────────────────────── */}
        {/*
            Top:    long-term trend — Revenue & Units over all periods.
            Bottom: within-year quarterly distribution — year-filtered only.
                    Quarter/month slicers cannot be applied because Quarter is
                    already the row dimension (all 4 bars always visible).
            Both charts are full-width so dual Y-axes have enough horizontal room.
        */}
        <Section title="Revenue Trends">
          <Box mb={5}>
            <Slot state={overTime} height={500}>
              {d => <ComboChartCard data={d} />}
            </Slot>
          </Box>
          <Slot state={taggedYear(byQuarter)} height={460}>
            {d => <ComboChartCard data={d} />}
          </Slot>
        </Section>

        {/* ── 4. Tax & Finance ────────────────────────────────────────────── */}
        <Section title="Tax & Finance">
          <Slot state={tagged(tax)} height={460}>
            {d => <BarChartCard data={d} horizontal />}
          </Slot>
        </Section>

        {/* ── 5. Top Rankings ─────────────────────────────────────────────── */}
        {/* CSS Grid — 2 equal columns on md+, single column on mobile */}
        <Section title="Top Rankings">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
            <Box>
              <Slot state={topCustomers}>{d => <DataTable data={d} />}</Slot>
            </Box>
            <Box>
              <Slot state={topProducts}>{d => <DataTable data={d} />}</Slot>
            </Box>
            <Box>
              <Slot state={topEmployees}>{d => <DataTable data={d} />}</Slot>
            </Box>
          </Box>
        </Section>
      </Box>
    </ThemeProvider>
  )
}
