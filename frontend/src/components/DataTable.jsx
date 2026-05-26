import {
  Card, CardContent, Typography,
  Table, TableHead, TableRow, TableCell,
  TableBody, TableContainer
} from '@mui/material'

const fmtCell = v => {
  if (typeof v === 'number')
    return v.toLocaleString(undefined, { maximumFractionDigits: 2 })
  return v ?? ''
}

export default function DataTable({ data, title }) {
  if (!data || !data.rows?.length) return null
  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          {title || data.title}
        </Typography>
        <TableContainer sx={{ maxHeight: 420 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {data.columns.map((col, i) => (
                  <TableCell
                    key={i}
                    sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}
                  >
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.rows.map((row, ri) => (
                <TableRow key={ri} hover>
                  {row.map((cell, ci) => (
                    <TableCell key={ci}>{fmtCell(cell)}</TableCell>
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
