import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: { main: '#1e3a5f' },
    secondary: { main: '#0ea5e9' },
    background: { default: '#f0f4f8', paper: '#ffffff' },
    success: { main: '#10b981' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
    info: { main: '#6366f1' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
  },
})

export default theme
