import { Box, Typography } from '@mui/material';
import CheckCircle from '@mui/icons-material/CheckCircle';
import SparkleIcon from './SparkleIcon.jsx';
import { useCountUp } from '../../hooks/useCountUp.js';
import { useAiTerms } from '../../hooks/useAiTerms.js';
import { fadeSlideIn, slowPulse } from '../../config/animations.js';

const LiveDot = () => (
  <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
    <Box
      component="span"
      sx={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        bgcolor: 'var(--teal)',
        animation: `${slowPulse} 3s ease-in-out infinite`,
      }}
    />
    <Typography component="span" sx={{ fontSize: 12, fontWeight: 600, color: 'var(--teal)' }}>
      Live
    </Typography>
  </Box>
);

/**
 * AI Analysis Engine status card (Insights page). Renders the live analysis
 * loop as a data-driven summary — signals reviewed (count-up), source
 * coverage, freshness — so the page reads as "AI is continuously analyzing"
 * without claiming anything the backend doesn't back.
 */
const AiStatusCard = ({ signals = 0, sources = [], updatedLabel = 'just now', sx }) => {
  const count = useCountUp(signals, 900);
  const { t } = useAiTerms();
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--border)',
        borderLeft: '4px solid var(--primary)',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        animation: `${fadeSlideIn} 400ms ease`,
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <SparkleIcon sx={{ fontSize: 16, color: 'var(--primary)' }} />
        <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{t('analysisEngine')}</Typography>
        <Box sx={{ ml: 'auto' }}>
          <LiveDot />
        </Box>
      </Box>

      <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
        Analyzing{' '}
        <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {count}
        </Box>{' '}
        engineering signals…
      </Typography>

      {sources.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {sources.map(({ name, count: n }) => (
            <Box key={name} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
              <CheckCircle sx={{ fontSize: 15, color: 'var(--teal)' }} />
              <Typography component="span" sx={{ fontSize: 13, color: 'text.secondary' }}>
                <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {name}
                </Box>{' '}
                · {n}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>Last updated {updatedLabel}</Typography>
    </Box>
  );
};

export default AiStatusCard;