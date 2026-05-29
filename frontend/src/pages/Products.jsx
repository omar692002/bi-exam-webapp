import { usePeriodData } from '../hooks/usePeriodData'
import * as api from '../api'
import Section, { CardGrid } from '../components/common/Section'
import DataSlot from '../components/common/DataSlot'
import InsightStrip, { deriveInsights } from '../components/common/InsightStrip'
import BarChartCard from '../components/charts/BarChartCard'
import ScatterCard from '../components/charts/ScatterCard'
import DataTable from '../components/tables/DataTable'

export default function Products() {
  const byCategory = usePeriodData(api.getSalesByCategory)
  const byBrand    = usePeriodData(api.getSalesByProduct)
  const scatter    = usePeriodData((y, q, m) => api.getProductScatter(20, y, q, m))
  const top        = usePeriodData((y, q, m) => api.getTopProducts(10, y, q, m))

  const insights = byBrand.data ? deriveInsights(byBrand.data, { unit: 'USD', noun: 'brands' }) : []

  return (
    <>
      {insights.length > 0 && <Section dense><InsightStrip items={insights} /></Section>}

      <Section title="Product Mix" dense>
        <CardGrid cols="1fr 1fr" gap={3}>
          <DataSlot state={byCategory} height={460}>{d => <BarChartCard data={d} horizontal subtitle="Revenue by category" />}</DataSlot>
          <DataSlot state={byBrand}    height={460}>{d => <BarChartCard data={d} horizontal subtitle="Revenue by brand" />}</DataSlot>
        </CardGrid>
      </Section>

      <Section title="Price vs. Volume" subtitle="Each bubble is a brand — position shows units vs revenue, size shows order lines" dense>
        <DataSlot state={scatter} height={440}>{d => <ScatterCard data={d} />}</DataSlot>
      </Section>

      <Section title="Best Sellers" dense>
        <DataSlot state={top} height={460}>{d => <DataTable data={d} maxHeight={520} />}</DataSlot>
      </Section>
    </>
  )
}
