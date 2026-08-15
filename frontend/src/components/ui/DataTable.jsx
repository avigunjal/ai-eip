import { useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TableSortLabel, TablePagination,
} from '@mui/material';
import EmptyState from '../common/EmptyState.jsx';
import SearchOff from '@mui/icons-material/SearchOff';

/**
 * Lightweight MUI Table with sortable columns, pagination, row-click, and an
 * empty state. `columns` = [{ key, label, sortable, render }]; `rows` = objects
 * with `id` plus the column keys.
 *
 * REMAINING (extend later):
 *  - migrate to @mui/x-data-grid for selection, column grouping, pinning,
 *    virtualization (add dependency: npm i @mui/x-data-grid)
 *  - responsive "cards" layout for <640px
 *  - sticky header
 */
const DataTable = ({
  columns,
  rows,
  onRowClick,
  emptyTitle = 'No results',
  emptyDescription = 'Try adjusting your filters.',
  initialSort = { key: '', dir: 'asc' },
  pageSize = 8,
  dense,
}) => {
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);

  const handleSort = (key) => {
    const isAsc = sort.key === key && sort.dir === 'asc';
    setSort({ key, dir: isAsc ? 'desc' : 'asc' });
    setPage(0);
  };

  let data = [...rows];
  if (sort.key) {
    data.sort((a, b) => {
      const va = a[sort.key];
      const vb = b[sort.key];
      if (va == null || vb == null) return 0;
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }

  const total = data.length;
  const paged = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <TableContainer>
        <Table size={dense ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key} sortDirection={sort.key === col.key ? sort.dir : false}>
                  {col.sortable ? (
                    <TableSortLabel
                      active={sort.key === col.key}
                      direction={sort.key === col.key ? sort.dir : 'asc'}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map((row) => (
              <TableRow
                key={row.id}
                hover
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                sx={onRowClick ? { cursor: 'pointer' } : undefined}
              >
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    {col.render ? col.render(row) : row[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {total === 0 && (
        <EmptyState icon={SearchOff} title={emptyTitle} description={emptyDescription} />
      )}

      {total > 0 && (
        <TablePagination
          component="div"
          count={total}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 8, 12]}
        />
      )}
    </Box>
  );
};

export default DataTable;
