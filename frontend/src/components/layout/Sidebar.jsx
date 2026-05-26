import {
  Box, Divider, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, Typography,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import BarChartIcon from '@mui/icons-material/BarChart'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'

export const DRAWER_WIDTH = 240

const NAV_ITEMS = [
  { label: 'Overview',      icon: <DashboardIcon /> },
  { label: 'Sales Analysis', icon: <BarChartIcon /> },
  { label: 'Time Trends',   icon: <TrendingUpIcon /> },
  { label: 'Tax & Finance', icon: <AccountBalanceIcon /> },
  { label: 'Top Rankings',  icon: <EmojiEventsIcon /> },
]

export default function Sidebar({ page, onNavigate }) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          background: '#1e3a5f',
          color: '#fff',
          border: 'none',
        },
      }}
    >
      <Box sx={{ px: 2.5, py: 3 }}>
        <Typography variant="h6" fontWeight={800} color="#fff" letterSpacing={0.5}>
          VDS Analytics
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)' }}>
          ExamMultidimensionnel
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      <List sx={{ pt: 1.5, px: 1 }}>
        {NAV_ITEMS.map(({ label, icon }, i) => (
          <ListItemButton
            key={label}
            selected={page === i}
            onClick={() => onNavigate(i)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              color: 'rgba(255,255,255,0.65)',
              '& .MuiListItemIcon-root': { color: 'inherit', minWidth: 40 },
              '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.14)', color: '#fff' },
              '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: '#fff' },
            }}
          >
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText
              primary={label}
              primaryTypographyProps={{ fontSize: 14, fontWeight: page === i ? 600 : 400 }}
            />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  )
}
