export const COLORS = ['#1e3a5f', '#0ea5e9', '#10b981', '#f59e0b', '#6366f1', '#ef4444', '#8b5cf6']

export const tickFmt = v =>
  v >= 1e6 ? (v / 1e6).toFixed(1) + 'M'
  : v >= 1e3 ? (v / 1e3).toFixed(0) + 'K'
  : String(v)

export function toChartRows(labels, series) {
  return labels.map((name, i) => {
    const row = { name }
    series.forEach(s => { row[s.name] = s.data[i] ?? 0 })
    return row
  })
}
