import { useData } from './useData'
import { useFilter } from '../context/FilterContext'

/**
 * Fetch data that depends on the global period filter.
 * Calls `fetcher(year, quarter, month)` and refetches whenever the period changes.
 */
export function usePeriodData(fetcher) {
  const { filter } = useFilter()
  return useData(() => fetcher(...filter), filter) // eslint-disable-line react-hooks/exhaustive-deps
}
