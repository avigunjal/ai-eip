import { Box, Button, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Surface from '../../../components/styled/Surface.jsx';
import StatusBadge from '../../../components/common/StatusBadge.jsx';
import { paths } from '../../../config/paths.js';
import { formatCurrency } from '../../../config/currency.js';
import {
  DecisionTypeChip,
  DECISION_SEVERITY,
} from '../../../pages/DecisionIntelligence/components/DecisionMeta.jsx';

/** Status badge shown once a decision path has been confirmed. */
const ACTION_PLANNED = { label: 'Action planned', color: 'var(--teal)', bg: 'var(--teal-lighter)', tone: 'success' };

/**
 * Decision workspace header (spec §6): type chip + severity, the decision
 * question as the hero, project/context line, problem summary, potential
 * impact, and the primary actions.
 */
const DecisionHeader = ({ detail, recorded, onSimulate, onTakeAction }) => (
  <Box>
    <Button
      component={RouterLink}
      to={paths.decisionIntelligence}
      startIcon={<ArrowBack />}
      sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 600, mb: 1.5 }}
    >
      Back to decisions
    </Button>

    <Surface sx={{ p: { xs: 2, md: 2.75 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <DecisionTypeChip type={detail.type} />
        <Box sx={{ ml: 'auto', display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
          {recorded && <StatusBadge config={ACTION_PLANNED} />}
          <StatusBadge config={DECISION_SEVERITY[detail.severity] ?? DECISION_SEVERITY.medium} />
        </Box>
      </Box>

      <Typography
        component="h1"
        sx={{ fontSize: { xs: 22, md: 27 }, fontWeight: 700, lineHeight: 1.25, mt: 1.25, letterSpacing: '-0.01em' }}
      >
        {detail.question}
      </Typography>

      <Typography sx={{ fontSize: 13, mt: 0.5, color: 'text.secondary' }}>
        <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {detail.context}
        </Box>
        {' · '}
        {recorded ? 'Decision recorded — action planned' : 'Decision requires action'}
      </Typography>

      <Typography sx={{ mt: 0.75, maxWidth: 720, color: 'text.secondary', lineHeight: 1.55 }}>{detail.description}</Typography>

      <Box
        sx={{
          mt: 2,
          pt: 1.25,
          borderTop: '1px solid',
          borderTopColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'var(--teal)' }}>
          Potential impact {formatCurrency(detail.potentialValue)}
        </Typography>
        <Box sx={{ display: 'inline-flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={onSimulate} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Simulate options
          </Button>
          <Button variant="contained" onClick={onTakeAction} sx={{ textTransform: 'none', fontWeight: 600 }}>
            {recorded ? 'Update decision' : 'Take action'}
          </Button>
        </Box>
      </Box>
    </Surface>
  </Box>
);

export default DecisionHeader;