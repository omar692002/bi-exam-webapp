import { usePeriodData } from '../hooks/usePeriodData'
import * as api from '../api'
import Section, { CardGrid } from '../components/common/Section'
import DataSlot from '../components/common/DataSlot'
import InsightStrip, { deriveInsights } from '../components/common/InsightStrip'
import BarChartCard from '../components/charts/BarChartCard'
import PieChartCard from '../components/charts/PieChartCard'
import DataTable from '../components/tables/DataTable'

export default function Customers() {
  const byType   = usePeriodData(api.getSalesByCustomerType)
  const byStatus = usePeriodData(api.getSalesByCustomerStatus)
  const byCity   = usePeriodData(api.getSalesByCity)
  const top      = usePeriodData((y, q, m) => api.getTopCustomers(10, y, q, m))

  const insights = byCity.data ? deriveInsights(byCity.data, { unit: 'USD', noun: 'cities' }) : []

  return (
    <>
      {insights.length > 0 && <Section dense><InsightStrip items={insights} /></Section>}

      <Section title="Segments" dense>
        <CardGrid cols="1fr 1fr" gap={3}>
          <DataSlot state={byType}   height={380}>{d => <PieChartCard data={d} height={380} subtitle="Revenue share by customer type" />}</DataSlot>
          <DataSlot state={byStatus} height={380}>{d => <BarChartCard data={d} subtitle="Revenue by customer status" height={380} />}</DataSlot>
        </CardGrid>
      </Section>

      <Section title="Geography & Leaders" dense>
        <CardGrid cols="1fr 1fr" gap={3}>
          <DataSlot state={byCity} height={500}>{d => <BarChartCard data={d} horizontal subtitle="Revenue by city" />}</DataSlot>
          <DataSlot state={top}    height={500}>{d => <DataTable data={d} maxHeight={520} />}</DataSlot>
        </CardGrid>
      </Section>
    </>
  )
}
