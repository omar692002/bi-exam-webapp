import { Card, CardContent, Typography } from '@mui/material'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#00897b']

const tickFmt = v =>
  v >= 1e6 ? (v / 1e6).toFixed(1) + 'M'
  : v >= 1e3 ? (v / 1e3).toFixed(0) + 'K'
  : String(v)

function toChartRows(labels, series) {
  return labels.map((name, i) => {
    const row = { name }
    series.forEach(s => { row[s.name] = s.data[i] ?? 0 })
    return row
  })
}

export function BarChartCard({ data, title, horizontal = false }) {
  const rows = toChartRows(data.labels, data.series)
  return (
    <Card sx={{ height: '100%' }} elevation={2}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          {title || data.title}
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={rows}
            layout={horizontal ? 'vertical' : 'horizontal'}
            margin={{ top: 5, right: 20, left: 10, bottom: horizontal ? 5 : 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            {horizontal ? (
              <>
                <XAxis type="number" tickFormatter={tickFmt} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} />
              </>
            ) : (
              <>
                <XAxis dataKey="name" angle={-40} textAnchor="end" tick={{ fontSize: 10 }} interval={0} />
                <YAxis tickFormatter={tickFmt} />
              </>
            )}
            <Tooltip formatter={v => v?.toLocaleString()} />
            <Legend />
            {data.series.map((s, i) => (
              <Bar key={s.name} dataKey={s.name} fill={COLORS[i % COLORS.length]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function LineChartCard({ data, title }) {
  const rows = toChartRows(data.labels, data.series)
  return (
    <Card sx={{ height: '100%' }} elevation={2}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          {title || data.title}
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={rows} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={tickFmt} />
            <Tooltip formatter={v => v?.toLocaleString()} />
            <Legend />
            {data.series.map((s, i) => (
              <Line
                key={s.name}
                type="monotone"
                dataKey={s.name}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function PieChartCard({ data, title }) {
  const pieData = data.labels.map((name, i) => ({
    name,
    value: data.series[0]?.data[i] ?? 0
  }))
  return (
    <Card sx={{ height: '100%' }} elevation={2}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          {title || data.title}
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={v => v?.toLocaleString()} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
