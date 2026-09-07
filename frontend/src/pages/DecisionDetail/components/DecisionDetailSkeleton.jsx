import { Box, Skeleton } from '@mui/material';

/**
 * Loading skeleton for the Decision Workspace during the simulated detail
 * fetch — mirrors the narrative page shape section-for-section so the
 * eventual layout doesn't shift once content loads:
 * Header → Problem → Evidence → Options → Compare → Recommendation →
 * Impact → Final decision panel.
 */
const DecisionDetailSkeleton = () => {
  const HeaderBlock = () => (
    <Box
      sx={{
        p: { xs: 2, md: 2.75 },
        borderRadius: 'var(--radius-card)',
        outline: '1px solid',
        outlineColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
        <Skeleton variant="rounded" width={120} height={26} />
        <Skeleton variant="rounded" width={110} height={26} />
      </Box>
      <Skeleton width="72%" height={30} sx={{ mt: 1.5 }} />
      <Skeleton width="40%" height={14} sx={{ mt: 1 }} />
      <Skeleton width="92%" height={14} sx={{ mt: 1.5 }} />
      <Skeleton width="78%" height={14} sx={{ mt: 0.5 }} />
      <Box
        sx={{
          mt: 2,
          pt: 1.5,
          borderTop: '1px solid',
          borderTopColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <Skeleton width={170} height={18} />
        <Box sx={{ display: 'inline-flex', gap: 1 }}>
          <Skeleton variant="rounded" width={140} height={38} />
          <Skeleton variant="rounded" width={120} height={38} />
        </Box>
      </Box>
    </Box>
  );

  const SectionHeading = () => (
    <Box>
      <Skeleton width={120} height={13} />
      <Skeleton width={220} height={22} sx={{ mt: 0.75 }} />
      <Skeleton width="70%" height={13} sx={{ mt: 0.75 }} />
    </Box>
  );

  const Card = ({ children, sx }) => (
    <Box
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: 'var(--radius-card)',
        outline: '1px solid',
        outlineColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: 'var(--shadow-card)',
        ...sx,
      }}
    >
      {children}
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 1140, width: '100%', minWidth: 0, mx: 'auto' }}>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
        <Skeleton width={16} height={16} variant="circular" />
        <Skeleton width={120} height={16} />
      </Box>

      <HeaderBlock />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 3 }}>
        {/* 01 · Problem */}
        <Box component="section">
          <SectionHeading />
          <Card sx={{ mt: 2 }}>
            <Skeleton width={230} height={18} />
            <Skeleton width="90%" height={14} sx={{ mt: 1.25 }} />
            <Skeleton width="96%" height={14} sx={{ mt: 0.5 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 1.25, mt: 2.5 }}>
              {[0, 1, 2, 3].map((i) => (
                <Box key={i} sx={{ p: 1.25, borderRadius: 'var(--radius-small)', bgcolor: 'var(--surface-subtle)' }}>
                  <Skeleton width="70%" height={11} />
                  <Skeleton width={52} height={20} sx={{ mt: 0.6 }} />
                </Box>
              ))}
            </Box>
          </Card>
        </Box>

        {/* 02 · Evidence */}
        <Box component="section">
          <SectionHeading />
          <Box
            sx={{
              mt: 2,
              px: { xs: 1.25, sm: 2 },
              py: 2,
              borderRadius: 'var(--radius-card)',
              outline: '1px solid',
              outlineColor: 'divider',
              bgcolor: 'background.paper',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <Box sx={{ display: 'flex', gap: 1.75, px: { xs: 1, sm: 1.75 }, py: 0.25 }}>
              <Skeleton variant="rounded" width={36} height={36} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5, alignItems: 'center' }}>
                  <Skeleton width={180} height={15} />
                  <Skeleton width={52} height={15} />
                </Box>
                <Skeleton width="88%" height={13} sx={{ mt: 0.6 }} />
                <Skeleton variant="rounded" width="50%" height={6} sx={{ mt: 1.25, borderRadius: 4 }} />
              </Box>
            </Box>
            <Box sx={{ height: 1, bgcolor: 'divider', my: 2 }} />
            <Box sx={{ display: 'flex', gap: 1.75, px: { xs: 1, sm: 1.75 }, py: 0.25 }}>
              <Skeleton variant="rounded" width={36} height={36} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5, alignItems: 'center' }}>
                  <Skeleton width={150} height={15} />
                  <Skeleton width={48} height={15} />
                </Box>
                <Skeleton width="80%" height={13} sx={{ mt: 0.6 }} />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* 03 · Options */}
        <Box component="section">
          <SectionHeading />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mt: 2 }}>
            {[0, 1, 2].map((i) => (
              <Card key={i} sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Skeleton width={72} height={12} />
                  <Skeleton variant="rounded" width={92} height={22} />
                </Box>
                <Skeleton width="70%" height={17} sx={{ mt: 1.5 }} />
                <Skeleton width="95%" height={13} sx={{ mt: 0.6 }} />
                <Skeleton width="88%" height={13} sx={{ mt: 0.4 }} />
                <Skeleton width={90} height={12} sx={{ mt: 1.5 }} />
                <Skeleton width="80%" height={13} sx={{ mt: 0.7 }} />
                <Skeleton width="65%" height={13} sx={{ mt: 0.4 }} />
                <Skeleton width={90} height={12} sx={{ mt: 1.4 }} />
                <Skeleton width="70%" height={13} sx={{ mt: 0.7 }} />
                <Skeleton variant="text" width={120} height={26} sx={{ mt: 1.6 }} />
              </Card>
            ))}
          </Box>
        </Box>

        {/* 04 · Compare */}
        <Box component="section">
          <SectionHeading />
          <Box
            sx={{
              mt: 2,
              borderRadius: 'var(--radius-card)',
              outline: '1px solid',
              outlineColor: 'divider',
              bgcolor: 'background.paper',
              boxShadow: 'var(--shadow-card)',
              overflow: 'hidden',
              minWidth: 0,
            }}
          >
            <Box sx={{ display: 'grid', gridTemplateColumns: '22% 26% 26% 26%', minWidth: 560 }}>
              <Box sx={{ p: '12px 16px', bgcolor: 'var(--surface-subtle)' }}>
                <Skeleton width={110} height={12} />
              </Box>
              {[0, 1, 2].map((i) => (
                <Box key={i} sx={{ p: '12px 16px', bgcolor: 'var(--surface-subtle)', borderLeft: '1px solid', borderLeftColor: 'divider' }}>
                  <Skeleton width={72} height={12} />
                  <Skeleton width="82%" height={13} sx={{ mt: 0.6 }} />
                </Box>
              ))}
              {[0, 1, 2, 3].map((row) => (
                <Box key={`labels-${row}`} sx={{ display: 'contents' }}>
                  <Box sx={{ p: '11px 16px', bgcolor: 'background.paper', borderBottom: '1px solid', borderBottomColor: 'var(--border-table)' }}>
                    <Skeleton width={96} height={13} />
                  </Box>
                  {[0, 1, 2].map((i) => (
                    <Box
                      key={`r${row}c${i}`}
                      sx={{ p: '11px 16px', bgcolor: 'background.paper', borderBottom: '1px solid', borderBottomColor: 'var(--border-table)', borderLeft: '1px solid', borderLeftColor: 'divider' }}
                    >
                      <Skeleton width={44} height={13} />
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* 05 · Recommendation */}
        <Box component="section">
          <SectionHeading />
          <Box
            sx={{
              mt: 2,
              p: { xs: 2.5, md: 3.5 },
              borderRadius: 'var(--radius-card)',
              bgcolor: 'var(--primary-lighter)',
              outline: '1px solid',
              outlineColor: 'color-mix(in srgb, var(--primary) 40%, transparent)',
            }}
          >
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
              <Skeleton variant="circular" width={17} height={17} />
              <Skeleton width={140} height={13} />
            </Box>
            <Skeleton width={110} height={12} sx={{ mt: 2 }} />
            <Skeleton width="60%" height={22} sx={{ mt: 0.5 }} />
            <Skeleton width="92%" height={14} sx={{ mt: 1.25 }} />
            <Skeleton width="84%" height={14} sx={{ mt: 0.5 }} />
            <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid', borderTopColor: 'color-mix(in srgb, var(--primary) 25%, transparent)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Skeleton width={180} height={12} />
                <Skeleton variant="rounded" width={200} height={6} sx={{ borderRadius: 4 }} />
                <Skeleton width={40} height={15} />
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 2 }}>
            <Card>
              <Skeleton width={190} height={15} />
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} width={`${84 - i * 8}%`} height={13} sx={{ mt: 1.4 }} />
              ))}
            </Card>
            <Card>
              <Skeleton width={160} height={15} />
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} width={`${78 - i * 9}%`} height={13} sx={{ mt: 1.4 }} />
              ))}
            </Card>
          </Box>
        </Box>

        {/* 06 · Impact */}
        <Box component="section">
          <SectionHeading />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mt: 2 }}>
            {[0, 1, 2, 3].map((i) => (
              <Card key={i} sx={{ p: { xs: 2, md: 2.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Skeleton width={110} height={12} />
                  <Skeleton variant="circular" width={17} height={17} />
                </Box>
                <Skeleton width={80} height={22} sx={{ mt: 1.25 }} />
              </Card>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Final decision panel */}
      <Box
        component="section"
        sx={{
          mt: 4,
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 'var(--radius-card)',
          bgcolor: 'var(--primary-lighter)',
          outline: '1px solid',
          outlineColor: 'color-mix(in srgb, var(--primary) 30%, transparent)',
        }}
      >
        <Skeleton width={140} height={13} />
        <Skeleton width={260} height={22} sx={{ mt: 0.75 }} />
        <Skeleton width="68%" height={14} sx={{ mt: 1 }} />
        <Skeleton width="55%" height={14} sx={{ mt: 0.5 }} />
        <Skeleton variant="rounded" width={180} height={42} sx={{ mt: 2 }} />
      </Box>
    </Box>
  );
};

export default DecisionDetailSkeleton;