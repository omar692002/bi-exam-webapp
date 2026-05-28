import { Box, Card, CardContent, Typography } from '@mui/material'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { COLORS } from './chartUtils'

export default function PieChartCard({ data }) {
  const pieData = data.labels.map((name, i) => ({
    name,
    value: data.series[0]?.data[i] ?? 0,
  }))

  if (data.labels.length === 0) {
    return (
      <Card elevation={0} variant="outlined" sx={{ height: '100%', overflow: 'visible' }}>
        <CardContent sx={{ p: 3.5, '&:last-child': { pb: 3.5 } }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2.5 }}>{data.title}</Typography>
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: 360, color: 'text.disabled',
          }}>
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>No data for this selection</Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card elevation={0} variant="outlined" sx={{ height: '100%', overflow: 'visible' }}>
      <CardContent sx={{ p: 3.5, '&:last-child': { pb: 3.5 } }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2.5 }}>{data.title}</Typography>
        <ResponsiveContainer width="100%" height={420}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={120}
              paddingAngle={3}
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={v => v?.toLocaleString()} />
            <Legend wrapperStyle={{ paddingTop: 16 }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
