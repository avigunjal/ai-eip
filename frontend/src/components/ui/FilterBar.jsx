import { Box, Chip, Typography } from '@mui/material';

/**
 * Horizontal filter toolbar. `filters` renders active filter chips each with a
 * remove action; `onClear` clears all; `children` holds the input controls
 * (search, selects) that set the filters.
 *
 * REMAINING (extend later):
 *  - dropdown filter groups (popover per filter)
 *  - "N filters active" count + sticky toolbar
 */
const FilterBar = ({ filters = [], onClear, children, sx }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', ...sx }}>
    {children}
    {filters.length > 0 && (
      <>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          {filters.map((f) => (
            <Chip key={f.key} label={f.label} size="small" onDelete={f.onRemove} />
          ))}
        </Box>
        <Typography
          component="button"
          onClick={onClear}
          sx={{ fontSize: 13, color: 'primary.main', bgcolor: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, ml: 0.5 }}
        >
          Clear all
        </Typography>
      </>
    )}
  </Box>
);

export default FilterBar;
