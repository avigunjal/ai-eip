import { Box, Typography } from '@mui/material';
import Surface from '../../../components/styled/Surface.jsx';

/** Decorative driver tone → value color. The label text carries the meaning. */
const DRIVER_TONE = {
  critical: 'var(--red)',
  high: 'var(--red)',
  medium: 'var(--amber)',
  positive: 'var(--teal)',
  neutral: 'var(--text-muted)',
  impact: 'var(--primary)',
};

/**
 * Section 01 — The decision (spec §8): why it needs attention plus a compact
 * set of key drivers. Deliberately a lightweight inline grid, not KPI cards —
 * this is a decision workspace, not a dashboard.
 */
const DecisionProblem = ({ problem }) => (
  <Surface sx={{ p: { xs: 2.5, md: 3.5 } }}>
    <Typography sx={{ fontSize: 16, fontWeight: 700 }}>Why this decision needs attention</Typography>
    {problem.why.map((paragraph) => (
      <Typography key={paragraph} sx={{ mt: 1.25, color: 'text.secondary', maxWidth: 720, lineHeight: 1.55 }}>
        {paragraph}
      </Typography>
    ))}

    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
        gap: 1.25,
        mt: 2.25,
      }}
    >
      {problem.drivers.map((driver) => (
        <Box
          key={driver.label}
          sx={{
            p: 1.25,
            borderRadius: 'var(--radius-small)',
            bgcolor: 'var(--surface-subtle)',
            outline: '1px solid',
            outlineColor: 'divider',
          }}
        >
          <Typography
            sx={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}
          >
            {driver.label}
          </Typography>
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 700,
              mt: 0.25,
              color: DRIVER_TONE[driver.tone] ?? DRIVER_TONE.neutral,
            }}
          >
            {driver.value}
          </Typography>
        </Box>
      ))}
    </Box>
  </Surface>
);

export default DecisionProblem;