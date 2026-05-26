import { Grid } from '@mui/material'
import BarChartCard from '../components/charts/BarChartCard'
import Loader from '../components/common/Loader'
import Section from '../components/common/Section'

export default function FinancePage({ tax }) {
  return (
    <Section title="Tax Analysis">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {tax.data ? <BarChartCard data={tax.data} /> : <Loader />}
        </Grid>
      </Grid>
    </Section>
  )
}
