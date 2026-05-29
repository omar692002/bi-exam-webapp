import { useState } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import ChartCard from './ChartCard'
import AxisKey from './AxisKey'
import { COLORS, tickFmt, toChartRows } from './chartUtils'

const seriesMax = s => Math.max(1, ...(s?.data ?? [1]))

export default function ComboChartCard({ data, height = 420, subtitle, onSelect }) {
  const [hidden, setHidden] = useState({})
  const toggleSeries = ({ dataKey }) => setHidden(h => ({ ...h, [dataKey]: !h[dataKey] }))

  const rows = toChartRows(data.labels, data.series)
  const ratio = data.series.length >= 2 ? seriesMax(data.series[0]) / seriesMax(data.series[1]) : 1
  const dual = data.series.length >= 2 && (ratio > 5 || ratio < 0.2)

  const handleClick = onSelect
    ? state => { const lbl = state?.activeLabel; if (lbl) onSelect(lbl) }
    : undefined

  return (
    <ChartCard
      title={data.title}
      subtitle={subtitle}
      hint={onSelect ? 'Click a bar to drill in' : undefined}
      axisKey={dual && data.series.length >= 2
        ? <AxisKey left={data.series[0].name} right={data.series[1].name} leftColor={COLORS[0]} rightColor={COLORS[1]} />
        : undefined}
      empty={!data.labels.length}
      emptyHeight={height - 40}
    >
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={rows}
          onClick={handleClick}
          margin={{ top: 8, right: 24, left: 16, bottom: 72 }}
          style={onSelect ? { cursor: 'pointer' } : undefined}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ECE5DA" vertical={false} />
          <XAxis dataKey="name" angle={-38} textAnchor="end" tick={{ fontSize: 10, fill: '#6B6258' }} interval={0} height={78} />

          {dual ? (
            <>
              <YAxis yAxisId="left"  tickFormatter={tickFmt} tick={{ fontSize: 11, fill: '#6B6258' }} width={58} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={tickFmt} tick={{ fontSize: 11, fill: COLORS[1] }} width={54} />
            </>
          ) : (
            <YAxis tickFormatter={tickFmt} tick={{ fontSize: 11, fill: '#6B6258' }} />
          )}

          <Tooltip formatter={v => v?.toLocaleString()} cursor={{ fill: 'rgba(123,45,59,0.06)' }} />
          <Legend
            iconType="circle" iconSize={9} onClick={toggleSeries}
            wrapperStyle={{ paddingTop: 18, fontSize: 12.5, cursor: 'pointer' }}
            formatter={v => <span style={{ opacity: hidden[v] ? 0.4 : 1, color: '#2A2520' }}>{v}</span>}
          />

          {data.series[0] && (
            <Bar
              dataKey={data.series[0].name}
              fill={COLORS[0]} radius={[5, 5, 0, 0]} maxBarSize={46}
              hide={!!hidden[data.series[0].name]}
              {...(dual ? { yAxisId: 'left' } : {})}
            />
          )}
          {data.series.slice(1).map((s, i) => (
            <Line
              key={s.name} type="monotone" dataKey={s.name}
              stroke={COLORS[(i + 1) % COLORS.length]} strokeWidth={2.5}
              dot={{ r: 3, fill: COLORS[(i + 1) % COLORS.length] }} activeDot={{ r: 6 }}
              hide={!!hidden[s.name]}
              {...(dual ? { yAxisId: 'right' } : {})}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
