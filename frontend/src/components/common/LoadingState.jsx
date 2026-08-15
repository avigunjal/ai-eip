import { Box, Skeleton } from '@mui/material';

/**
 * Loading placeholder (Skeleton). `variant` selects a typical page layout:
 *  - 'card'  : a plain bordered card with 3 lines
 *  - 'table' : header + 5 table rows
 *  - 'grid'  : 4 metric cards
 *
 * REMAINING (extend later):
 *  - more layout variants (detail page, kanban)
 *  - respect reduced-motion
 */
const LoadingState = ({ variant = 'card', sx }) => {
  if (variant === 'grid') {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3, ...sx }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={140} sx={{ borderRadius: 'var(--radius-card)' }} />
        ))}
      </Box>
    );
  }

  if (variant === 'table') {
    return (
      <Box sx={{ ...sx }}>
        <Skeleton variant="rounded" height={48} sx={{ mb: 1, borderRadius: 'var(--radius-card)' }} />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="text" height={40} />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-card)', bgcolor: 'background.paper', ...sx }}>
      <Skeleton width="40%" height={22} />
      <Skeleton height={16} sx={{ mt: 1 }} />
      <Skeleton height={16} sx={{ mt: 0.5 }} />
      <Skeleton width="70%" height={16} sx={{ mt: 0.5 }} />
    </Box>
  );
};

export default LoadingState;
