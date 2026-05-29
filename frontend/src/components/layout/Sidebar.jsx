import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { NavLink } from 'react-router-dom'
import DashboardRoundedIcon    from '@mui/icons-material/DashboardRounded'
import InsightsRoundedIcon     from '@mui/icons-material/InsightsRounded'
import TimelineRoundedIcon     from '@mui/icons-material/TimelineRounded'
import GroupsRoundedIcon       from '@mui/icons-material/GroupsRounded'
import Inventory2RoundedIcon   from '@mui/icons-material/Inventory2Rounded'
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded'

export const DRAWER_WIDTH = 248

export const NAV_ITEMS = [
  { to: '/',          label: 'Overview',          icon: <DashboardRoundedIcon /> },
  { to: '/sales',     label: 'Sales',             icon: <InsightsRoundedIcon /> },
  { to: '/time',      label: 'Time Intelligence', icon: <TimelineRoundedIcon /> },
  { to: '/customers', label: 'Customers',         icon: <GroupsRoundedIcon /> },
  { to: '/products',  label: 'Products',          icon: <Inventory2RoundedIcon /> },
  { to: '/workforce', label: 'Workforce & Tax',   icon: <AccountBalanceRoundedIcon /> },
]

function NavList({ onNavigate }) {
  return (
    <>
      <Box sx={{ px: 3, py: 3.25 }}>
        <Typography sx={{
          fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 22,
          color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.1,
        }}>
          VDS Analytics
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, mt: 0.5, letterSpacing: 0.3 }}>
          ExamMultidimensionnel · SSAS
        </Typography>
      </Box>

      <List sx={{ px: 1.5 }}>
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <ListItemButton
            key={to}
            component={NavLink}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            sx={{
              borderRadius: 2.5, mb: 0.5, py: 1.1,
              color: 'rgba(255,255,255,0.68)',
              '& .MuiListItemIcon-root': { color: 'inherit', minWidth: 38 },
              '&.active': {
                bgcolor: 'rgba(255,255,255,0.14)', color: '#fff',
                boxShadow: 'inset 3px 0 0 #C9A227',
              },
              '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: '#fff' },
            }}
          >
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ px: 3, py: 2.5 }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: 10.5, lineHeight: 1.6 }}>
          MDX over cube VDS<br />Multidimensional OLAP
        </Typography>
      </Box>
    </>
  )
}

const paperSx = {
  width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none',
  display: 'flex', flexDirection: 'column',
  background: 'linear-gradient(180deg, #5E2029 0%, #3F161C 100%)',
}

export default function Sidebar({ mobileOpen, onClose }) {
  return (
    <>
      {/* Permanent on desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH, flexShrink: 0,
          '& .MuiDrawer-paper': paperSx,
        }}
      >
        <NavList />
      </Drawer>

      {/* Temporary on mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': paperSx }}
      >
        <NavList onNavigate={onClose} />
      </Drawer>
    </>
  )
}
