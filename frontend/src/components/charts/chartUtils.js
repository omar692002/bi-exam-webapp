// Warm editorial chart palette — burgundy, sage, terracotta, gold, dusty blue, plum, warm gray
export const COLORS = ['#7B2D3B', '#6E8060', '#C2703D', '#C9A227', '#5B7B9A', '#7A5C7E', '#A89B8C']

export const tickFmt = v =>
  Math.abs(v) >= 1e6 ? (v / 1e6).toFixed(1) + 'M'
  : Math.abs(v) >= 1e3 ? (v / 1e3).toFixed(0) + 'K'
  : String(v)

// Compact number for labels / tables: 1.2M | 82.3K | 42
export const fmtNum = v => {
  if (typeof v !== 'number' || Number.isNaN(v)) return v ?? ''
  const abs = Math.abs(v)
  if (abs >= 1e6) return (v / 1e6).toFixed(1) + 'M'
  if (abs >= 1e3) return (v / 1e3).toFixed(1) + 'K'
  return v.toLocaleString(undefined, { maximumFractionDigits: 1 })
}

export const fmtCurrency = v =>
  '$' + (typeof v === 'number' ? v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : v)

export function toChartRows(labels, series) {
  return labels.map((name, i) => {
    const row = { name }
    series.forEach(s => { row[s.name] = s.data[i] ?? 0 })
    return row
  })
}

// Map a 0..1 ratio onto a warm cream→burgundy heat ramp.
export function heatColor(ratio) {
  const t = Math.max(0, Math.min(1, ratio))
  // cream (250,248,243) → burgundy (123,45,59)
  const r = Math.round(250 + (123 - 250) * t)
  const g = Math.round(248 + (45 - 248) * t)
  const b = Math.round(243 + (59 - 243) * t)
  return `rgb(${r},${g},${b})`
}
