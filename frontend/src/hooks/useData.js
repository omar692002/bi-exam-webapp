import { useEffect, useState } from 'react'

export function useData(fetcher, deps = []) {
  const [data,    setData]    = useState(null)
  const [error,   setError]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    // Keep stale data visible during refetch — prevents layout flash
    fetcher()
      .then(d => { if (!cancelled) { setData(d);           setLoading(false) } })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false) } })
    return () => { cancelled = true }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, error, loading }
}
