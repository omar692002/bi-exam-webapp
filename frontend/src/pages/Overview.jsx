import { useData } from '../hooks/useData'
import { usePeriodData } from '../hooks/usePeriodData'
import * as api from '../api'
import Section, { CardGrid } from '../components/common/Section'
import DataSlot from '../components/common/DataSlot'
import InsightStrip, { deriveInsights } from '../components/common/InsightStrip'
import KpiRow from '../components/kpi/KpiRow'
import ComboChartCard from '../components/charts/ComboChartCard'
import BarChartCard from '../components/charts/BarChartCard'
import HeatmapCard from '../components/charts/HeatmapCard'
import DataTable from '../components/tables/DataTable'

export default function Overview() {
  const overTime = useData(api.getRevenueOverTime, [])
  const byCategory = usePeriodData(api.getSalesByCategory)
  const heatmap = usePeriodData(api.getRevenueHeatmap)
  const topCustomers = usePeriodData((y, q, m) => api.getTopCustomers(5, y, q, m))
  const topProducts = usePeriodData((y, q, m) => api.getTopProducts(5, y, q, m))

  const insights = byCategory.data ? deriveInsights(byCategory.data, { unit: 'USD', noun: 'categories' }) : []

  return (
    <>
      <Section title="Key Metrics" subtitle="Headline measures from cube VDS — deltas compare to the same period last year" dense>
        <KpiRow />
      </Section>

      {insights.length > 0 && (
        <Section dense>
          <InsightStrip items={insights} />
        </Section>
      )}

      <Section title="Revenue Momentum" dense>
        <DataSlot state={overTime} height={420}>
          {d => <ComboChartCard data={d} height={400} subtitle="Revenue & units across all periods" />}
        </DataSlot>
      </Section>

      <Section title="At a Glance" dense>
        <CardGrid cols="1.2fr 1fr" gap={3}>
          <DataSlot state={byCategory} height={460}>
            {d => <BarChartCard data={d} horizontal subtitle="Revenue & units by category" />}
          </DataSlot>
          <DataSlot state={heatmap} height={460}>
            {d => <HeatmapCard data={d} subtitle="Revenue concentration by quarter" />}
          </DataSlot>
        </CardGrid>
      </Section>

      <Section title="Top Performers" dense>
        <CardGrid cols="1fr 1fr" gap={3}>
          <DataSlot state={topCustomers} height={300}>{d => <DataTable data={d} maxHeight={320} />}</DataSlot>
          <DataSlot state={topProducts} height={300}>{d => <DataTable data={d} maxHeight={320} />}</DataSlot>
        </CardGrid>
      </Section>
    </>
  )
}
