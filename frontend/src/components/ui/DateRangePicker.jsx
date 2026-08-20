import { useState } from 'react';
import { Button, Menu, MenuItem, Box, Checkbox } from '@mui/material';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import { DATE_RANGES } from '../../config/constants.js';
import { rangeLabel } from '../../config/dates.js';

/**
 * Date range selector. Controlled: `value` is a range key ('7d' | '30d' | '90d'),
 * `onChange(key)` updates it (typically via useUrlFilters). Opens a menu of the
 * preset ranges.
 *
 * REMAINING (extend later):
 *  - custom calendar range picker (two date pickers) → value 'custom'
 *  - relative "vs previous period" comparison toggle
 *  - persisted last selection
 */
const DateRangePicker = ({ value = '30d', onChange }) => {
  const [anchor, setAnchor] = useState(null);
  return (
    <>
      <Button
        variant="outlined"
        startIcon={<CalendarMonth />}
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ minHeight: 40, color: 'var(--header-text)', borderColor: 'color-mix(in srgb, var(--header-text) 35%, transparent)', textTransform: 'none', '&:hover': { borderColor: 'color-mix(in srgb, var(--header-text) 60%, transparent)', bgcolor: 'color-mix(in srgb, var(--header-text) 8%, transparent)' } }}
      >
        {rangeLabel(value)}
      </Button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {DATE_RANGES.map((r) => (
          <MenuItem
            key={r.key}
            onClick={() => {
              onChange(r.key);
              setAnchor(null);
            }}
            sx={{ minWidth: 180 }}
          >
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {r.label}
              <Checkbox size="small" checked={value === r.key} sx={{ p: 0 }} />
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default DateRangePicker;
