import { Box, Chip, Typography } from '@mui/material';
import Person from '@mui/icons-material/Person';
import Speed from '@mui/icons-material/Speed';
import WarningAmber from '@mui/icons-material/WarningAmber';
import TrendingUp from '@mui/icons-material/TrendingUp';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { Link as RouterLink } from 'react-router';
import Surface from '../../../components/styled/Surface.jsx';
import SparkleIcon from '../../../components/ui/SparkleIcon.jsx';
import { paths } from '../../../config/paths.js';
import { formatCurrency } from '../../../config/currency.js';
import { DECISIONS } from '../../DecisionIntelligence/data/decisions.js';

/**
 * Overview — Key Insights (Task 5). The AI interpretation layer: surfaces the
 * four engineering signals that matter most. Single owner risk leads because
 * the whole Overview → Decision Intelligence story is built around Payment
 * Service knowledge concentration, so it reads as the primary signal. The AI
 * assessment closes the panel as the conclusion → action handoff.
 */

/** Severity → distinct icon + existing accent treatment (decorative). */
const INSIGHT_META = {
  positive: { icon: Person, color: 'var(--teal)', bg: 'var(--teal-lighter)' },
  info: { icon: Speed, color: 'var(--info)', bg: 'var(--info-lighter)' },
  critical: { icon: WarningAmber, color: 'var(--red)', bg: 'var(--red-lighter)' },
  warning: { icon: TrendingUp, color: 'var(--amber)', bg: 'var(--amber-lighter)' },
};

/** Largest single-decision potential impact → traces the "business impact"
 * insight back to a real decision value (Atlas → $342K), never invents one. */
const HIGHEST_DECISION_VALUE = formatCurrency({
  value: Math.max(...DECISIONS.map((d) => d.potentialValue.value)),
  currency: 'USD',
});

/** Centralized insight data — rendered via .map(). */
const keyInsights = [
  {
    id: 'single-owner-risk',
    title: 'Single owner risk',
    description: 'Payment Service knowledge is concentrated with one engineer.',
    severity: 'positive',
    primary: true,
    tag: 'Critical',
    tagColor: 'var(--red)',
    tagBg: 'var(--red-lighter)',
  },
  {
    id: 'capacity-pressure',
    title: 'Capacity pressure',
    description: 'Payments Engineering is at 116% capacity across active work.',
    severity: 'info',
  },
  {
    id: 'increasing-risk',
    title: 'Increasing risk exposure',
    description: 'API gateway misconfiguration risk has increased by 28% in the last 30 days.',
    severity: 'critical',
  },
  {
    id: 'business-impact',
    title: 'High business impact',
    description: `Potential value at risk: ${HIGHEST_DECISION_VALUE} if not addressed in the next 2 sprints.`,
    severity: 'warning',
  },
];

const InsightItem = ({ insight, isFirst }) => {
  const meta = INSIGHT_META[insight.severity] ?? INSIGHT_META.info;
  const Icon = meta.icon;
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.25,
        py: 1.25,
        ...(isFirst ? {} : { borderTop: '1px solid', borderTopColor: 'var(--border-table)' }),
      }}
    >
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: 'var(--radius-control)',
          bgcolor: meta.bg,
          color: meta.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          '& svg': { fontSize: 16 },
        }}
      >
        <Icon />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>{insight.title}</Typography>
        <Typography sx={{ fontSize: 12.5, color: 'text.secondary', lineHeight: 1.45, mt: 0.25 }}>
          {insight.description}
        </Typography>
        {insight.primary && insight.tag && (
          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.75, flexWrap: 'wrap' }}>
            <Chip
              size="small"
              label="Knowledge concentration"
              variant="outlined"
              sx={{ fontSize: 10.5, height: 22, borderColor: 'var(--border-strong)', color: 'text.secondary' }}
            />
            <Chip
              size="small"
              label={insight.tag}
              sx={{ fontSize: 10.5, height: 22, bgcolor: insight.tagBg, color: insight.tagColor, fontWeight: 700 }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

const KeyInsightsCard = () => (
  <Surface sx={{ p: { xs: 2.5, md: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
      <Typography sx={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>Key insights</Typography>
      <SparkleIcon sx={{ fontSize: 16, color: 'var(--ai)', flexShrink: 0 }} />
    </Box>
    <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.25 }}>
      Engineering signals requiring focus
    </Typography>

    <Box sx={{ mt: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
      {keyInsights.map((insight, i) => (
        <InsightItem key={insight.id} insight={insight} isFirst={i === 0} />
      ))}
    </Box>

    <Box
      sx={{
        mt: 1.5,
        pt: 1.75,
        borderTop: '1px solid',
        borderTopColor: 'var(--border-table)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 1.5,
          borderRadius: 'var(--radius-card)',
          bgcolor: 'var(--primary-lighter)',
        }}
      >
        <SparkleIcon sx={{ fontSize: 24, color: 'var(--primary)', flexShrink: 0 }} />
        <Typography sx={{ fontSize: 12.5, lineHeight: 1.5, flex: 1, minWidth: 0 }}>
          3 decisions could reduce delivery risk and improve delivery confidence.
        </Typography>
        <Box
          component={RouterLink}
          to={paths.insights}
          aria-label="View insights"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            color: 'var(--primary)',
            flexShrink: 0,
            '&:hover': { color: 'color-mix(in srgb, var(--primary) 80%, black)' },
          }}
        >
          <ArrowForward sx={{ fontSize: 24 }} />
        </Box>
      </Box>
    </Box>
  </Surface>
);

export default KeyInsightsCard;