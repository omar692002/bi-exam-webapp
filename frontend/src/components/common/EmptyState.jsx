import { Box, Typography } from '@mui/material'
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded'

export default function EmptyState({ height = 280, message = 'No data for this selection' }) {
  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height, color: 'text.disabled', gap: 1,
    }}>
      <SearchOffRoundedIcon sx={{ fontSize: 34, opacity: 0.5 }} />
      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>{message}</Typography>
    </Box>
  )
}
