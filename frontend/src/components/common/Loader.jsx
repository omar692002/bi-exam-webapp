import { Card, CardContent, Skeleton } from '@mui/material'

export default function Loader({ height = 300 }) {
  return (
    <Card elevation={0} variant="outlined">
      <CardContent>
        <Skeleton variant="text" width="45%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="rounded" width="100%" height={height} />
      </CardContent>
    </Card>
  )
}
