import { Box, Typography } from '@mui/material'

/**
 * Small color-coded legend that tells the viewer which series maps to which axis
 * on a dual-scale chart. `orientation` = 'vertical' (left/right) or 'horizontal' (bottom/top).
 */
export default function AxisKey({ left, right, leftColor, rightColor, orientation = 'vertical' }) {
  const [a, b] = orientation === 'horizontal' ? ['bottom', 'top'] : ['left', 'right']
  const Item = ({ name, side, color, arrow }) => (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6 }}>
      <Box sx={{ width: 9, height: 9, borderRadius: '2px', bgcolor: color, flexShrink: 0 }} />
      <Typography component="span" sx={{ fontSize: 11.5, color: 'text.secondary' }}>
        <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>{name}</Box>
        {` ${arrow} ${side} axis`}
      </Typography>
    </Box>
  )
  return (
    <Box sx={{
      display: 'inline-flex', gap: 2, flexWrap: 'wrap', mb: 1,
      px: 1.25, py: 0.6, borderRadius: 2, bgcolor: 'rgba(42,37,32,0.035)',
    }}>
      <Item name={left}  side={a} color={leftColor}  arrow="◀" />
      <Item name={right} side={b} color={rightColor} arrow="▶" />
    </Box>
  )
}
