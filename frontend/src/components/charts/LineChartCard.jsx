import { Card, CardContent, Typography } from '@mui/material'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { COLORS, tickFmt, toChartRows } from './chartUtils'

export default function LineChartCard({ data }) {
  const rows = toChartRows(data.labels, data.series)

  return (
    <Card elevation={0} variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>{data.title}</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={rows} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={tickFmt} tick={{ fontSize: 11 }} />
            <Tooltip formatter={v => v?.toLocaleString()} />
            <Legend />
            {data.series.map((s, i) => (
              <Line
                key={s.name}
                type="monotone"
                dataKey={s.name}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2.5}
                dot={{ r: 4, fill: COLORS[i % COLORS.length] }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
