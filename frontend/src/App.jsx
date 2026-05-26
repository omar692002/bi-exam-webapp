import { useState } from 'react'
import { Box } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

import theme from './theme'
import { useData } from './hooks/useData'
import * as api from './api'

import Sidebar, { DRAWER_WIDTH } from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import ErrorBanner from './components/common/ErrorBanner'

import OverviewPage from './pages/OverviewPage'
import SalesPage from './pages/SalesPage'
import TrendsPage from './pages/TrendsPage'
import FinancePage from './pages/FinancePage'
import RankingsPage from './pages/RankingsPage'

export default function App() {
  const [page, setPage] = useState(0)

  const kpis         = useData(api.getKpis)
  const byProduct    = useData(api.getSalesByProduct)
  const byCategory   = useData(api.getSalesByCategory)
  const byCountry    = useData(api.getSalesByCountry)
  const byType       = useData(api.getSalesByCustomerType)
  const overTime     = useData(api.getRevenueOverTime)
  const byQuarter    = useData(api.getRevenueByQuarter)
  const tax          = useData(api.getTaxAnalysis)
  const topCustomers = useData(() => api.getTopCustomers(10))
  const topProducts  = useData(() => api.getTopProducts(10))
  const topEmployees = useData(() => api.getTopEmployees(10))

  const errors = [kpis, byProduct, byCategory, byCountry, byType, overTime,
                  byQuarter, tax, topCustomers, topProducts, topEmployees]
    .filter(d => d.error).map(d => d.error)

  const pages = [
    <OverviewPage kpis={kpis} overTime={overTime} byType={byType} />,
    <SalesPage byCategory={byCategory} byCountry={byCountry} byProduct={byProduct} byType={byType} />,
    <TrendsPage overTime={overTime} byQuarter={byQuarter} />,
    <FinancePage tax={tax} />,
    <RankingsPage topCustomers={topCustomers} topProducts={topProducts} topEmployees={topEmployees} />,
  ]

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <Sidebar page={page} onNavigate={setPage} />
        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default', minHeight: '100vh' }}
        >
          <TopBar page={page} drawerWidth={DRAWER_WIDTH} />
          <Box sx={{ height: 64, mb: 1 }} />
          <ErrorBanner errors={errors} />
          {pages[page]}
        </Box>
      </Box>
    </ThemeProvider>
  )
}
