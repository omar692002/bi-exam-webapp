import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

import theme from './theme'
import { FilterProvider } from './context/FilterContext'
import AppShell from './components/layout/AppShell'

import Overview from './pages/Overview'
import Sales from './pages/Sales'
import TimeIntelligence from './pages/TimeIntelligence'
import Customers from './pages/Customers'
import Products from './pages/Products'
import WorkforceTax from './pages/WorkforceTax'

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <FilterProvider>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/"          element={<Overview />} />
              <Route path="/sales"     element={<Sales />} />
              <Route path="/time"      element={<TimeIntelligence />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/products"  element={<Products />} />
              <Route path="/workforce" element={<WorkforceTax />} />
              <Route path="*"          element={<Overview />} />
            </Route>
          </Routes>
        </FilterProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
