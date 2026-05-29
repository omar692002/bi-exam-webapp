import { Box, Card, CardContent, Tooltip, Typography } from '@mui/material'
import ArrowUpwardRoundedIcon   from '@mui/icons-material/ArrowUpwardRounded'
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded'
import AttachMoneyRoundedIcon   from '@mui/icons-material/AttachMoneyRounded'
import Inventory2RoundedIcon    from '@mui/icons-material/Inventory2Rounded'
import ReceiptLongRoundedIcon   from '@mui/icons-material/ReceiptLongRounded'
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded'
import PaidRoundedIcon          from '@mui/icons-material/PaidRounded'
import SpeedRoundedIcon         from '@mui/icons-material/SpeedRounded'
import PercentRoundedIcon       from '@mui/icons-material/PercentRounded'
import ScaleRoundedIcon         from '@mui/icons-material/ScaleRounded'
import { PALETTE } from '../../theme'

const META = {
  'Total Revenue':        { c: PALETTE.burgundy,   Icon: AttachMoneyRoundedIcon },
  'Units Sold':           { c: PALETTE.sage,       Icon: Inventory2RoundedIcon },
  'Order Lines':          { c: PALETTE.dustyBlue,  Icon: ReceiptLongRoundedIcon },
  'Tax Collected':        { c: PALETTE.terracotta, Icon: AccountBalanceRoundedIcon },
  'Avg Order Line Value': { c: PALETTE.plum,       Icon: PaidRoundedIcon },
  'Revenue per Unit':     { c: PALETTE.gold,       Icon: SpeedRoundedIcon },
  'Avg Qty / Line':       { c: PALETTE.sageHi,     Icon: ScaleRoundedIcon },
  'Effective Tax Rate':   { c: PALETTE.burgundyHi, Icon: PercentRoundedIcon },
}
const DEFAULT = { c: PALETTE.burgundy, Icon: AttachMoneyRoundedIcon }

function fmt(value, unit) {
  if (value == null || Number.isNaN(value)) return '—'
  if (unit === 'USD') return '$' + value.toLocaleString(undefined, { maximumFractionDigits: value < 1000 ? 2 : 0 })
  if (unit === '%')   return value.toFixed(1) + '%'
  return value.toLocaleString(undefined, { maximumFractionDigits: value < 100 ? 2 : 0 })
}

function DeltaChip({ deltaPct }) {
  if (deltaPct == null) return null
  const up = deltaPct >= 0
  const color = up ? '#5B8C5A' : '#B5453B'
  const Icon = up ? ArrowUpwardRoundedIcon : ArrowDownwardRoundedIcon
  return (
    <Tooltip title="vs. same period, previous year">
      <Box sx={{
        display: 'inline-flex', alignItems: 'center', gap: 0.25,
        bgcolor: up ? 'rgba(91,140,90,0.12)' : 'rgba(181,69,59,0.12)',
        color, borderRadius: 2, px: 0.75, py: 0.25, fontSize: 12, fontWeight: 700,
      }}>
        <Icon sx={{ fontSize: 14 }} />
        {Math.abs(deltaPct).toFixed(1)}%
      </Box>
    </Tooltip>
  )
}

export default function KpiCard({ label, value, unit, deltaPct }) {
  const { c, Icon } = META[label] ?? DEFAULT
  return (
    <Card sx={{
      height: '100%', position: 'relative', overflow: 'hidden',
      transition: 'transform .18s ease, box-shadow .18s ease',
      '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 14px 34px rgba(42,37,32,0.10)' },
      '&::before': {
        content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: c,
      },
    }}>
      <CardContent sx={{ p: 2.75, pl: 3, '&:last-child': { pb: 2.75 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.25 }}>
          <Typography sx={{
            color: 'text.secondary', fontSize: 11.5, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: 0.8,
          }}>
            {label}
          </Typography>
          <Box sx={{
            width: 34, height: 34, borderRadius: 2.5, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: `${c}14`, color: c,
          }}>
            <Icon sx={{ fontSize: 19 }} />
          </Box>
        </Box>

        <Typography sx={{
          fontFamily: 'Georgia, serif', fontWeight: 700, color: 'text.primary',
          fontSize: { xs: '1.7rem', md: '2rem' }, lineHeight: 1.05, letterSpacing: '-0.02em',
        }}>
          {fmt(value, unit)}
        </Typography>

        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1, minHeight: 22 }}>
          <DeltaChip deltaPct={deltaPct} />
          {unit !== 'USD' && unit !== '%' && (
            <Typography sx={{ color: 'text.disabled', fontSize: 12, fontWeight: 500 }}>{unit}</Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
