import { createTheme } from '@mui/material/styles'

/**
 * Warm, editorial light theme inspired by Claude's aesthetic:
 * cream paper, warm charcoal ink, burgundy + sage accents, soft chrome.
 */

export const PALETTE = {
  burgundy:   '#7B2D3B',
  burgundyHi: '#9A3B4C',
  sage:       '#6E8060',
  sageHi:     '#869A78',
  terracotta: '#C2703D',
  gold:       '#C9A227',
  dustyBlue:  '#5B7B9A',
  plum:       '#7A5C7E',
  warmGray:   '#A89B8C',
  ink:        '#2A2520',
  inkSoft:    '#6B6258',
  cream:      '#FAF8F3',
  creamDeep:  '#F3EEE5',
  line:       '#E7E0D5',
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary:    { main: PALETTE.burgundy, light: PALETTE.burgundyHi, dark: '#5E2029', contrastText: '#fff' },
    secondary:  { main: PALETTE.sage, light: PALETTE.sageHi, dark: '#52614A', contrastText: '#fff' },
    success:    { main: '#5B8C5A' },
    warning:    { main: PALETTE.gold },
    error:      { main: '#B5453B' },
    info:       { main: PALETTE.dustyBlue },
    background:  { default: PALETTE.cream, paper: '#FFFFFF' },
    text:       { primary: PALETTE.ink, secondary: PALETTE.inkSoft },
    divider:    PALETTE.line,
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: 'Inter, Roboto, "Segoe UI", Arial, sans-serif',
    h4: { fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 700, letterSpacing: '-0.01em' },
    h5: { fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 700, letterSpacing: '-0.005em' },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: PALETTE.cream },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${PALETTE.line}`,
          boxShadow: '0 1px 2px rgba(42,37,32,0.04), 0 8px 24px rgba(42,37,32,0.04)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: PALETTE.ink, fontSize: 12, borderRadius: 8, padding: '6px 10px' },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
  },
})

export default theme
