import { Box, Typography } from '@mui/material';
import CheckCircle from '@mui/icons-material/CheckCircle';
import SparkleIcon from './SparkleIcon.jsx';
import { fadeSlideIn } from '../../config/animations.js';

const ANALYZING_STEPS = ['Risk signals', 'Ownership graph', 'Historical patterns'];

// Entrance reveal that starts hidden and staggers in, but stays fully visible
// for reduced-motion users.
const revealSx = (delay) => ({
  opacity: 0,
  animation: `${fadeSlideIn} 300ms ease ${delay}ms forwards`,
  '@media (prefers-reduced-motion: reduce)': { opacity: 1, animation: 'none' },
});

/**
 * Animated checklist shown while an AI/LLM request is in flight — mirrors the
 * analysis step naming used across the Insights and Project Assessment cards.
 */
const AnalyzingPanel = () => (
  <Box
    sx={{
      mt: 1,
      pl: 1.5,
      borderLeft: '2px solid var(--primary-lighter)',
      display: 'flex',
      flexDirection: 'column',
      gap: 0.75,
      animation: `${fadeSlideIn} 250ms ease`,
    }}
  >
    <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: 13, fontWeight: 600 }}>
      <SparkleIcon sx={{ fontSize: 15, color: 'var(--primary)' }} />
      Analyzing evidence…
    </Typography>
    {ANALYZING_STEPS.map((step, idx) => (
      <Box key={step} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, ...revealSx(160 + idx * 140) }}>
        <CheckCircle sx={{ fontSize: 15, color: 'var(--teal)' }} />
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{step}</Typography>
      </Box>
    ))}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, ...revealSx(620) }}>
      <SparkleIcon sx={{ fontSize: 15, color: 'var(--primary)' }} />
      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Generating explanation…</Typography>
    </Box>
  </Box>
);

export default AnalyzingPanel;