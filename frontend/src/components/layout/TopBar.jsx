import {
  AppBar, Box, Button, Chip, FormControl, IconButton, InputLabel,
  MenuItem, Select, Toolbar, Typography,
} from '@mui/material'
import { useLocation } from 'react-router-dom'
import MenuRoundedIcon       from '@mui/icons-material/MenuRounded'
import StorageRoundedIcon    from '@mui/icons-material/StorageRounded'
import CloseRoundedIcon      from '@mui/icons-material/CloseRounded'
import FilterAltRoundedIcon  from '@mui/icons-material/FilterAltRounded'
import { useFilter, QUARTER_MONTHS } from '../../context/FilterContext'
import { NAV_ITEMS, DRAWER_WIDTH } from './Sidebar'

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']
const ALL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const PAGE_META = {
  '/':          { title: 'Executive Overview',   sub: 'Key metrics & headline trends' },
  '/sales':     { title: 'Sales Analysis',       sub: 'Revenue across products, places & segments' },
  '/time':      { title: 'Time Intelligence',    sub: 'Growth, seasonality & drill-down' },
  '/customers': { title: 'Customer Analytics',   sub: 'Segments, status & geography' },
  '/products':  { title: 'Product Analytics',    sub: 'Categories, brands, colors & mix' },
  '/workforce': { title: 'Workforce & Tax',      sub: 'Sales reps, departments & finance' },
}

function PeriodSelect({ label, value, onChange, options, disabled }) {
  return (
    <FormControl size="small" sx={{ minWidth: 116 }} disabled={disabled}>
      <InputLabel sx={{ fontSize: 13 }}>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={e => onChange(e.target.value)}
        sx={{ fontSize: 13, bgcolor: '#fff', borderRadius: 2.5 }}
      >
        <MenuItem value=""><em style={{ fontStyle: 'normal', color: '#9c9183' }}>All</em></MenuItem>
        {options.map(o => (
          <MenuItem key={o} value={o} onClick={() => { if (value === o) onChange('') }} sx={{ fontSize: 13 }}>
            {o}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default function TopBar({ onMenuClick }) {
  const { pathname } = useLocation()
  const meta = PAGE_META[pathname] ?? NAV_ITEMS.find(n => n.to === pathname) ?? { title: 'Analytics', sub: '' }

  const {
    year, quarter, month, setYear, setQuarter, setMonth,
    availableYears, hasFilter, clear,
  } = useFilter()

  const monthOptions = quarter ? QUARTER_MONTHS[quarter] : ALL_MONTHS
  const activeLabel = [year, quarter, month].filter(Boolean).join(' · ')

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { md: `${DRAWER_WIDTH}px` },
        bgcolor: 'rgba(250,248,243,0.85)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid', borderColor: 'divider',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ gap: 2, minHeight: { xs: 64, md: 76 }, px: { xs: 2, md: 3.5 }, flexWrap: 'wrap' }}>
        <IconButton edge="start" onClick={onMenuClick} sx={{ display: { md: 'none' } }}>
          <MenuRoundedIcon />
        </IconButton>

        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: { xs: 18, md: 22 }, lineHeight: 1.15 }}>
            {meta.title}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 12, display: { xs: 'none', sm: 'block' } }}>
            {meta.sub}
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
          <FilterAltRoundedIcon sx={{ fontSize: 18, color: 'text.disabled', display: { xs: 'none', sm: 'block' } }} />
          <PeriodSelect label="Year"    value={year}    onChange={setYear}    options={availableYears} />
          <PeriodSelect label="Quarter" value={quarter} onChange={setQuarter} options={QUARTERS} />
          <PeriodSelect label="Month"   value={month}   onChange={setMonth}   options={monthOptions} disabled={!monthOptions.length} />

          {hasFilter && (
            <Button
              size="small" onClick={clear}
              startIcon={<CloseRoundedIcon sx={{ fontSize: '15px !important' }} />}
              sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
            >
              {activeLabel}
            </Button>
          )}

          <Chip
            icon={<StorageRoundedIcon sx={{ fontSize: '15px !important' }} />}
            label="Cube VDS"
            size="small"
            sx={{ bgcolor: 'rgba(123,45,59,0.08)', color: 'primary.main', display: { xs: 'none', lg: 'flex' } }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  )
}
