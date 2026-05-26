import { Grid } from '@mui/material'
import DataTable from '../components/tables/DataTable'
import Loader from '../components/common/Loader'
import Section from '../components/common/Section'

export default function RankingsPage({ topCustomers, topProducts, topEmployees }) {
  return (
    <Section title="Top 10 Rankings">
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          {topCustomers.data ? <DataTable data={topCustomers.data} /> : <Loader />}
        </Grid>
        <Grid item xs={12} md={4}>
          {topProducts.data ? <DataTable data={topProducts.data} /> : <Loader />}
        </Grid>
        <Grid item xs={12} md={4}>
          {topEmployees.data ? <DataTable data={topEmployees.data} /> : <Loader />}
        </Grid>
      </Grid>
    </Section>
  )
}
