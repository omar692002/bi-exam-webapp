import { useState } from 'react'
import { Box, Toolbar } from '@mui/material'
import { Outlet } from 'react-router-dom'
import Sidebar, { DRAWER_WIDTH } from './Sidebar'
import TopBar from './TopBar'

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <TopBar onMenuClick={() => setMobileOpen(o => !o)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minWidth: 0,
          px: { xs: 2, sm: 3, md: 4.5 },
          pb: 7,
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, md: 76 } }} />
        <Box sx={{ pt: 3, maxWidth: 1500, mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
