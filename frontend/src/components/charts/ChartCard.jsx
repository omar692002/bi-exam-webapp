import { Box, Card, CardContent, Typography } from '@mui/material'
import EmptyState from '../common/EmptyState'

/**
 * Shared frame for every chart: title row, optional subtitle/action, empty-state,
 * and a min-width-0 body so ResponsiveContainer never collapses in a grid cell.
 */
export default function ChartCard({ title, subtitle, action, hint, axisKey, empty, emptyHeight = 300, children }) {
  return (
    <Card sx={{ width: '100%', height: '100%', overflow: 'visible' }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3 }, '&:last-child': { pb: 3 }, height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, mb: 2 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontSize: 16, lineHeight: 1.3 }}>{title}</Typography>
            {subtitle && (
              <Typography sx={{ color: 'text.secondary', fontSize: 12.5, mt: 0.25 }}>{subtitle}</Typography>
            )}
          </Box>
          {action}
        </Box>
        {hint && (
          <Typography sx={{ color: 'text.disabled', fontSize: 11.5, mb: 1, fontStyle: 'italic' }}>{hint}</Typography>
        )}
        {!empty && axisKey && <Box>{axisKey}</Box>}
        {empty ? <EmptyState height={emptyHeight} /> : <Box sx={{ width: '100%', minWidth: 0 }}>{children}</Box>}
      </CardContent>
    </Card>
  )
}
