import { useState } from 'react'
import { Box, Card, CardContent, Typography } from '@mui/material'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { COLORS, tickFmt, toChartRows } from './chartUtils'

function seriesMax(series) {
  return Math.max(1, ...series.flatMap(s => s.data))
}

export default function BarChartCard({ data, horizontal = false }) {
  const [hidden, setHidden] = useState({})
  const toggleSeries = ({ dataKey }) =>
    setHidden(h => ({ ...h, [dataKey]: !h[dataKey] }))

  const rows = toChartRows(data.labels, data.series)

  if (data.labels.length === 0) {
    return (
      <Card elevation={0} variant="outlined" sx={{ width: '100%', height: '100%' }}>
        <CardContent sx={{ p: 4, '&:last-child': { pb: 4 } }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>{data.title}</Typography>
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: 260, color: 'text.disabled', flexDirection: 'column', gap: 1,
          }}>
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>No data for this selection</Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  // Dual-axis when the two series differ by more than 5×  (either direction)
  const ratio = data.series.length >= 2
    ? seriesMax([data.series[0]]) / seriesMax([data.series[1]])
    : 1
  const dual = !horizontal && data.series.length >= 2 && (ratio > 5 || ratio < 0.2)

  return (
    <Card elevation={0} variant="outlined" sx={{ width: '100%', height: '100%', overflow: 'visible' }}>
      <CardContent sx={{ p: 4, '&:last-child': { pb: 4 } }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>{data.title}</Typography>
        {/* minWidth prevents ResponsiveContainer from measuring 0 in a collapsed flex parent */}
        <Box sx={{ width: '100%', minWidth: 420, overflowX: 'auto' }}>
          <ResponsiveContainer width="100%" height={horizontal ? 580 : 520}>
            <BarChart
              data={rows}
              layout={horizontal ? 'vertical' : 'horizontal'}
              barCategoryGap="20%"
              margin={{ top: 8, right: dual ? 85 : 30, left: dual ? 45 : 20, bottom: horizontal ? 8 : 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

              {horizontal ? (
                <>
                  <XAxis type="number" tickFormatter={tickFmt} tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
                </>
              ) : dual ? (
                <>
                  <XAxis dataKey="name" angle={-40} textAnchor="end" tick={{ fontSize: 10 }} interval={0} height={80} />
                  <YAxis yAxisId="left"  width={70} tickFormatter={tickFmt} tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" width={70} orientation="right" tickFormatter={tickFmt} tick={{ fontSize: 11 }} />
                </>
              ) : (
                <>
                  <XAxis dataKey="name" angle={-40} textAnchor="end" tick={{ fontSize: 10 }} interval={0} height={80} />
                  <YAxis tickFormatter={tickFmt} tick={{ fontSize: 11 }} />
                </>
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

              {data.series.map((s, i) => (
                <Bar
                  key={s.name}
                  dataKey={s.name}
                  fill={COLORS[i % COLORS.length]}
                  radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
                  maxBarSize={horizontal ? 32 : undefined}
                  hide={!!hidden[s.name]}
                  {...(dual ? { yAxisId: i === 0 ? 'left' : 'right' } : {})}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
}
