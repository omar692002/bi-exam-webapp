import { Avatar, Box, Card, CardContent, Typography } from '@mui/material'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import InventoryIcon from '@mui/icons-material/Inventory'
import PercentIcon from '@mui/icons-material/Percent'
import TimelineIcon from '@mui/icons-material/Timeline'
import GroupIcon from '@mui/icons-material/Group'

const UNIT_STYLE = {
  USD:     { icon: <AttachMoneyIcon />, color: '#10b981', bg: '#d1fae5' },
  '%':     { icon: <PercentIcon />,     color: '#6366f1', bg: '#e0e7ff' },
  units:   { icon: <InventoryIcon />,   color: '#f59e0b', bg: '#fef3c7' },
  lines:   { icon: <TimelineIcon />,    color: '#0ea5e9', bg: '#e0f2fe' },
  default: { icon: <GroupIcon />,       color: '#1e3a5f', bg: '#dbeafe' },
}

function fmt(value, unit) {
  if (unit === 'USD') return '$' + value.toLocaleString(undefined, { maximumFractionDigits: 0 })
  if (unit === '%')   return value.toFixed(2) + '%'
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

export default function KpiCard({ label, value, unit }) {
  const style = UNIT_STYLE[unit] ?? UNIT_STYLE.default

  return (
    <Card elevation={0} variant="outlined" sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              sx={{ textTransform: 'uppercase', letterSpacing: 0.6 }}
            >
              {label}
            </Typography>
            <Typography variant="h5" fontWeight={800} sx={{ color: style.color, mt: 0.5 }}>
              {fmt(value, unit)}
            </Typography>
            {unit && unit !== 'USD' && unit !== '%' && (
              <Typography variant="caption" color="text.secondary">{unit}</Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: style.bg, color: style.color, width: 40, height: 40 }}>
            {style.icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  )
}
