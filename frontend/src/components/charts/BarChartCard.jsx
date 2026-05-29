import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts'
import ChartCard from './ChartCard'
import AxisKey from './AxisKey'
import { COLORS, tickFmt, toChartRows } from './chartUtils'

const seriesMax = series => Math.max(1, ...series.flatMap(s => s.data))

export default function BarChartCard({
  data, horizontal = false, height, subtitle, onSelect, monochrome = false,
}) {
  const [hidden, setHidden] = useState({})
  const toggleSeries = ({ dataKey }) => setHidden(h => ({ ...h, [dataKey]: !h[dataKey] }))

  const rows = toChartRows(data.labels, data.series)
  const ratio = data.series.length >= 2 ? seriesMax([data.series[0]]) / seriesMax([data.series[1]]) : 1
  const dual  = !horizontal && data.series.length >= 2 && (ratio > 5 || ratio < 0.2)
  const dualH =  horizontal && data.series.length >= 2 && (ratio > 5 || ratio < 0.2)
  const H = height ?? (horizontal ? 540 : 460)

  const handleClick = onSelect
    ? state => { const lbl = state?.activeLabel; if (lbl) onSelect(lbl) }
    : undefined

  return (
    <ChartCard
      title={data.title}
      subtitle={subtitle}
      hint={onSelect ? 'Click a bar to drill in' : undefined}
      axisKey={(dual || dualH) && data.series.length >= 2
        ? <AxisKey
            left={data.series[0].name} right={data.series[1].name}
            leftColor={COLORS[0]} rightColor={COLORS[1]}
            orientation={dualH ? 'horizontal' : 'vertical'}
          />
        : undefined}
      empty={!data.labels.length}
      emptyHeight={H - 60}
    >
      <ResponsiveContainer width="100%" height={H}>
        <BarChart
          data={rows}
          layout={horizontal ? 'vertical' : 'horizontal'}
          barCategoryGap="22%"
          onClick={handleClick}
          margin={{ top: dualH ? 34 : 8, right: dual ? 80 : 24, left: dual ? 40 : 12, bottom: horizontal ? 8 : 96 }}
          style={onSelect ? { cursor: 'pointer' } : undefined}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ECE5DA" vertical={!horizontal} horizontal={horizontal} />

          {dualH ? (
            <>
              <XAxis xAxisId="main" type="number" orientation="bottom" tickFormatter={tickFmt} tick={{ fontSize: 11, fill: '#6B6258' }} />
              <XAxis xAxisId="secondary" type="number" orientation="top" tickFormatter={tickFmt} tick={{ fontSize: 11, fill: COLORS[1] }} stroke={COLORS[1]} />
              <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11, fill: '#6B6258' }} />
            </>
          ) : horizontal ? (
            <>
              <XAxis type="number" tickFormatter={tickFmt} tick={{ fontSize: 11, fill: '#6B6258' }} />
              <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11, fill: '#6B6258' }} />
            </>
          ) : dual ? (
            <>
              <XAxis dataKey="name" angle={-38} textAnchor="end" tick={{ fontSize: 10, fill: '#6B6258' }} interval={0} height={92} />
              <YAxis yAxisId="left"  width={64} tickFormatter={tickFmt} tick={{ fontSize: 11, fill: '#6B6258' }} />
              <YAxis yAxisId="right" width={64} orientation="right" tickFormatter={tickFmt} tick={{ fontSize: 11, fill: COLORS[1] }} />
            </>
          ) : (
            <>
              <XAxis dataKey="name" angle={-38} textAnchor="end" tick={{ fontSize: 10, fill: '#6B6258' }} interval={0} height={92} />
              <YAxis tickFormatter={tickFmt} tick={{ fontSize: 11, fill: '#6B6258' }} />
            </>
          )}

          <Tooltip formatter={v => v?.toLocaleString()} cursor={{ fill: 'rgba(123,45,59,0.06)' }} />
          <Legend
            iconType="circle" iconSize={9} onClick={toggleSeries}
            wrapperStyle={{ paddingTop: 18, fontSize: 12.5, cursor: 'pointer' }}
            formatter={v => <span style={{ opacity: hidden[v] ? 0.4 : 1, color: '#2A2520' }}>{v}</span>}
          />

          {data.series.map((s, i) => (
            <Bar
              key={s.name}
              dataKey={s.name}
              fill={COLORS[i % COLORS.length]}
              radius={horizontal ? [0, 5, 5, 0] : [5, 5, 0, 0]}
              maxBarSize={dualH && i > 0 ? 10 : horizontal ? 30 : 56}
              hide={!!hidden[s.name]}
              {...(dual  ? { yAxisId: i === 0 ? 'left' : 'right' } : {})}
              {...(dualH ? { xAxisId: i === 0 ? 'main' : 'secondary' } : {})}
            >
              {/* Single-series charts get a subtle gradient of the same hue per bar */}
              {monochrome && data.series.length === 1 && rows.map((_, ri) => (
                <Cell key={ri} fillOpacity={0.55 + 0.45 * (1 - ri / Math.max(1, rows.length - 1))} />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
