import { Grid } from '@mui/material'
import LineChartCard from '../components/charts/LineChartCard'
import BarChartCard from '../components/charts/BarChartCard'
import Loader from '../components/common/Loader'
import Section from '../components/common/Section'

export default function TrendsPage({ overTime, byQuarter }) {
  return (
    <Section title="Revenue Over Time">
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          {overTime.data ? <LineChartCard data={overTime.data} /> : <Loader />}
        </Grid>
        <Grid item xs={12} md={5}>
          {byQuarter.data ? <BarChartCard data={byQuarter.data} /> : <Loader />}
        </Grid>
      </Grid>
    </Section>
  )
}
