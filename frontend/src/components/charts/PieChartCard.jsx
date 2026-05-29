import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import ChartCard from './ChartCard'
import { COLORS, fmtNum } from './chartUtils'

export default function PieChartCard({ data, height = 360, subtitle, donut = true }) {
  const pieData = data.labels.map((name, i) => ({ name, value: data.series[0]?.data[i] ?? 0 }))
  const total = pieData.reduce((s, d) => s + d.value, 0)

  return (
    <ChartCard title={data.title} subtitle={subtitle} empty={!data.labels.length} emptyHeight={height - 40}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
            innerRadius={donut ? 66 : 0} outerRadius={112} paddingAngle={donut ? 3 : 1}
            stroke="#fff" strokeWidth={2}
          >
            {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v, n) => [`${fmtNum(v)} (${total ? ((v / total) * 100).toFixed(1) : 0}%)`, n]} />
          <Legend iconType="circle" iconSize={9} wrapperStyle={{ paddingTop: 14, fontSize: 12.5 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
