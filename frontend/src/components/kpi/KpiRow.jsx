import { Box, Card, CardContent, Skeleton } from '@mui/material'
import { usePeriodData } from '../../hooks/usePeriodData'
import * as api from '../../api'
import KpiCard from './KpiCard'

export default function KpiRow({ count = 8 }) {
  const kpis = usePeriodData(api.getKpis)

  const grid = {
    display: 'grid', gap: 2,
    gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
  }

  if (kpis.data === null) {
    return (
      <Box sx={grid}>
        {[...Array(count)].map((_, i) => (
          <Card key={i}><CardContent><Skeleton variant="text" width="60%" /><Skeleton variant="rounded" height={48} sx={{ mt: 1 }} /></CardContent></Card>
        ))}
      </Box>
    )
  }

  return (
    <Box sx={{ ...grid, opacity: kpis.loading ? 0.55 : 1, transition: 'opacity .2s ease' }}>
      {kpis.data.kpis.map(k => (
        <KpiCard key={k.label} label={k.label} value={k.value} unit={k.unit} deltaPct={k.deltaPct} />
      ))}
    </Box>
  )
}
