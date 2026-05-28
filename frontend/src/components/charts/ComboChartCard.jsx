import { useState } from 'react'
import { Box, Card, CardContent, Typography } from '@mui/material'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { COLORS, tickFmt, toChartRows } from './chartUtils'

function seriesMax(s) { return Math.max(1, ...(s?.data ?? [1])) }

export default function ComboChartCard({ data }) {
  const [hidden, setHidden] = useState({})
  const toggleSeries = ({ dataKey }) =>
    setHidden(h => ({ ...h, [dataKey]: !h[dataKey] }))

  const rows = toChartRows(data.labels, data.series)

  // Use dual Y-axes when the two series differ by more than 5× — e.g. Revenue ($M) vs Units (K)
  const ratio = data.series.length >= 2
    ? seriesMax(data.series[0]) / seriesMax(data.series[1])
    : 1
  const dual = data.series.length >= 2 && (ratio > 5 || ratio < 0.2)

  if (data.labels.length === 0) {
    return (
      <Card elevation={0} variant="outlined" sx={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <CardContent sx={{ p: 4, '&:last-child': { pb: 4 } }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>{data.title}</Typography>
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: 400, color: 'text.disabled',
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
        <ResponsiveContainer width="100%" height={440}>
          <ComposedChart data={rows} margin={{ top: 8, right: dual ? 75 : 30, left: 20, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              angle={-40}
              textAnchor="end"
              tick={{ fontSize: 10 }}
              interval={0}
              height={80}
            />

            {dual ? (
              <>
                <YAxis
                  yAxisId="left"
                  tickFormatter={tickFmt}
                  tick={{ fontSize: 11 }}
                  width={65}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={tickFmt}
                  tick={{ fontSize: 11 }}
                  width={65}
                />
              </>
            ) : (
              <YAxis tickFormatter={tickFmt} tick={{ fontSize: 11 }} />
            )}

            <Tooltip formatter={v => v?.toLocaleString()} />
            <Legend
              layout="horizontal"
              align="center"
              iconSize={10}
              onClick={toggleSeries}
              wrapperStyle={{ paddingTop: 24, fontSize: 12, cursor: 'pointer' }}
              formatter={(value) => (
                <span style={{ opacity: hidden[value] ? 0.4 : 1 }}>{value}</span>
              )}
            />

            {/* First series → bars (left axis when dual) */}
            {data.series[0] && (
              <Bar
                dataKey={data.series[0].name}
                fill={COLORS[0]}
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
                hide={!!hidden[data.series[0].name]}
                {...(dual ? { yAxisId: 'left' } : {})}
              />
            )}

            {/* Remaining series → lines (right axis when dual) */}
            {data.series.slice(1).map((s, i) => (
              <Line
                key={s.name}
                type="monotone"
                dataKey={s.name}
                stroke={COLORS[i + 1]}
                strokeWidth={2.5}
                dot={{ r: 4, fill: COLORS[i + 1] }}
                activeDot={{ r: 6 }}
                hide={!!hidden[s.name]}
                {...(dual ? { yAxisId: 'right' } : {})}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
