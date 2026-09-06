import { Box, Typography } from '@mui/material';

/**
 * Narrative section wrapper for the Decision Workspace. Each section carries a
 * numbered step + kicker so the page reads as a story (Problem → Evidence →
 * Options → Simulation → Recommendation → Impact), never six equal cards.
 */
const DecisionSection = ({ step, kicker, title, copy, children, sx, id }) => (
  <Box component="section" id={id} sx={{ scrollMarginTop: 80, ...sx }}>
    <Typography
      component="span"
      sx={{
        display: 'block',
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--primary)',
      }}
    >
      {step} · {kicker}
    </Typography>
    <Typography component="h2" sx={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3, mt: 0.75 }}>
      {title}
    </Typography>
    {copy && (
      <Typography sx={{ color: 'text.secondary', mt: 0.75, maxWidth: 760, lineHeight: 1.45 }}>{copy}</Typography>
    )}
    <Box sx={{ mt: 2 }}>{children}</Box>
  </Box>
);

export default DecisionSection;