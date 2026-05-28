import {
  Box, Card, CardContent, LinearProgress, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material'

const RANK_PALETTE = {
  1: { bg: '#f59e0b', glow: 'rgba(245,158,11,0.35)', row: '#fffbeb' },
  2: { bg: '#94a3b8', glow: 'rgba(148,163,184,0.35)', row: '#f8fafc' },
  3: { bg: '#cd7f32', glow: 'rgba(205,127,50,0.35)',  row: '#fef9f0' },
}

function RankBadge({ rank }) {
  const p = RANK_PALETTE[rank] ?? { bg: '#1e3a5f', glow: 'none' }
  return (
    <Box sx={{
      width: 28, height: 28, borderRadius: '50%',
      bgcolor: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, fontWeight: 800, color: '#fff', mx: 'auto',
      boxShadow: rank <= 3 ? `0 2px 8px ${p.glow}` : 'none',
    }}>
      {rank}
    </Box>
  )
}

// Compact number: 1 234 567 → 1.2M  |  82 345 → 82.3K  |  42 → 42
const fmtNum = v => {
  if (typeof v !== 'number') return v ?? ''
  const abs = Math.abs(v)
  if (abs >= 1e6) return (v / 1e6).toFixed(1) + 'M'
  if (abs >= 1e3) return (v / 1e3).toFixed(1) + 'K'
  return v.toLocaleString(undefined, { maximumFractionDigits: 1 })
}

function PrimaryCell({ value, max }) {
  const pct = max > 0 ? Math.min(100, (Number(value) / max) * 100) : 0
  return (
    <Box sx={{ minWidth: 90 }}>
      <Typography sx={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>
        {fmtNum(value)}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          mt: 0.6,
          height: 5,
          borderRadius: 3,
          bgcolor: '#e2e8f0',
          '& .MuiLinearProgress-bar': { bgcolor: '#0ea5e9', borderRadius: 3 },
        }}
      />
    </Box>
  )
}

export default function DataTable({ data }) {
  if (!data?.rows?.length) {
    return (
      <Card elevation={0} variant="outlined" sx={{ overflow: 'hidden' }}>
        <Box sx={{ bgcolor: '#1e3a5f', px: 2.5, py: 1.5 }}>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{data?.title}</Typography>
        </Box>
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: 120, color: 'text.disabled',
        }}>
          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>No data for this selection</Typography>
        </Box>
      </Card>
    )
  }

  // Identify the first column that holds numeric data (usually Revenue)
  const firstNumIdx = data.rows[0].findIndex(v => typeof v === 'number')
  const maxPrimary  = firstNumIdx >= 0
    ? Math.max(...data.rows.map(r => Number(r[firstNumIdx]) || 0))
    : 0

  return (
    <Card elevation={0} variant="outlined" sx={{ overflow: 'hidden' }}>
      {/* Coloured header strip */}
      <Box sx={{ bgcolor: '#1e3a5f', px: 2.5, py: 1.5 }}>
        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{data.title}</Typography>
      </Box>

      <TableContainer sx={{ maxHeight: 460 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{
                width: 44, textAlign: 'center', fontWeight: 700, fontSize: 11,
                bgcolor: '#f1f5f9', color: 'text.secondary', borderBottom: '2px solid #e2e8f0',
              }}>
                #
              </TableCell>
              {data.columns.map((col, i) => (
                <TableCell key={i} sx={{
                  fontWeight: 700, fontSize: 11, bgcolor: '#f1f5f9',
                  color: 'text.secondary', borderBottom: '2px solid #e2e8f0',
                }}>
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {data.rows.map((row, ri) => {
              const rank   = ri + 1
              const rowBg  = RANK_PALETTE[rank]?.row
              return (
                <TableRow
                  key={ri}
                  hover
                  sx={{
                    bgcolor: rowBg,
                    '&:hover': { bgcolor: `${rowBg ?? '#f0f9ff'} !important` },
                    transition: 'background 0.15s',
                  }}
                >
                  {/* Rank badge */}
                  <TableCell sx={{ textAlign: 'center', py: 1.2 }}>
                    <RankBadge rank={rank} />
                  </TableCell>

                  {/* Data cells */}
                  {row.map((cell, ci) => (
                    <TableCell key={ci} sx={{ fontSize: 13, py: 1.2, verticalAlign: 'middle' }}>
                      {ci === firstNumIdx
                        ? <PrimaryCell value={cell} max={maxPrimary} />
                        : fmtNum(cell)
                      }
                    </TableCell>
                  ))}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )
}
