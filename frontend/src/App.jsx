import { useEffect, useState } from 'react'
import {
  AppBar, Toolbar, Typography, Box, Grid, Tab, Tabs,
  CircularProgress, Alert, Container, Divider
} from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import BarChartIcon from '@mui/icons-material/BarChart'

import KpiCard from './components/KpiCard'
import { BarChartCard, LineChartCard, PieChartCard } from './components/ChartCard'
import DataTable from './components/DataTable'
import * as api from './api'

const theme = createTheme({
  palette: {
    primary: { main: '#1565c0' },
    background: { default: '#f5f7fa' }
  },
  typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' }
})

function Section({ title, children }) {
  return (
    <Box mb={4}>
      <Typography variant="h6" fontWeight="bold" color="primary" mb={1}>
        {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {children}
    </Box>
  )
}

function useData(fetcher) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  useEffect(() => {
    fetcher().then(setData).catch(e => setError(e.message))
  }, [])
  return { data, error }
}

function Loader() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" height={320}>
      <CircularProgress />
    </Box>
  )
}

export default function App() {
  const kpis = useData(api.getKpis)
  const byProduct = useData(api.getSalesByProduct)
  const byCategory = useData(api.getSalesByCategory)
  const byCountry = useData(api.getSalesByCountry)
  const byType = useData(api.getSalesByCustomerType)
  const overTime = useData(api.getRevenueOverTime)
  const byQuarter = useData(api.getRevenueByQuarter)
  const tax = useData(api.getTaxAnalysis)
  const topCustomers = useData(() => api.getTopCustomers(10))
  const topProducts = useData(() => api.getTopProducts(10))
  const topEmployees = useData(() => api.getTopEmployees(10))

  const [tab, setTab] = useState(0)

  const errors = [kpis, byProduct, byCategory, byCountry, byType, overTime, byQuarter, tax,
                  topCustomers, topProducts, topEmployees].filter(d => d.error)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <AppBar position="sticky" elevation={2}>
        <Toolbar>
          <BarChartIcon sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
            VDS Analytics Dashboard
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            ExamMultidimensionnel · Cube VDS
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Backend error: {errors[0].error}. Make sure Quarkus is running on port 8080.
          </Alert>
        )}

        {/* ── KPI Row ────────────────────────────────────────────── */}
        <Section title="Key Performance Indicators">
          {kpis.data ? (
            <Grid container spacing={2}>
              {kpis.data.kpis.map(kpi => (
                <Grid item xs={12} sm={6} md={4} lg={2} key={kpi.label}>
                  <KpiCard label={kpi.label} value={kpi.value} unit={kpi.unit} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Loader />
          )}
        </Section>

        {/* ── Chart Tabs ─────────────────────────────────────────── */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Sales Analysis" />
          <Tab label="Time Trends" />
          <Tab label="Tax & Finance" />
          <Tab label="Top N Rankings" />
        </Tabs>

        {tab === 0 && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              {byCategory.data ? <BarChartCard data={byCategory.data} horizontal /> : <Loader />}
            </Grid>
            <Grid item xs={12} md={6}>
              {byCountry.data ? <BarChartCard data={byCountry.data} horizontal /> : <Loader />}
            </Grid>
            <Grid item xs={12} md={8}>
              {byProduct.data ? <BarChartCard data={byProduct.data} horizontal /> : <Loader />}
            </Grid>
            <Grid item xs={12} md={4}>
              {byType.data ? <PieChartCard data={byType.data} /> : <Loader />}
            </Grid>
          </Grid>
        )}

        {tab === 1 && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
              {overTime.data ? <LineChartCard data={overTime.data} /> : <Loader />}
            </Grid>
            <Grid item xs={12} md={5}>
              {byQuarter.data ? <BarChartCard data={byQuarter.data} /> : <Loader />}
            </Grid>
          </Grid>
        )}

        {tab === 2 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {tax.data ? <BarChartCard data={tax.data} /> : <Loader />}
            </Grid>
          </Grid>
        )}

        {tab === 3 && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              {topCustomers.data ? <DataTable data={topCustomers.data} /> : <Loader />}
            </Grid>
            <Grid item xs={12} md={4}>
              {topProducts.data ? <DataTable data={topProducts.data} /> : <Loader />}
            </Grid>
            <Grid item xs={12} md={4}>
              {topEmployees.data ? <DataTable data={topEmployees.data} /> : <Loader />}
            </Grid>
          </Grid>
        )}
      </Container>
    </ThemeProvider>
  )
}
