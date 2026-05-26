import { Card, CardContent, Typography } from '@mui/material'

function format(value, unit) {
  if (unit === 'USD') return '$' + value.toLocaleString(undefined, { maximumFractionDigits: 0 })
  if (unit === '%') return value.toFixed(2) + ' %'
  if (unit === 'units' || unit === 'lines')
    return value.toLocaleString(undefined, { maximumFractionDigits: 0 }) + ' ' + unit
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export default function KpiCard({ label, value, unit }) {
  return (
    <Card sx={{ height: '100%' }} elevation={2}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {label}
        </Typography>
        <Typography variant="h5" fontWeight="bold" color="primary">
          {format(value, unit)}
        </Typography>
      </CardContent>
    </Card>
  )
}
