import { Box, Divider, Typography } from '@mui/material'

export default function Section({ title, children }) {
  return (
    <Box mb={6}>
      <Typography variant="subtitle1" color="primary" mb={0.75}>
        {title}
      </Typography>
      <Divider sx={{ mb: 3 }} />
      {children}
    </Box>
  )
}
