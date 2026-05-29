import {
  ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import ChartCard from './ChartCard'
import AxisKey from './AxisKey'
import { COLORS, tickFmt, toChartRows } from './chartUtils'

/**
 * Year-to-date view: monthly Revenue (bars, left axis) + Cumulative (area, right axis).
 * Expects series [Monthly Revenue, Cumulative].
 */
export default function AreaChartCard({ data, height = 380, subtitle }) {
  const rows = toChartRows(data.labels, data.series)
  const monthly = data.series[0]?.name ?? 'Monthly Revenue'
  const cumulative = data.series[1]?.name ?? 'Cumulative'

  return (
    <ChartCard
      title={data.title} subtitle={subtitle}
      axisKey={<AxisKey left={monthly} right={cumulative} leftColor={COLORS[0]} rightColor={COLORS[2]} />}
      empty={!data.labels.length} emptyHeight={height - 40}
    >
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={rows} margin={{ top: 8, right: 16, left: 12, bottom: 56 }}>
          <defs>
            <linearGradient id="ytdFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={COLORS[2]} stopOpacity={0.35} />
              <stop offset="100%" stopColor={COLORS[2]} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ECE5DA" vertical={false} />
          <XAxis dataKey="name" angle={-38} textAnchor="end" tick={{ fontSize: 10, fill: '#6B6258' }} interval={0} height={62} />
          <YAxis yAxisId="left" tickFormatter={tickFmt} tick={{ fontSize: 11, fill: '#6B6258' }} width={56} />
          <YAxis yAxisId="right" orientation="right" tickFormatter={tickFmt} tick={{ fontSize: 11, fill: COLORS[2] }} width={56} />
          <Tooltip formatter={v => v?.toLocaleString()} cursor={{ fill: 'rgba(123,45,59,0.06)' }} />
          <Legend iconType="circle" iconSize={9} wrapperStyle={{ paddingTop: 14, fontSize: 12.5 }} />
          <Bar yAxisId="left" dataKey={monthly} fill={COLORS[0]} radius={[5, 5, 0, 0]} maxBarSize={40} />
          <Area yAxisId="right" type="monotone" dataKey={cumulative} stroke={COLORS[2]} strokeWidth={2.5} fill="url(#ytdFill)" />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
