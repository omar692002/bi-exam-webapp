import { Card, CardContent, Typography } from '@mui/material'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { COLORS, tickFmt, toChartRows } from './chartUtils'

export default function BarChartCard({ data, horizontal = false }) {
  const rows = toChartRows(data.labels, data.series)

  return (
    <Card elevation={0} variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>{data.title}</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={rows}
            layout={horizontal ? 'vertical' : 'horizontal'}
            margin={{ top: 5, right: 20, left: 10, bottom: horizontal ? 5 : 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            {horizontal ? (
              <>
                <XAxis type="number" tickFormatter={tickFmt} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
              </>
            ) : (
              <>
                <XAxis dataKey="name" angle={-40} textAnchor="end" tick={{ fontSize: 10 }} interval={0} />
                <YAxis tickFormatter={tickFmt} tick={{ fontSize: 11 }} />
              </>
            )}
            <Tooltip formatter={v => v?.toLocaleString()} />
            <Legend />
            {data.series.map((s, i) => (
              <Bar
                key={s.name}
                dataKey={s.name}
                fill={COLORS[i % COLORS.length]}
                radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
