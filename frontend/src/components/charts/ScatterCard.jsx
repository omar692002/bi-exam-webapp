import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { Box, Typography } from '@mui/material'
import ChartCard from './ChartCard'
import { COLORS, tickFmt, fmtNum } from './chartUtils'

/**
 * Bubble scatter from a ChartDataDto whose series are [Revenue, Quantity, Order Lines].
 * x = Quantity (volume), y = Revenue, bubble size = Order Lines.
 */
export default function ScatterCard({ data, height = 420, subtitle }) {
  const [rev, qty, lines] = data.series
  const points = data.labels.map((name, i) => ({
    name,
    x: qty?.data[i] ?? 0,
    y: rev?.data[i] ?? 0,
    z: lines?.data[i] ?? 1,
  }))

  const TooltipBox = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const p = payload[0].payload
    return (
      <Box sx={{ bgcolor: '#2A2520', color: '#fff', p: 1.25, borderRadius: 2, fontSize: 12 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 0.5 }}>{p.name}</Typography>
        <div>Revenue: {fmtNum(p.y)}</div>
        <div>Units: {fmtNum(p.x)}</div>
        <div>Order lines: {fmtNum(p.z)}</div>
      </Box>
    )
  }

  return (
    <ChartCard
      title={data.title} subtitle={subtitle}
      hint="Bubble size = order lines"
      empty={!points.length} emptyHeight={height - 40}
    >
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 12, right: 24, left: 12, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ECE5DA" />
          <XAxis type="number" dataKey="x" name="Units" tickFormatter={tickFmt} tick={{ fontSize: 11, fill: '#6B6258' }}
            label={{ value: 'Units sold', position: 'insideBottom', offset: -12, fontSize: 12, fill: '#6B6258' }} />
          <YAxis type="number" dataKey="y" name="Revenue" tickFormatter={tickFmt} tick={{ fontSize: 11, fill: '#6B6258' }}
            label={{ value: 'Revenue', angle: -90, position: 'insideLeft', fontSize: 12, fill: '#6B6258' }} />
          <ZAxis type="number" dataKey="z" range={[60, 520]} name="Order lines" />
          <Tooltip content={<TooltipBox />} cursor={{ strokeDasharray: '3 3' }} />
          <Scatter data={points} fillOpacity={0.72}>
            {points.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
