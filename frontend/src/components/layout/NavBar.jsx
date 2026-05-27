import { AppBar, Box, Chip, Toolbar, Typography } from '@mui/material'
import StorageIcon from '@mui/icons-material/Storage'

export default function NavBar() {
  return (
    <AppBar position="fixed" elevation={1} sx={{ bgcolor: '#1e3a5f', zIndex: 1200 }}>
      <Toolbar sx={{ minHeight: 64, px: { xs: 2, sm: 3 }, gap: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={800} color="#fff" letterSpacing={0.5} lineHeight={1.1}>
            VDS Analytics
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>
            ExamMultidimensionnel
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Chip
          icon={<StorageIcon sx={{ fontSize: '13px !important', color: 'rgba(255,255,255,0.6) !important' }} />}
          label="Cube VDS · SSAS"
          size="small"
          sx={{ bgcolor: 'rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.75)', fontSize: 11 }}
        />
      </Toolbar>
    </AppBar>
  )
}
