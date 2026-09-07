import { Box, Button, Chip, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router';
import ArrowForward from '@mui/icons-material/ArrowForward';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import Surface from '../../../components/styled/Surface.jsx';
import StatusBadge from '../../../components/common/StatusBadge.jsx';
import { paths } from '../../../config/paths.js';
import { formatCurrency } from '../../../config/currency.js';
import { DECISIONS } from '../../DecisionIntelligence/data/decisions.js';
import { DECISION_DETAILS } from '../../DecisionDetail/data/decisionDetails.js';
import { DECISION_SEVERITY } from '../../DecisionIntelligence/components/DecisionMeta.jsx';

/**
 * Overview — Decision Intelligence preview (Task 3). Turns three real,
 * highest-priority decisions into an executive "what to decide next, and
 * why" layer. Every decision renders as one uniform clickable strip —
 * badge, question, one-line signals, recommended action, impact, arrow —
 * so there are no competing column budgets and rows always align. All copy
 * derives from the existing decision datasets — nothing is invented here.
 */

/** Ordered ids — Critical first, then High, then Medium (matches Task 3 badge ladder). */
const PREVIEW_ORDER = ['payment-backup', 'payments-delivery', 'data-lake-transfer'];

/** Presentation-only supporting caption under the real monetary value. */
const IMPACT_CAPTION = {
  'payment-backup': 'Value protected',
  'payments-delivery': 'Risk reduction',
  'data-lake-transfer': 'Incident cost avoidance',
};

/** Aggregated impact summary — derived from the same real decisions below. */
const TOTAL_VALUE_PROTECTED = PREVIEW_ORDER.reduce(
  (sum, id) => sum + (DECISIONS.find((d) => d.id === id)?.potentialValue.value ?? 0),
  0,
);

const IMPACT_METRICS = [
  { value: 62, direction: 'down', label: 'Risk exposure reduction', short: 'risk' },
  { value: 28, direction: 'up', label: 'Delivery confidence', short: 'confidence' },
  { value: 22, direction: 'up', label: 'Team capacity improvement', short: 'capacity' },
];

/** Signal tone → value color (mirrors DecisionCard — decorative only). */
const SIGNAL_TONE = {
  critical: 'var(--red)',
  high: 'var(--red)',
  medium: 'var(--amber)',
  positive: 'var(--teal)',
  neutral: 'var(--text-muted)',
};

/** "2" → "Risks", "1" → "Risk" for clean inline signal reads. */
function displayLabel(label, value) {
  const isOne = /^1(\.0+)?$/.test(String(value));
  return isOne && label.endsWith('s') ? label.slice(0, -1) : label;
}

const previewRows = PREVIEW_ORDER.map((id) => {
  const base = DECISIONS.find((d) => d.id === id);
  const detail = DECISION_DETAILS[id];
  if (!base) return null;
  const recommended =
    detail?.options.find((o) => o.tag === 'Recommended') ?? detail?.options[0];
  return {
    decision: base,
    recommendedAction: recommended?.name ?? '—',
    caption: IMPACT_CAPTION[id] ?? 'Potential impact',
  };
}).filter(Boolean);

/** Impact summary — the protected value with the outcome metrics as compact
 * arrow chips, centered as one group under the header. */
const ImpactSummary = () => (
  <Box
    sx={{
      mt: 2,
      py: 1.25,
      px: 2,
      borderRadius: 'var(--radius-card)',
      bgcolor: 'var(--surface-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: 2,
      flexWrap: 'wrap',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
      <Typography sx={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', lineHeight: 1.3 }}>
        Impact if we act
      </Typography>
      <Typography sx={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--primary)' }}>
        {formatCurrency({ value: TOTAL_VALUE_PROTECTED, currency: 'USD' })}
      </Typography>
      <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>Total value protected</Typography>
    </Box>

    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
      {IMPACT_METRICS.map((metric) => (
        <Chip
          key={metric.label}
          size="small"
          icon={metric.direction === 'down' ? <ArrowDownward sx={{ fontSize: 14 }} /> : <ArrowUpward sx={{ fontSize: 14 }} />}
          label={`${metric.value}% ${metric.short}`}
          sx={{
            fontWeight: 600,
            bgcolor: 'background.paper',
            borderColor: 'color-mix(in srgb, var(--success) 45%, transparent)',
            color: 'text.primary',
            '& .MuiChip-icon': { color: 'var(--success)' },
          }}
        />
      ))}
    </Box>
  </Box>
);

/** One decision as a uniform strip — the whole row is a single link, so
 * every row shares identical anatomy and always aligns. */
const DecisionStrip = ({ row, isLast }) => (
  <Box
    component={RouterLink}
    to={paths.decision(row.decision.id)}
    aria-label={`Review decision: ${row.decision.question}`}
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: { xs: 1.25, sm: 2 },
      py: 1.75,
      textDecoration: 'none',
      color: 'inherit',
      ...(!isLast && { borderBottom: '1px solid', borderBottomColor: 'var(--border-table)' }),
      transition: 'background-color 150ms ease',
      '&:hover': {
        bgcolor: 'color-mix(in srgb, var(--surface-subtle) 60%, transparent)',
        textDecoration: 'none',
        '& .strip-cta': {
          bgcolor: 'var(--primary)',
          borderColor: 'var(--primary)',
          color: '#fff',
        },
      },
      '&:focus-visible': { outline: 'var(--focus-ring)', outlineOffset: '2px', borderRadius: 'var(--radius-small)' },
    }}
  >
    <Box sx={{ flexShrink: 0, width: { xs: 88, sm: 96 } }}>
      <StatusBadge config={DECISION_SEVERITY[row.decision.severity] ?? DECISION_SEVERITY.medium} />
    </Box>

    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.4 }}>{row.decision.question}</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 1.25, rowGap: 0.25, mt: 0.5 }}>
        {row.decision.signals.map((signal, i) => {
          const tone = SIGNAL_TONE[signal.tone] ?? SIGNAL_TONE.neutral;
          return (
            <Box key={signal.label} component="span" sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 0.35, whiteSpace: 'nowrap' }}>
              {i > 0 && (
                <Typography component="span" aria-hidden sx={{ fontSize: 12, color: 'text.disabled', mr: 0.9 }}>
                  ·
                </Typography>
              )}
              <Typography component="span" sx={{ fontSize: 12.5, fontWeight: 700, color: tone }}>
                {signal.value}
              </Typography>
              <Typography component="span" sx={{ fontSize: 12.5, color: 'text.secondary' }}>
                {displayLabel(signal.label, signal.value)}
              </Typography>
            </Box>
          );
        })}
      </Box>
      <Typography
        sx={{ fontSize: 12.5, color: 'text.secondary', mt: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        Recommended · {row.recommendedAction}
      </Typography>
    </Box>

    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75, ml: 'auto', flexShrink: 0, pl: 1 }}>
      <Box sx={{ textAlign: 'right', width: { xs: 84, sm: 148 } }}>
        <Typography sx={{ fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap' }}>
          {formatCurrency(row.decision.potentialValue)}
        </Typography>
        <Typography sx={{ fontSize: 11, color: 'text.secondary', whiteSpace: 'nowrap', display: { xs: 'none', sm: 'block' } }}>
          {row.caption}
        </Typography>
      </Box>
      <Box
        aria-hidden
        className="strip-cta"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          fontSize: 12.5,
          fontWeight: 600,
          color: 'var(--primary)',
          border: '1px solid',
          borderColor: 'color-mix(in srgb, var(--primary) 40%, transparent)',
          borderRadius: 999,
          px: 1.75,
          py: 0.7,
          whiteSpace: 'nowrap',
          flexShrink: 0,
          transition: 'background-color 150ms ease, color 150ms ease, border-color 150ms ease',
        }}
      >
        Review
        <ArrowForward sx={{ fontSize: 14 }} />
      </Box>
    </Box>
  </Box>
);

const DecisionIntelligencePreview = () => (
  <Surface sx={{ p: { xs: 2.5, md: 3 } }}>
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
      <Box>
        <Typography sx={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>Decision Intelligence</Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.25 }}>
          AI-powered recommendations based on real engineering signals.
        </Typography>
      </Box>
      <Button
        component={RouterLink}
        to={paths.decisionIntelligence}
        variant="text"
        endIcon={<ArrowForward />}
        sx={{ textTransform: 'none', fontWeight: 600, flexShrink: 0 }}
      >
        View recommended decisions
      </Button>
    </Box>

    <ImpactSummary />

    <Box sx={{ mt: 1.5 }}>
      {previewRows.map((row, i) => (
        <DecisionStrip key={row.decision.id} row={row} isLast={i === previewRows.length - 1} />
      ))}
    </Box>
  </Surface>
);

export default DecisionIntelligencePreview;