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

  const ratio = data.series.length >= 2
    ? seriesMax([data.series[0]]) / seriesMax([data.series[1]])
    : 1

  // Vertical bar chart: dual Y-axes when scales differ by more than 5×
  const dual  = !horizontal && data.series.length >= 2 && (ratio > 5 || ratio < 0.2)
  // Horizontal bar chart: dual X-axes (bottom + top) for the same reason
  const dualH =  horizontal && data.series.length >= 2 && (ratio > 5 || ratio < 0.2)

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

  return (
    <Card elevation={0} variant="outlined" sx={{ width: '100%', height: '100%', overflow: 'visible' }}>
      <CardContent sx={{ p: 4, '&:last-child': { pb: 4 } }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>{data.title}</Typography>
        <Box sx={{ width: '100%', minWidth: 420, overflowX: 'auto' }}>
          <ResponsiveContainer width="100%" height={horizontal ? 580 : 520}>
            <BarChart
              data={rows}
              layout={horizontal ? 'vertical' : 'horizontal'}
              barCategoryGap="20%"
              margin={{
                top:    dualH ? 36 : 8,
                right:  dual  ? 85 : 30,
                left:   dual  ? 45 : 20,
                bottom: horizontal ? 8 : 100,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

              {dualH ? (
                // Horizontal + dual scale: bottom axis for series[0], top axis for series[1]
                <>
                  <XAxis
                    xAxisId="main"
                    type="number"
                    orientation="bottom"
                    tickFormatter={tickFmt}
                    tick={{ fontSize: 11 }}
                  />
                  <XAxis
                    xAxisId="secondary"
                    type="number"
                    orientation="top"
                    tickFormatter={tickFmt}
                    tick={{ fontSize: 11, fill: COLORS[1] }}
                    stroke={COLORS[1]}
                  />
                  <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
                </>
              ) : horizontal ? (
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
                  // Make the secondary series thinner so both are clearly visible
                  maxBarSize={dualH && i > 0 ? 10 : horizontal ? 32 : undefined}
                  hide={!!hidden[s.name]}
                  {...(dual  ? { yAxisId: i === 0 ? 'left'      : 'right'     } : {})}
                  {...(dualH ? { xAxisId: i === 0 ? 'main'      : 'secondary' } : {})}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
}
