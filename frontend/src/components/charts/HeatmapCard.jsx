import { Box, Tooltip, Typography } from '@mui/material'
import ChartCard from './ChartCard'
import { heatColor, fmtNum } from './chartUtils'

const fmtCol = c => (/^\d+$/.test(String(c)) ? `Q${c}` : c)

export default function HeatmapCard({ data, subtitle }) {
  const { title, rowHeader, columnLabels = [], rows = [] } = data
  const max = Math.max(1, ...rows.flatMap(r => r.values))
  const empty = !rows.length || !columnLabels.length

  // [row label] + one column per quarter
  const template = `minmax(120px, 1.4fr) repeat(${columnLabels.length}, 1fr)`

  return (
    <ChartCard title={title} subtitle={subtitle} empty={empty} emptyHeight={260}>
      <Box sx={{ overflowX: 'auto' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: template, gap: 0.75, minWidth: 360 }}>
          {/* header */}
          <Box sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, alignSelf: 'end', pb: 0.5 }}>
            {rowHeader}
          </Box>
          {columnLabels.map(c => (
            <Box key={c} sx={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'text.secondary', pb: 0.5 }}>
              {fmtCol(c)}
            </Box>
          ))}

          {/* body */}
          {rows.map(row => (
            <Box key={row.label} sx={{ display: 'contents' }}>
              <Box sx={{ fontSize: 12.5, fontWeight: 600, color: 'text.primary', alignSelf: 'center', pr: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {row.label}
              </Box>
              {row.values.map((v, i) => {
                const ratio = v / max
                return (
                  <Tooltip key={i} title={`${row.label} · ${fmtCol(columnLabels[i])}: ${fmtNum(v)}`}>
                    <Box sx={{
                      height: 46, borderRadius: 1.5, bgcolor: heatColor(ratio),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11.5, fontWeight: 700,
                      color: ratio > 0.55 ? '#fff' : '#5E4B3C',
                      transition: 'transform .12s ease', cursor: 'default',
                      '&:hover': { transform: 'scale(1.05)', boxShadow: '0 4px 12px rgba(42,37,32,0.15)' },
                    }}>
                      {v > 0 ? fmtNum(v) : ''}
                    </Box>
                  </Tooltip>
                )
              })}
            </Box>
          ))}
        </Box>
      </Box>

      {/* legend */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
        <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>Low</Typography>
        <Box sx={{ flex: '0 0 140px', height: 8, borderRadius: 4, background: `linear-gradient(90deg, ${heatColor(0)}, ${heatColor(0.5)}, ${heatColor(1)})`, border: '1px solid #E7E0D5' }} />
        <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>High revenue</Typography>
      </Box>
    </ChartCard>
  )
}
