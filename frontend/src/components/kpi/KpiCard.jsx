import { Box, Card, CardContent, Typography } from '@mui/material'
import AttachMoneyIcon    from '@mui/icons-material/AttachMoney'
import InventoryIcon      from '@mui/icons-material/Inventory'
import PercentIcon        from '@mui/icons-material/Percent'
import TimelineIcon       from '@mui/icons-material/Timeline'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import TrendingUpIcon     from '@mui/icons-material/TrendingUp'

const STYLES = {
  'Total Revenue':        { gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', Icon: AttachMoneyIcon },
  'Units Sold':           { gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', Icon: InventoryIcon },
  'Tax Collected':        { gradient: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)', Icon: AccountBalanceIcon },
  'Order Lines':          { gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', Icon: TimelineIcon },
  'Avg Order Line Value': { gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', Icon: TrendingUpIcon },
  'Effective Tax Rate':   { gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', Icon: PercentIcon },
}

const DEFAULT_STYLE = {
  gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)',
  Icon: AttachMoneyIcon,
}

function fmt(value, unit) {
  if (unit === 'USD') return '$' + value.toLocaleString(undefined, { maximumFractionDigits: 0 })
  if (unit === '%')   return value.toFixed(1) + '%'
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

export default function KpiCard({ label, value, unit }) {
  const { gradient, Icon } = STYLES[label] ?? DEFAULT_STYLE

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        minHeight: 160,
        background: gradient,
        borderRadius: 3,
        border: 'none',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        },
      }}
    >
      {/* Decorative circle top-right */}
      <Box sx={{
        position: 'absolute', right: -20, top: -20,
        width: 100, height: 100, borderRadius: '50%',
        bgcolor: 'rgba(255,255,255,0.12)',
        pointerEvents: 'none',
      }} />
      {/* Decorative circle bottom-left */}
      <Box sx={{
        position: 'absolute', left: -30, bottom: -30,
        width: 80, height: 80, borderRadius: '50%',
        bgcolor: 'rgba(255,255,255,0.07)',
        pointerEvents: 'none',
      }} />

      {/* Background icon */}
      <Box sx={{
        position: 'absolute', right: 14, bottom: 10,
        color: 'rgba(255,255,255,0.18)',
        lineHeight: 0,
        pointerEvents: 'none',
      }}>
        <Icon sx={{ fontSize: 64 }} />
      </Box>

      <CardContent sx={{ p: 3.5, '&:last-child': { pb: 3.5 }, position: 'relative' }}>
        <Typography sx={{
          color: 'rgba(255,255,255,0.75)',
          fontSize: 12,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 1.3,
          mb: 2,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {label}
        </Typography>

        <Typography
          fontWeight={800}
          sx={{
            color: '#fff',
            lineHeight: 1,
            fontSize: { xs: '2rem', sm: '2.4rem', md: '2.6rem' },
            wordBreak: 'break-word',
          }}
        >
          {fmt(value, unit)}
        </Typography>

        {unit && unit !== 'USD' && unit !== '%' && (
          <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, mt: 1, fontWeight: 500 }}>
            {unit}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}
