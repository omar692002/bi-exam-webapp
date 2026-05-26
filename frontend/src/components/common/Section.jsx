import { Box, Divider, Typography } from '@mui/material'

export default function Section({ title, children }) {
  return (
    <Box mb={4}>
      <Typography variant="subtitle1" color="primary" mb={0.5}>
        {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {children}
    </Box>
  )
}
