import { Card, CardContent, Typography } from '@mui/material'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { COLORS } from './chartUtils'

export default function PieChartCard({ data }) {
  const pieData = data.labels.map((name, i) => ({
    name,
    value: data.series[0]?.data[i] ?? 0,
  }))

  return (
    <Card elevation={0} variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>{data.title}</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={v => v?.toLocaleString()} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
