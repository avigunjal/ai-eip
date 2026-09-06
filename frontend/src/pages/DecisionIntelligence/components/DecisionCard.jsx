import { Box, Button, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router';
import ArrowForward from '@mui/icons-material/ArrowForward';
import Surface from '../../../components/styled/Surface.jsx';
import StatusBadge from '../../../components/common/StatusBadge.jsx';
import { paths } from '../../../config/paths.js';
import { fadeSlideIn } from '../../../config/animations.js';
import { formatCurrency } from '../../../config/currency.js';
import { DecisionTypeChip, DECISION_SEVERITY } from './DecisionMeta.jsx';
import { useDecisionRecord } from '../../../store/decisionStore.js';

/** Signal tone → value color. Decorative only — the value/label text carries meaning. */
const signalTone = {
  critical: 'var(--red)',
  high: 'var(--red)',
  medium: 'var(--amber)',
  positive: 'var(--teal)',
  neutral: 'var(--text-muted)',
};

/** "Action planned" badge when the decision was confirmed in the workspace. */
const ACTION_PLANNED = { label: 'Action planned', color: 'var(--teal)', bg: 'var(--teal-lighter)', tone: 'success' };

/** "2" → "Risks", "1" → "Risk" for clean inline signal reads. */
function displayLabel(label, value) {
  const isOne = /^1(\.0+)?$/.test(String(value));
  return isOne && label.endsWith('s') ? label.slice(0, -1) : label;
}

/**
 * A decision in the inbox (spec sections 8–10). The decision question is the
 * hero; context, signals, and potential impact are supporting evidence. Dense
 * layout keeps 4–5 decisions on-screen — reads as an opportunity to decide,
 * not a risk alert.
 */
const DecisionCard = ({ decision, index = 0 }) => {
  const recorded = useDecisionRecord(decision.id);
  return (
    <Surface
      sx={{
        p: 2.5,
        animation: `${fadeSlideIn} 300ms ease both`,
        animationDelay: `${Math.min(index, 6) * 80}ms`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <DecisionTypeChip type={decision.type} />
        <Box sx={{ ml: 'auto', display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
          {recorded && <StatusBadge config={ACTION_PLANNED} />}
          <StatusBadge config={DECISION_SEVERITY[decision.severity] ?? DECISION_SEVERITY.medium} />
        </Box>
      </Box>

    <Typography component="h3" sx={{ fontSize: 17, fontWeight: 700, lineHeight: 1.35, mt: 1.25 }}>
      {decision.question}
    </Typography>

    <Typography sx={{ fontSize: 13, mt: 0.5, color: 'text.secondary', lineHeight: 1.5 }}>
      <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>{decision.context}</Box>
      {' · '}
      {decision.description}
    </Typography>

    <Box
      component="p"
      sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 1.5, mt: 1.75 }}
      aria-label="Supporting signals"
    >
      {decision.signals.map((signal, i) => {
        const tone = signalTone[signal.tone] ?? signalTone.neutral;
        return (
          <Box key={signal.label} component="span" sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 0.5 }}>
            {i > 0 && (
              <Typography component="span" aria-hidden sx={{ fontSize: 13, color: 'text.disabled', mr: 1 }}>
                ·
              </Typography>
            )}
            <Typography component="span" sx={{ fontSize: 13, fontWeight: 700, color: tone }}>
              {signal.value}
            </Typography>
            <Typography component="span" sx={{ fontSize: 13, color: 'text.secondary' }}>
              {displayLabel(signal.label, signal.value)}
            </Typography>
          </Box>
        );
      })}
    </Box>

    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
        flexWrap: 'wrap',
        mt: 2.25,
        pt: 1.25,
        borderTop: '1px solid',
        borderTopColor: 'divider',
      }}
    >
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'var(--teal)' }}>
        Potential impact {formatCurrency(decision.potentialValue)}
      </Typography>
      <Button
        component={RouterLink}
        to={paths.decision(decision.id)}
        variant="text"
        endIcon={<ArrowForward />}
        sx={{ textTransform: 'none', fontWeight: 600 }}
      >
        {recorded ? 'View decision' : 'Review decision'}
      </Button>
    </Box>
    </Surface>
  );
};

export default DecisionCard;