import { Grid } from '@mui/material'
import BarChartCard from '../components/charts/BarChartCard'
import PieChartCard from '../components/charts/PieChartCard'
import Loader from '../components/common/Loader'
import Section from '../components/common/Section'

export default function SalesPage({ byCategory, byCountry, byProduct, byType }) {
  return (
    <>
      <Section title="Sales by Category & Country">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            {byCategory.data ? <BarChartCard data={byCategory.data} horizontal /> : <Loader />}
          </Grid>
          <Grid item xs={12} md={6}>
            {byCountry.data ? <BarChartCard data={byCountry.data} horizontal /> : <Loader />}
          </Grid>
        </Grid>
      </Section>

      <Section title="Sales by Product & Customer Type">
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            {byProduct.data ? <BarChartCard data={byProduct.data} horizontal /> : <Loader />}
          </Grid>
          <Grid item xs={12} md={4}>
            {byType.data ? <PieChartCard data={byType.data} /> : <Loader />}
          </Grid>
        </Grid>
      </Section>
    </>
  )
}
