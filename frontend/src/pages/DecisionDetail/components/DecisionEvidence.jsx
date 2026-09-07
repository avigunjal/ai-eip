import { Fragment } from 'react';
import { Box, Divider, Typography } from '@mui/material';
import Speed from '@mui/icons-material/Speed';
import Verified from '@mui/icons-material/Verified';
import Description from '@mui/icons-material/Description';
import Person from '@mui/icons-material/Person';
import SupportAgent from '@mui/icons-material/SupportAgent';
import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined';
import AccountTree from '@mui/icons-material/AccountTree';
import Insights from '@mui/icons-material/Insights';
import TrendingUp from '@mui/icons-material/TrendingUp';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import Surface from '../../../components/styled/Surface.jsx';

/**
 * Section 02 — What AI-EIP sees (spec §9/§10): a structured evidence panel.
 * Each evidence item carries a semantic icon, title, value, concise
 * explanation, and lightweight source metadata. Capacity / coverage items get
 * a simple horizontal bar instead of a chart.
 */
const EVIDENCE_ICONS = {
  capacity: Speed,
  skill: Verified,
  docs: Description,
  owner: Person,
  backup: SupportAgent,
  risks: ErrorOutlineOutlined,
  dependency: AccountTree,
  confidence: Insights,
  trend: TrendingUp,
};

/** Tone derived from the evidence's threshold — good / warn / critical. */
function barToneOf(evidence) {
  if (evidence.key === 'capacity') {
    return evidence.bar > 100 ? 'critical' : evidence.bar > 95 ? 'warn' : 'good';
  }
  if ((evidence.bar ?? 0) >= 90) return 'good';
  if ((evidence.bar ?? 0) >= 70) return 'warn';
  return 'critical';
}

const TONE_COLOR = { good: 'var(--teal)', warn: 'var(--amber)', critical: 'var(--red)' };

const EvidenceSignal = ({ evidence }) => {
  const Icon = EVIDENCE_ICONS[evidence.key] ?? InfoOutlined;
  const tone = barToneOf(evidence);
  const color = TONE_COLOR[tone];
  const barScale = evidence.key === 'capacity' ? 120 : 100;
  const barWidth = Math.min(((evidence.bar ?? 0) / barScale) * 100, 100);
  const rising = evidence.trend === 'rising';

  return (
    <Box sx={{ display: 'flex', gap: 1.75, px: { xs: 1, sm: 1.75 }, py: 2.25 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          flexShrink: 0,
          borderRadius: 'var(--radius-control)',
          bgcolor: 'var(--surface-subtle)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon sx={{ fontSize: 19 }} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{evidence.title}</Typography>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color }}>{evidence.value}</Typography>
            {evidence.trend && evidence.key !== 'trend' && (
              <TrendingUp
                sx={{ fontSize: 16, color: rising ? 'var(--red)' : 'var(--teal)', transform: rising ? 'none' : 'rotate(180deg)' }}
                aria-hidden
              />
            )}
          </Box>
        </Box>

        <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.35, lineHeight: 1.5 }}>
          {evidence.description}
        </Typography>

        {evidence.bar != null && (
          <Box
            sx={{
              mt: 1.25,
              height: 6,
              width: '100%',
              maxWidth: 420,
              borderRadius: 4,
              bgcolor: 'var(--surface-subtle)',
              overflow: 'hidden',
            }}
            aria-hidden
          >
            <Box sx={{ width: `${barWidth}%`, height: '100%', borderRadius: 4, bgcolor: color }} />
          </Box>
        )}

        {evidence.source && (
          <Typography sx={{ fontSize: 11.5, color: 'text.disabled', mt: 1 }}>
            Source: {evidence.source}
            {evidence.updated ? ` · Updated ${evidence.updated}` : ''}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

const DecisionEvidence = ({ evidence }) => (
  <Surface sx={{ px: { xs: 1.25, sm: 2 }, py: 1 }}>
    {evidence.map((item, i) => (
      <Fragment key={item.key}>
        {i > 0 && <Divider />}
        <EvidenceSignal evidence={item} />
      </Fragment>
    ))}
  </Surface>
);

export default DecisionEvidence;