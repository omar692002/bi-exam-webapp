import { Box, Typography } from '@mui/material'
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded'
import { fmtNum } from '../charts/chartUtils'
import { PALETTE } from '../../theme'

/** Derive quick narrative facts from a ChartDataDto (uses series[0] as the measure). */
export function deriveInsights(data, { unit = '', noun = 'items' } = {}) {
  if (!data?.labels?.length || !data.series?.length) return []
  const vals = data.series[0].data
  const total = vals.reduce((s, v) => s + v, 0)
  if (total <= 0) return []

  const pairs = data.labels.map((label, i) => ({ label, v: vals[i] })).sort((a, b) => b.v - a.v)
  const leader = pairs[0]
  const top3 = pairs.slice(0, 3).reduce((s, p) => s + p.v, 0)
  const fmtV = v => (unit === 'USD' ? '$' + fmtNum(v) : unit === '%' ? v.toFixed(1) + '%' : fmtNum(v))

  return [
    { label: 'Leader', value: leader.label, hint: `${((leader.v / total) * 100).toFixed(1)}% of total`, color: PALETTE.burgundy },
    { label: 'Top contributor', value: fmtV(leader.v), hint: `out of ${fmtV(total)}`, color: PALETTE.sage },
    { label: 'Top-3 concentration', value: `${((top3 / total) * 100).toFixed(0)}%`, hint: `of ${data.labels.length} ${noun}`, color: PALETTE.terracotta },
  ]
}

export default function InsightStrip({ items = [], title = 'Insights' }) {
  if (!items.length) return null
  return (
    <Box sx={{
      display: 'grid', gridTemplateColumns: { xs: '1fr', sm: `repeat(${Math.min(items.length, 4)}, 1fr)` },
      gap: 2, mb: 1,
    }}>
      {items.map((it, i) => (
        <Box key={i} sx={{
          bgcolor: '#FFFFFF', border: '1px solid', borderColor: 'divider', borderRadius: 3,
          p: 2, position: 'relative', overflow: 'hidden',
          '&::before': { content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, bgcolor: it.color },
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
            <LightbulbRoundedIcon sx={{ fontSize: 14, color: it.color }} />
            <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: 'text.secondary' }}>
              {it.label}
            </Typography>
          </Box>
          <Typography sx={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 19, lineHeight: 1.15, color: 'text.primary' }}>
            {it.value}
          </Typography>
          {it.hint && <Typography sx={{ fontSize: 12, color: 'text.disabled', mt: 0.25 }}>{it.hint}</Typography>}
        </Box>
      ))}
    </Box>
  )
}
