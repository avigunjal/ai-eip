import { Box, Typography } from '@mui/material';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import PaidOutlined from '@mui/icons-material/PaidOutlined';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Surface from '../../../components/styled/Surface.jsx';
import { POTENTIAL_OUTCOMES } from '../data/decisions.js';

const outcomeIcons = {
  riskReduction: <ArrowDownward sx={{ fontSize: 17, color: 'var(--teal)' }} />,
  capacity: <ArrowUpward sx={{ fontSize: 17, color: 'var(--teal)' }} />,
  estimatedValue: <PaidOutlined sx={{ fontSize: 17, color: 'var(--primary)' }} />,
  singleOwner: <CheckCircle sx={{ fontSize: 17, color: 'var(--teal)' }} />,
};

/**
 * Bottom summary — Potential outcomes (spec section 12.B / 20). A compact
 * two-row strip communicating the aggregate value of acting on decisions.
 * The type distribution once duplicated the category tabs, so it is
 * deliberately not repeated here.
 */
const DecisionOutcomes = () => (
  <Surface
    component="section"
    aria-label="Portfolio potential outcomes"
    sx={{ p: 2.5 }}
  >
    <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1.5 }}>Portfolio potential outcomes</Typography>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', rowGap: 1.25, columnGap: 3.5 }}>
      {POTENTIAL_OUTCOMES.slice(0, 3).map((outcome) => (
        <Box key={outcome.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          {outcomeIcons[outcome.key] ?? outcomeIcons.estimatedValue}
          <Typography sx={{ fontSize: 15, fontWeight: 800, color: 'var(--teal)' }}>
            {outcome.value}
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{outcome.label}</Typography>
        </Box>
      ))}
    </Box>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        mt: 0.75,
        pt: 1,
        borderTop: '1px solid',
        borderTopColor: 'divider',
      }}
    >
      {outcomeIcons.singleOwner}
      <Typography sx={{ fontSize: 15, fontWeight: 800, color: 'var(--teal)' }}>
        {POTENTIAL_OUTCOMES[3].value}
      </Typography>
      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{POTENTIAL_OUTCOMES[3].label}</Typography>
    </Box>
  </Surface>
);

export default DecisionOutcomes;