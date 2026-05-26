import { useEffect, useRef, useState } from 'react'

export function useData(fetcher) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const ref = useRef(fetcher)

  useEffect(() => {
    ref.current()
      .then(setData)
      .catch(e => setError(e.message))
  }, [])

  return { data, error }
}
