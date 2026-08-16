import { useState } from 'react';
import { Box, IconButton, Menu, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import TableChart from '@mui/icons-material/TableChart';
import OpenInFull from '@mui/icons-material/OpenInFull';
import Surface from '../styled/Surface.jsx';
import ChartBoundary from './ChartBoundary.jsx';

/**
 * Wraps any Recharts chart in a titled card with:
 *  - a legend (optional, rendered above the chart)
 *  - a "View data table" toggle (accessible alternative to the chart)
 *  - a drill-down menu (optional; pages pass `drilldown` options)
 * `children` is the Recharts <ResponsiveContainer> content.
 *
 * REMAINING (extend later):
 *  - export CSV / PNG actions
 *  - full-screen modal via `fullscreen` prop
 *  - empty/error slot when chart has no series
 */
const ChartCard = ({
  title,
  subtitle,
  legend,        // array of { name, color }
  children,
  data,          // array of row objects for the data table
  dataColumns,   // [{ key, label }]
  drilldown,     // [{ label, to? | onSelect? }]
  action,        // custom right-side action node
  sx,
}) => {
  const [showTable, setShowTable] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);

  return (
    <Surface sx={{ p: 3, display: 'flex', flexDirection: 'column', ...sx }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Box>
          <Typography sx={{ fontWeight: 600 }}>{title}</Typography>
          {subtitle && <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.25 }}>{subtitle}</Typography>}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {action}
          <Tooltip title={showTable ? 'Show chart' : 'View data table'}>
            <IconButton size="small" aria-label="Toggle data table" onClick={() => setShowTable((v) => !v)}>
              <TableChart fontSize="small" />
            </IconButton>
          </Tooltip>
          {drilldown?.length > 0 && (
            <>
              <Tooltip title="Drill down">
                <IconButton size="small" aria-label="Drill down" onClick={(e) => setMenuAnchor(e.currentTarget)}>
                  <OpenInFull fontSize="small" />
                </IconButton>
              </Tooltip>
              <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
                {drilldown.map((d) => (
                  <MenuItem
                    key={d.label}
                    onClick={() => {
                      setMenuAnchor(null);
                      d.onSelect?.();
                    }}
                    component={d.to ? 'a' : 'li'}
                    href={d.to}
                  >
                    {d.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
        </Box>
      </Box>

      {/* Legend */}
      {legend && !showTable && (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
          {legend.map((l) => (
            <Box key={l.name} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, fontSize: 12, color: 'text.secondary' }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: l.color }} />
              {l.name}
            </Box>
          ))}
        </Box>
      )}

      {/* Chart or data table */}
      {showTable ? (
        <Table size="small" sx={{ mt: 2 }}>
          <TableHead>
            <TableRow>
              {(dataColumns ?? []).map((c) => (
                <TableCell key={c.key} sx={{ fontWeight: 700 }}>{c.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {(data ?? []).map((row, i) => (
              <TableRow key={i}>
                {(dataColumns ?? []).map((c) => (
                  <TableCell key={c.key}>{row[c.key]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Box sx={{ mt: 2, flex: 1, minHeight: 200 }}>
          <ChartBoundary>{children}</ChartBoundary>
        </Box>
      )}
    </Surface>
  );
};

export default ChartCard;
