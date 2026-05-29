import { Box, Typography } from '@mui/material'

export default function Section({ title, subtitle, action, children, dense = false }) {
  return (
    <Box sx={{ mb: dense ? 4 : 6 }}>
      {(title || action) && (
        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 2.5, gap: 2, flexWrap: 'wrap' }}>
          <Box>
            {title && (
              <Typography variant="h5" sx={{ fontSize: { xs: 20, md: 24 }, color: 'text.primary' }}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography sx={{ color: 'text.secondary', fontSize: 13.5, mt: 0.5 }}>{subtitle}</Typography>
            )}
          </Box>
          {action}
        </Box>
      )}
      {children}
    </Box>
  )
}

/** Responsive CSS-grid wrapper — `cols` is the md+ column template. */
export function CardGrid({ cols = '1fr 1fr', gap = 3, children, sx }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: cols }, gap, alignItems: 'stretch', ...sx }}>
      {children}
    </Box>
  )
}
