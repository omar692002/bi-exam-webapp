import {
  Box, Card, LinearProgress, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material'
import EmptyState from '../common/EmptyState'
import { fmtNum } from '../charts/chartUtils'

const RANK = {
  1: { bg: '#C9A227', row: 'rgba(201,162,39,0.08)' },
  2: { bg: '#A89B8C', row: 'rgba(168,155,140,0.08)' },
  3: { bg: '#C2703D', row: 'rgba(194,112,61,0.08)' },
}

function RankBadge({ rank }) {
  const p = RANK[rank] ?? { bg: '#7B2D3B' }
  return (
    <Box sx={{
      width: 26, height: 26, borderRadius: '50%', bgcolor: p.bg, mx: 'auto',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, fontWeight: 800, color: '#fff',
    }}>
      {rank}
    </Box>
  )
}

function PrimaryCell({ value, max }) {
  const pct = max > 0 ? Math.min(100, (Number(value) / max) * 100) : 0
  return (
    <Box sx={{ minWidth: 96 }}>
      <Typography sx={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>{fmtNum(value)}</Typography>
      <LinearProgress
        variant="determinate" value={pct}
        sx={{ mt: 0.6, height: 5, borderRadius: 3, bgcolor: '#EFE9DF',
          '& .MuiLinearProgress-bar': { bgcolor: 'primary.main', borderRadius: 3 } }}
      />
    </Box>
  )
}

export default function DataTable({ data, maxHeight = 440 }) {
  const hasRows = !!data?.rows?.length

  const firstNumIdx = hasRows ? data.rows[0].findIndex(v => typeof v === 'number') : -1
  const maxPrimary = firstNumIdx >= 0 ? Math.max(...data.rows.map(r => Number(r[firstNumIdx]) || 0)) : 0

  return (
    <Card sx={{ overflow: 'hidden', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ background: 'linear-gradient(135deg, #7B2D3B 0%, #5E2029 100%)', px: 2.5, py: 1.5 }}>
        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 14.5 }}>{data?.title}</Typography>
      </Box>

      {!hasRows ? (
        <EmptyState height={140} />
      ) : (
        <TableContainer sx={{ maxHeight }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 44, textAlign: 'center', fontWeight: 700, fontSize: 11, bgcolor: '#F6F1E8', color: 'text.secondary', borderBottom: '2px solid #E7E0D5' }}>#</TableCell>
                {data.columns.map((col, i) => (
                  <TableCell key={i} sx={{ fontWeight: 700, fontSize: 11, bgcolor: '#F6F1E8', color: 'text.secondary', borderBottom: '2px solid #E7E0D5', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.rows.map((row, ri) => {
                const rank = ri + 1
                const rowBg = RANK[rank]?.row
                return (
                  <TableRow key={ri} hover sx={{ bgcolor: rowBg, '&:hover': { bgcolor: `${rowBg ?? 'rgba(123,45,59,0.05)'} !important` }, transition: 'background .15s' }}>
                    <TableCell sx={{ textAlign: 'center', py: 1.1 }}><RankBadge rank={rank} /></TableCell>
                    {row.map((cell, ci) => (
                      <TableCell key={ci} sx={{ fontSize: 13, py: 1.1, verticalAlign: 'middle' }}>
                        {ci === firstNumIdx ? <PrimaryCell value={cell} max={maxPrimary} /> : fmtNum(cell)}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  )
}
