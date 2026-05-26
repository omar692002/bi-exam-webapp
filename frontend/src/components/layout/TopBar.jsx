import { AppBar, Chip, Toolbar, Typography } from '@mui/material'
import StorageIcon from '@mui/icons-material/Storage'

const PAGE_TITLES = ['Overview', 'Sales Analysis', 'Time Trends', 'Tax & Finance', 'Top Rankings']

export default function TopBar({ page, drawerWidth }) {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        bgcolor: '#fff',
        borderBottom: '1px solid #e2e8f0',
        color: 'text.primary',
      }}
    >
      <Toolbar>
        <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
          {PAGE_TITLES[page]}
        </Typography>
        <Chip
          icon={<StorageIcon sx={{ fontSize: '14px !important' }} />}
          label="Cube VDS · SSAS"
          size="small"
          sx={{ bgcolor: '#f0f4f8', fontSize: 12 }}
        />
      </Toolbar>
    </AppBar>
  )
}
