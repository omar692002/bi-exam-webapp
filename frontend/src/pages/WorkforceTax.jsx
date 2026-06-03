import { usePeriodData } from '../hooks/usePeriodData'
import * as api from '../api'
import Section, { CardGrid } from '../components/common/Section'
import DataSlot from '../components/common/DataSlot'
import BarChartCard from '../components/charts/BarChartCard'
import DataTable from '../components/tables/DataTable'

export default function WorkforceTax() {
  const topReps = usePeriodData((y, q, m) => api.getTopEmployees(10, y, q, m))
  const tax     = usePeriodData(api.getTaxAnalysis)

  return (
    <>
      <Section title="Sales Representatives" subtitle="Revenue leaderboard across the sales team" dense>
        <DataSlot state={topReps} height={300}>{d => <DataTable data={d} maxHeight={420} />}</DataSlot>
      </Section>

      <Section title="Tax & Finance" subtitle="Tax computed against revenue, by product category" dense>
        <DataSlot state={tax} height={460}>
          {d => <BarChartCard data={d} horizontal subtitle="Tax vs. revenue by category" />}
        </DataSlot>
      </Section>
    </>
  )
}
