import { Card, CardContent, Skeleton } from '@mui/material'

export default function Loader({ height = 300 }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Skeleton variant="text" width="40%" height={26} sx={{ mb: 2, bgcolor: 'rgba(123,45,59,0.07)' }} />
        <Skeleton variant="rounded" width="100%" height={height} sx={{ bgcolor: 'rgba(42,37,32,0.04)' }} />
      </CardContent>
    </Card>
  )
}
