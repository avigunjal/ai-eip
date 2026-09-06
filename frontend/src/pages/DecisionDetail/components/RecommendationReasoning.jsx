import { Box, Typography } from '@mui/material';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import SwapHoriz from '@mui/icons-material/SwapHoriz';
import VerifiedUserOutlined from '@mui/icons-material/VerifiedUserOutlined';
import Surface from '../../../components/styled/Surface.jsx';

/**
 * Reasoning behind the recommendation (spec §18): the ranked, evidence-led
 * "why" points, the trade-offs of the recommended path, and the caveats
 * leadership should weigh before committing. All content is derived by the
 * recommendation engine from the decision's own signals.
 */
const RecommendationReasoning = ({ explanation }) => (
  <Box component="section" aria-label="Recommendation reasoning">
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
      <Surface sx={{ p: { xs: 2.5, md: 3 } }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
          <CheckCircleOutlined sx={{ fontSize: 18, color: 'var(--teal)' }} />
          <Typography sx={{ fontSize: 14, fontWeight: 700 }}>Why this option is recommended</Typography>
        </Box>
        <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {explanation.whyRecommended.map((reason, i) => (
            <Box key={reason.text} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Box
                component="span"
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  mt: '1px',
                  minWidth: 20,
                  color: 'var(--primary)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {i + 1}.
              </Box>
              <Typography sx={{ fontSize: 13.5, lineHeight: 1.5, color: 'text.secondary' }}>{reason.text}</Typography>
            </Box>
          ))}
        </Box>
      </Surface>

      <Surface sx={{ p: { xs: 2.5, md: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
            <SwapHoriz sx={{ fontSize: 18, color: 'text.disabled' }} />
            <Typography sx={{ fontSize: 14, fontWeight: 700 }}>Trade-offs to weigh</Typography>
          </Box>
        </Box>
        <Box component="ul" sx={{ m: 0, mt: 1.5, pl: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {explanation.tradeoffs.map((t) => (
            <Box component="li" key={t.text} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Box component="span" sx={{ fontSize: 12, mt: '1px', color: 'text.disabled' }}>—</Box>
              <Typography sx={{ fontSize: 13.5, lineHeight: 1.5, color: 'text.secondary' }}>{t.text}</Typography>
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            mt: 2,
            p: 1.5,
            borderRadius: 'var(--radius-control)',
            bgcolor: 'var(--surface-subtle)',
            outline: '1px solid',
            outlineColor: 'divider',
            display: 'flex',
            gap: 1,
          }}
        >
          <VerifiedUserOutlined sx={{ fontSize: 17, mt: '2px', color: 'var(--primary)', flexShrink: 0 }} />
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}>
              For leadership
            </Typography>
            {explanation.leadershipConsiderations.map((line) => (
              <Typography key={line} sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5, lineHeight: 1.5 }}>
                {line}
              </Typography>
            ))}
          </Box>
        </Box>
      </Surface>
    </Box>
  </Box>
);

export default RecommendationReasoning;