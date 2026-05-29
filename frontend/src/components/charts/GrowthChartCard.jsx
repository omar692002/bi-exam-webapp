import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts'
import ChartCard from './ChartCard'
import AxisKey from './AxisKey'
import { COLORS, tickFmt, toChartRows } from './chartUtils'

/**
 * Year-over-year growth: Revenue bars (left axis) + YoY Growth % line (right axis),
 * with a zero reference line. Expects series [Revenue, YoY Growth %].
 */
export default function GrowthChartCard({ data, height = 380, subtitle }) {
  const rows = toChartRows(data.labels, data.series)
  const revKey = data.series[0]?.name ?? 'Revenue'
  const growthKey = data.series[1]?.name ?? 'YoY Growth %'

  return (
    <ChartCard
      title={data.title} subtitle={subtitle}
      axisKey={<AxisKey left={revKey} right={growthKey} leftColor={COLORS[0]} rightColor={COLORS[2]} />}
      empty={!data.labels.length} emptyHeight={height - 40}
    >
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={rows} margin={{ top: 12, right: 18, left: 12, bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ECE5DA" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B6258' }} />
          <YAxis yAxisId="left" tickFormatter={tickFmt} tick={{ fontSize: 11, fill: '#6B6258' }} width={56} />
          <YAxis yAxisId="right" orientation="right" tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fill: COLORS[2] }} width={48} />
          <Tooltip formatter={(v, n) => (n === growthKey ? [`${v}%`, n] : [v?.toLocaleString(), n])} cursor={{ fill: 'rgba(123,45,59,0.06)' }} />
          <Legend iconType="circle" iconSize={9} wrapperStyle={{ paddingTop: 12, fontSize: 12.5 }} />
          <ReferenceLine yAxisId="right" y={0} stroke="#C9BCA9" strokeDasharray="4 4" />
          <Bar yAxisId="left" dataKey={revKey} fill={COLORS[0]} radius={[5, 5, 0, 0]} maxBarSize={54} />
          <Line yAxisId="right" type="monotone" dataKey={growthKey} stroke={COLORS[2]} strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }}>
            {rows.map((r, i) => <Cell key={i} fill={r[growthKey] >= 0 ? COLORS[1] : COLORS[0]} />)}
          </Line>
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
