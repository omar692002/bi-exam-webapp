import { Grid } from '@mui/material'
import KpiCard from '../components/kpi/KpiCard'
import LineChartCard from '../components/charts/LineChartCard'
import PieChartCard from '../components/charts/PieChartCard'
import Loader from '../components/common/Loader'
import Section from '../components/common/Section'

export default function OverviewPage({ kpis, overTime, byType }) {
  return (
    <>
      <Section title="Key Performance Indicators">
        {kpis.data ? (
          <Grid container spacing={2}>
            {kpis.data.kpis.map(kpi => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={kpi.label}>
                <KpiCard label={kpi.label} value={kpi.value} unit={kpi.unit} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Loader height={120} />
        )}
      </Section>

      <Section title="Revenue at a Glance">
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            {overTime.data ? <LineChartCard data={overTime.data} /> : <Loader />}
          </Grid>
          <Grid item xs={12} md={4}>
            {byType.data ? <PieChartCard data={byType.data} /> : <Loader />}
          </Grid>
        </Grid>
      </Section>
    </>
  )
}
