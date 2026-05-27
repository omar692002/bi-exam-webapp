import {
  Box, Button, Chip, FormControl, InputLabel, LinearProgress,
  MenuItem, Paper, Select, Typography,
} from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import CloseIcon      from '@mui/icons-material/Close'

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']

const ALL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const QUARTER_MONTHS = {
  Q1: ['January', 'February', 'March'],
  Q2: ['April', 'May', 'June'],
  Q3: ['July', 'August', 'September'],
  Q4: ['October', 'November', 'December'],
}

function FilterSelect({ label, value, onChange, options, disabled }) {
  return (
    <FormControl size="small" sx={{ minWidth: 140 }} disabled={disabled}>
      <InputLabel sx={{ fontSize: 13 }}>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={e => onChange(e.target.value)}
        sx={{ fontSize: 13, bgcolor: disabled ? undefined : '#fff' }}
      >
        <MenuItem value="">
          <em style={{ fontStyle: 'normal', color: '#9ca3af' }}>All {label}s</em>
        </MenuItem>
        {options.map(o => (
          <MenuItem
            key={o}
            value={o}
            // Clicking the already-selected item deselects it
            onClick={() => { if (value === o) onChange('') }}
            sx={{ fontSize: 13 }}
          >
            {o}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default function FilterBar({
  year,    onYearChange,    availableYears,
  quarter, onQuarterChange,
  month,   onMonthChange,
  isLoading,
}) {
  const hasFilter  = year || quarter || month
  const clearAll   = () => { onYearChange(''); onQuarterChange(''); onMonthChange('') }
  const activeLabel = [year, quarter, month].filter(Boolean).join(' · ')

  // Months available depend on the selected quarter
  const monthOptions = quarter ? QUARTER_MONTHS[quarter] : ALL_MONTHS

  function handleQuarterChange(newQ) {
    onQuarterChange(newQ)
    // If the currently selected month falls outside the new quarter, clear it
    if (newQ && month && !QUARTER_MONTHS[newQ]?.includes(month)) {
      onMonthChange('')
    }
  }

  return (
    <Paper
      elevation={0}
      square
      sx={{
        position: 'fixed',
        top: 64,
        left: 0,
        right: 0,
        zIndex: 1199,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: '#f8fafc',
        px: { xs: 2, sm: 4 },
        py: 1.25,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flexWrap: 'wrap',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
        <FilterListIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
        <Typography sx={{
          fontSize: 11, fontWeight: 700, color: 'text.disabled',
          textTransform: 'uppercase', letterSpacing: 0.9, whiteSpace: 'nowrap',
        }}>
          Period
        </Typography>
      </Box>

      <FilterSelect
        label="Year"
        value={year}
        onChange={onYearChange}
        options={availableYears.map(String)}
      />
      <FilterSelect
        label="Quarter"
        value={quarter}
        onChange={handleQuarterChange}
        options={QUARTERS}
      />
      <FilterSelect
        label="Month"
        value={month}
        onChange={onMonthChange}
        options={monthOptions}
        disabled={monthOptions.length === 0}
      />

      {hasFilter && (
        <>
          <Chip
            label={activeLabel}
            size="small"
            color="primary"
            variant="filled"
            sx={{ fontSize: 12, fontWeight: 600 }}
          />
          <Button
            size="small"
            startIcon={<CloseIcon sx={{ fontSize: '13px !important' }} />}
            onClick={clearAll}
            sx={{
              fontSize: 12, textTransform: 'none', color: 'text.secondary',
              px: 1, minWidth: 0, '&:hover': { color: 'error.main' },
            }}
          >
            Clear
          </Button>
        </>
      )}

      {/* Thin loading bar at the bottom edge of the filter bar */}
      {isLoading && (
        <LinearProgress sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2 }} />
      )}
    </Paper>
  )
}
