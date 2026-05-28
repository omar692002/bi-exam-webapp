import { Box, Card, CardContent, Typography } from '@mui/material'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { COLORS, tickFmt, toChartRows } from './chartUtils'

export default function ComboChartCard({ data }) {
  const rows = toChartRows(data.labels, data.series)

  if (data.labels.length === 0) {
    return (
      <Card elevation={0} variant="outlined" sx={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <CardContent sx={{ p: 4, '&:last-child': { pb: 4 } }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>{data.title}</Typography>
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: 460, color: 'text.disabled',
          }}>
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>No data for this selection</Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card elevation={0} variant="outlined" sx={{ width: '100%', height: '100%', overflow: 'visible' }}>
      <CardContent sx={{ p: 4, '&:last-child': { pb: 4 } }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>{data.title}</Typography>
        <ResponsiveContainer width="100%" height={520}>
          <ComposedChart data={rows} margin={{ top: 8, right: 30, left: 20, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              angle={-40}
              textAnchor="end"
              tick={{ fontSize: 10 }}
              interval={0}
              height={80}
            />
            <YAxis tickFormatter={tickFmt} tick={{ fontSize: 11 }} />
            <Tooltip formatter={v => v?.toLocaleString()} />
            <Legend
              layout="horizontal"
              align="center"
              iconSize={10}
              wrapperStyle={{ paddingTop: 24, fontSize: 12 }}
            />

            {/* First series → bars */}
            {data.series[0] && (
              <Bar
                dataKey={data.series[0].name}
                fill={COLORS[0]}
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            )}

            {/* Remaining series → lines connecting the bars */}
            {data.series.slice(1).map((s, i) => (
              <Line
                key={s.name}
                type="monotone"
                dataKey={s.name}
                stroke={COLORS[i + 1]}
                strokeWidth={2.5}
                dot={{ r: 4, fill: COLORS[i + 1] }}
                activeDot={{ r: 6 }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
