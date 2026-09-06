import { Box, Skeleton } from '@mui/material';

/**
 * Loading skeleton for the Decision Workspace during the simulated detail
 * fetch — mirrors the narrative page shape so the eventual layout doesn't
 * shift once content loads.
 */
const DecisionDetailSkeleton = () => {
  const Block = ({ rows = 1 }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={40} />
      ))}
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 1140, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Skeleton width={180} height={32} />
        <Box sx={{ mt: 1.5, p: 3, borderRadius: 'var(--radius-card)', outline: '1px solid', outlineColor: 'divider', bgcolor: 'background.paper' }}>
          <Skeleton width={420} height={30} />
          <Skeleton width={300} height={16} sx={{ mt: 1.5 }} />
          <Skeleton width="85%" height={16} sx={{ mt: 1.5 }} />
          <Skeleton width={240} height={40} sx={{ mt: 2.5 }} />
        </Box>
      </Box>

      <Box>
        <Skeleton width={220} height={18} />
        <Box sx={{ mt: 1.25, p: 3, borderRadius: 'var(--radius-card)', outline: '1px solid', outlineColor: 'divider', bgcolor: 'background.paper' }}>
          <Block rows={2} />
        </Box>
      </Box>

      <Box>
        <Skeleton width={220} height={18} />
        <Box sx={{ mt: 1.25, borderRadius: 'var(--radius-card)', outline: '1px solid', outlineColor: 'divider', bgcolor: 'background.paper', p: 2 }}>
          <Block rows={3} />
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        {[0, 1, 2].map((i) => (
          <Box key={i} sx={{ p: 2.5, borderRadius: 'var(--radius-card)', outline: '1px solid', outlineColor: 'divider', bgcolor: 'background.paper' }}>
            <Skeleton width={90} height={14} />
            <Skeleton width="80%" height={20} sx={{ mt: 1.5 }} />
            <Skeleton width="95%" height={14} sx={{ mt: 1 }} />
            <Skeleton width="70%" height={14} sx={{ mt: 0.75 }} />
            <Skeleton width={120} height={32} sx={{ mt: 2 }} />
          </Box>
        ))}
      </Box>

      <Box sx={{ borderRadius: 'var(--radius-card)', outline: '1px solid', outlineColor: 'divider', bgcolor: 'background.paper', p: 3 }}>
        <Skeleton width={160} height={18} />
        <Skeleton width="90%" height={15} sx={{ mt: 1.5 }} />
        <Skeleton width="75%" height={15} sx={{ mt: 0.75 }} />
      </Box>
    </Box>
  );
};

export default DecisionDetailSkeleton;