import { Alert } from '@mui/material'

export default function ErrorBanner({ errors }) {
  if (!errors.length) return null
  return (
    <Alert severity="error" sx={{ mb: 3 }}>
      Backend unreachable: {errors[0]}. Make sure Quarkus is running on port 8080.
    </Alert>
  )
}
