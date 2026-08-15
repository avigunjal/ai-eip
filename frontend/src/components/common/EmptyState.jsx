import { Box, Typography } from '@mui/material';

/**
 * Empty state shown when a filter/list has no results. Centered icon + title +
 * optional description + action (e.g. "Clear filters").
 *
 * REMAINING (extend later):
 *  - illustration/emoji per context
 *  - `compact` prop for inline empties in table cells
 */
const EmptyState = ({ icon: Icon, title = 'Nothing here yet', description, action, sx }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      py: 6,
      px: 3,
      ...sx,
    }}
  >
    {Icon && (
      <Box sx={{ mb: 1.5, color: 'text.disabled' }}>
        <Icon sx={{ fontSize: 40 }} />
      </Box>
    )}
    <Typography sx={{ fontWeight: 600 }}>{title}</Typography>
    {description && (
      <Typography sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 360 }}>{description}</Typography>
    )}
    {action && <Box sx={{ mt: 2 }}>{action}</Box>}
  </Box>
);

export default EmptyState;
