import { Box, Breadcrumbs, Link, Typography, Chip } from '@mui/material'
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded'
import { useData } from '../hooks/useData'
import { usePeriodData } from '../hooks/usePeriodData'
import { useFilter } from '../context/FilterContext'
import * as api from '../api'
import Section, { CardGrid } from '../components/common/Section'
import DataSlot from '../components/common/DataSlot'
import ComboChartCard from '../components/charts/ComboChartCard'
import GrowthChartCard from '../components/charts/GrowthChartCard'
import AreaChartCard from '../components/charts/AreaChartCard'
import HeatmapCard from '../components/charts/HeatmapCard'

function DrillBreadcrumb() {
  const { year, quarter, month, level, clear, setYear, setQuarter } = useFilter()
  return (
    <Breadcrumbs separator={<NavigateNextRoundedIcon sx={{ fontSize: 16 }} />} sx={{ '& a': { cursor: 'pointer' } }}>
      <Link underline="hover" color={level === 'all' ? 'text.primary' : 'inherit'} onClick={clear} sx={{ fontWeight: level === 'all' ? 700 : 500 }}>
        All Years
      </Link>
      {year && (
        <Link underline="hover" color={level === 'year' ? 'text.primary' : 'inherit'} onClick={() => { setYear(year); setQuarter('') }} sx={{ fontWeight: level === 'year' ? 700 : 500 }}>
          {year}
        </Link>
      )}
      {quarter && <Typography color="text.primary" sx={{ fontWeight: month ? 500 : 700 }}>{quarter}</Typography>}
      {month && <Typography color="text.primary" sx={{ fontWeight: 700 }}>{month}</Typography>}
    </Breadcrumbs>
  )
}

export default function TimeIntelligence() {
  const { level, drillToYear, drillToQuarter } = useFilter()

  const byYear    = useData(api.getSalesByYear, [])
  const byQuarter = usePeriodData(api.getRevenueByQuarter)
  const byMonth   = usePeriodData(api.getSalesByMonth)

  const overTime  = useData(api.getRevenueOverTime, [])
  const growth    = useData(api.getRevenueGrowth, [])
  const ytd       = usePeriodData(api.getRevenueYtd)
  const heatmap   = usePeriodData(api.getRevenueHeatmap)

  const onQuarter = lbl => drillToQuarter(/^\d+$/.test(lbl) ? `Q${lbl}` : lbl)

  // Pick the drill chart for the current hierarchy level.
  let drill, onSelect, hintNote
  if (level === 'all')   { drill = byYear;    onSelect = drillToYear; hintNote = 'Year level' }
  else if (level === 'year') { drill = byQuarter; onSelect = onQuarter; hintNote = 'Quarter level' }
  else { drill = byMonth; onSelect = undefined; hintNote = 'Month level' }

  return (
    <>
      <Section
        title="Drill-Down Explorer"
        subtitle="Navigate the Date hierarchy: Year → Quarter → Month. Click a bar to go deeper."
        action={<Chip label={hintNote} size="small" color="primary" variant="outlined" />}
        dense
      >
        <Box sx={{ mb: 2 }}><DrillBreadcrumb /></Box>
        <DataSlot state={drill} height={420}>
          {d => <ComboChartCard data={d} height={400} onSelect={onSelect} />}
        </DataSlot>
      </Section>

      <Section title="Growth & Accumulation" dense>
        <CardGrid cols="1fr 1fr" gap={3}>
          <DataSlot state={growth} height={380}>{d => <GrowthChartCard data={d} subtitle="Revenue with period-over-period growth %" />}</DataSlot>
          <DataSlot state={ytd}    height={380}>{d => <AreaChartCard data={d} subtitle="Monthly revenue & cumulative running total" />}</DataSlot>
        </CardGrid>
      </Section>

      <Section title="Seasonality Matrix" dense>
        <DataSlot state={heatmap} height={320}>
          {d => <HeatmapCard data={d} subtitle="Revenue by product category across quarters" />}
        </DataSlot>
      </Section>

      <Section title="Long-Term Trend" dense>
        <DataSlot state={overTime} height={420}>
          {d => <ComboChartCard data={d} height={400} subtitle="Revenue & units across every month on record" />}
        </DataSlot>
      </Section>
    </>
  )
}
