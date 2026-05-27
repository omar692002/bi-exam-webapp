import { Card, CardContent, Typography } from '@mui/material'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { COLORS, tickFmt, toChartRows } from './chartUtils'

function seriesMax(series) {
  return Math.max(1, ...series.flatMap(s => s.data))
}

export default function LineChartCard({ data }) {
  const rows  = toChartRows(data.labels, data.series)

  const ratio = data.series.length >= 2
    ? seriesMax([data.series[0]]) / seriesMax([data.series[1]])
    : 1
  const dual  = data.series.length >= 2 && (ratio > 5 || ratio < 0.2)

  return (
    <Card elevation={0} variant="outlined" sx={{ height: '100%', overflow: 'visible' }}>
      <CardContent sx={{ p: 4, '&:last-child': { pb: 4 } }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>{data.title}</Typography>
        <ResponsiveContainer width="100%" height={520}>
          <LineChart data={rows} margin={{ top: 8, right: dual ? 85 : 30, left: dual ? 45 : 20, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            {dual ? (
              <>
                <YAxis yAxisId="left"  width={70} tickFormatter={tickFmt} tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" width={70} orientation="right" tickFormatter={tickFmt} tick={{ fontSize: 11 }} />
              </>
            ) : (
              <YAxis tickFormatter={tickFmt} tick={{ fontSize: 11 }} />
            )}
            <Tooltip formatter={v => v?.toLocaleString()} />
            <Legend
              layout="horizontal"
              align="center"
              iconSize={10}
              wrapperStyle={{ paddingTop: 24, fontSize: 12 }}
            />
            {data.series.map((s, i) => (
              <Line
                key={s.name}
                type="monotone"
                dataKey={s.name}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2.5}
                dot={{ r: 4, fill: COLORS[i % COLORS.length] }}
                activeDot={{ r: 6 }}
                {...(dual ? { yAxisId: i === 0 ? 'left' : 'right' } : {})}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
