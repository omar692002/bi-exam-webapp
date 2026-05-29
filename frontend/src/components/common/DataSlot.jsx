import { Box } from '@mui/material'
import Loader from './Loader'

/** Shows a skeleton until first data arrives, then keeps content visible (dimmed) during refetch. */
export default function DataSlot({ state, height = 300, children }) {
  if (state.data === null && !state.error) return <Loader height={height} />
  if (state.error || state.data === null) return null
  return (
    <Box sx={{
      width: '100%', height: '100%',
      opacity: state.loading ? 0.55 : 1, transition: 'opacity .2s ease',
      pointerEvents: state.loading ? 'none' : 'auto',
    }}>
      {children(state.data)}
    </Box>
  )
}
