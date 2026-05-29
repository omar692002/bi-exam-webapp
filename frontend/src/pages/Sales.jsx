import { usePeriodData } from '../hooks/usePeriodData'
import * as api from '../api'
import Section, { CardGrid } from '../components/common/Section'
import DataSlot from '../components/common/DataSlot'
import BarChartCard from '../components/charts/BarChartCard'
import PieChartCard from '../components/charts/PieChartCard'

export default function Sales() {
  const byCategory = usePeriodData(api.getSalesByCategory)
  const byProduct  = usePeriodData(api.getSalesByProduct)
  const byCity     = usePeriodData(api.getSalesByCity)
  const byType     = usePeriodData(api.getSalesByCustomerType)
  const byStatus   = usePeriodData(api.getSalesByCustomerStatus)

  return (
    <>
      <Section title="Product Revenue" dense>
        <CardGrid cols="1fr 1fr" gap={3}>
          <DataSlot state={byCategory} height={500}>{d => <BarChartCard data={d} horizontal subtitle="By product category" />}</DataSlot>
          <DataSlot state={byProduct}  height={500}>{d => <BarChartCard data={d} horizontal subtitle="By product brand" />}</DataSlot>
        </CardGrid>
      </Section>

      <Section title="Geography" subtitle="Revenue distribution across cities" dense>
        <DataSlot state={byCity} height={460}>{d => <BarChartCard data={d} horizontal subtitle="By customer city" />}</DataSlot>
      </Section>

      <Section title="Customer Mix" dense>
        <CardGrid cols="1fr 1fr" gap={3}>
          <DataSlot state={byType}   height={380}>{d => <PieChartCard data={d} height={380} subtitle="Revenue share by customer type" />}</DataSlot>
          <DataSlot state={byStatus} height={380}>{d => <BarChartCard data={d} height={380} subtitle="Revenue by customer status" />}</DataSlot>
        </CardGrid>
      </Section>
    </>
  )
}
