import {
  Box, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography,
} from '@mui/material'

const fmtCell = v =>
  typeof v === 'number' ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : v ?? ''

export default function DataTable({ data }) {
  if (!data?.rows?.length) {
    return (
      <Card elevation={0} variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>{data?.title}</Typography>
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: 120, color: 'text.disabled',
          }}>
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>No data for this selection</Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card elevation={0} variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>{data.title}</Typography>
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {data.columns.map((col, i) => (
                  <TableCell
                    key={i}
                    sx={{ fontWeight: 700, bgcolor: '#1e3a5f', color: '#fff', fontSize: 12 }}
                  >
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.rows.map((row, ri) => (
                <TableRow
                  key={ri}
                  hover
                  sx={{ '&:nth-of-type(even)': { bgcolor: '#f8fafc' } }}
                >
                  {row.map((cell, ci) => (
                    <TableCell key={ci} sx={{ fontSize: 13 }}>{fmtCell(cell)}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}
