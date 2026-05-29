import { createContext, useContext, useMemo, useState, useCallback } from 'react'
import { useData } from '../hooks/useData'
import * as api from '../api'

const FilterContext = createContext(null)

const QUARTER_MONTHS = {
  Q1: ['January', 'February', 'March'],
  Q2: ['April', 'May', 'June'],
  Q3: ['July', 'August', 'September'],
  Q4: ['October', 'November', 'December'],
}

export function FilterProvider({ children }) {
  const [year, setYear]       = useState('')
  const [quarter, setQuarter] = useState('')
  const [month, setMonth]     = useState('')

  const yearsState     = useData(api.getAvailableYears, [])
  const availableYears = (yearsState.data ?? []).map(String)

  const changeQuarter = useCallback((q) => {
    setQuarter(q)
    setMonth(m => (q && m && !QUARTER_MONTHS[q]?.includes(m) ? '' : m))
  }, [])

  const clear = useCallback(() => { setYear(''); setQuarter(''); setMonth('') }, [])

  // OLAP drill-down on the Date hierarchy: clicking a member sets the next level.
  const drillToYear    = useCallback((y) => { setYear(String(y)); setQuarter(''); setMonth('') }, [])
  const drillToQuarter = useCallback((q) => { changeQuarter(q) }, [changeQuarter])
  const drillToMonth   = useCallback((m) => { setMonth(m) }, [])

  const value = useMemo(() => ({
    year, quarter, month,
    setYear, setQuarter: changeQuarter, setMonth,
    clear, drillToYear, drillToQuarter, drillToMonth,
    availableYears,
    filter: [year, quarter, month],
    hasFilter: Boolean(year || quarter || month),
    level: month ? 'month' : quarter ? 'quarter' : year ? 'year' : 'all',
  }), [year, quarter, month, changeQuarter, clear, drillToYear, drillToQuarter, drillToMonth, availableYears])

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
}

export function useFilter() {
  const ctx = useContext(FilterContext)
  if (!ctx) throw new Error('useFilter must be used within FilterProvider')
  return ctx
}

export { QUARTER_MONTHS }
