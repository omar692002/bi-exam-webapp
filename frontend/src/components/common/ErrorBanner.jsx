import { Alert, AlertTitle } from '@mui/material'

export default function ErrorBanner({ errors }) {
  if (!errors?.length) return null
  return (
    <Alert severity="error" variant="outlined" sx={{ mb: 3, borderRadius: 3 }}>
      <AlertTitle sx={{ fontWeight: 700 }}>Backend unreachable</AlertTitle>
      {errors[0]} — make sure the API is running on <code>localhost:8080</code>.
    </Alert>
  )
}
