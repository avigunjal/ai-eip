import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  LinearProgress,
  Tooltip,
  Typography,
} from '@mui/material';
import Close from '@mui/icons-material/Close';
import Description from '@mui/icons-material/Description';
import Verified from '@mui/icons-material/Verified';
import Insights from '@mui/icons-material/Insights';
import Analytics from '@mui/icons-material/Analytics';
import MilitaryTech from '@mui/icons-material/MilitaryTech';
import FactCheck from '@mui/icons-material/FactCheck';
import CheckCircle from '@mui/icons-material/CheckCircle';
import { approveRecognition, fetchRecognitionDetail, fetchRecognitionExplanation } from '../../../api/recognition.js';
import { AWARD_LEVELS } from '../data/awardLevels.js';
import { DIMENSION_LABEL, SOURCE_LABEL } from '../data/recognitionLabels.js';
import { formatDate, formatRelative } from '../../../config/dates.js';
import { TOPBAR_HEIGHT } from '../../../config/constants.js';
import { paths } from '../../../config/paths.js';
import { getPeople } from '../../../data/service.js';
import SparkleIcon from '../../../components/ui/SparkleIcon.jsx';
import { modelLabel } from '../../../config/modelLabel.js';

const INTELLIGENCE_DIMENSIONS = [
  { key: 'evidenceStrength', label: 'Evidence Strength' },
  { key: 'impact', label: 'Impact' },
  { key: 'scope', label: 'Scope' },
  { key: 'consistency', label: 'Consistency' },
];

function initialsOf(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return `${first}${last}`.toUpperCase();
}

function avatarOf(person) {
  const fixture = person?.id ? new Map(getPeople().map((p) => [p.id, p])).get(person.id) : null;
  if (fixture) return { name: fixture.name, initials: fixture.initials, avatarColor: fixture.avatarColor };
  return {
    name: person?.name ?? 'Team member',
    initials: initialsOf(person?.name),
    avatarColor: 'var(--primary)',
  };
}

const StatusPill = ({ status }) => {
  if (status === 'approved')
    return <Chip size="small" label="Approved" sx={{ bgcolor: 'var(--success-lighter)', color: 'success.main', fontWeight: 700, height: 24, fontSize: 11.5 }} />;
  if (status === 'rejected')
    return <Chip size="small" label="Rejected" sx={{ bgcolor: 'var(--red-lighter)', color: 'error.main', fontWeight: 700, height: 24, fontSize: 11.5 }} />;
  return <Chip size="small" label="Pending review" sx={{ bgcolor: 'var(--amber-lighter)', color: 'var(--amber)', fontWeight: 700, height: 24, fontSize: 11.5 }} />;
};

const Section = ({ step, icon, title, helper, children }) => (
  <Box>
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 26,
          height: 26,
          borderRadius: '999px',
          border: '1px solid',
          borderColor: 'divider',
          color: 'text.secondary',
          fontSize: 11,
          fontWeight: 700,
          flexShrink: 0,
          mt: 0.2,
        }}
      >
        {step}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75, pt: 0.2 }}>
        {icon}
        <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{title}</Typography>
      </Box>
    </Box>
    {helper && (
      <Typography sx={{ fontSize: 12, color: 'text.secondary', ml: 4.5, mt: -0.25, mb: 1 }}>
        {helper}
      </Typography>
    )}
    <Box sx={{ ml: 4.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>{children}</Box>
  </Box>
);

const CheckRow = ({ children }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
    <CheckCircle sx={{ fontSize: 16, color: 'success.main', mt: 0.2, flexShrink: 0 }} />
    <Typography sx={{ fontSize: 13.5, color: 'text.secondary', lineHeight: 1.5 }}>{children}</Typography>
  </Box>
);

const ScoreRow = ({ label, value }) => (
  <Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>{label}</Typography>
      <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>{value}/100</Typography>
    </Box>
    <LinearProgress
      variant="determinate"
      value={value}
      sx={{ height: 4, borderRadius: 999, mt: 0.5, bgcolor: 'background.paper', '& .MuiLinearProgress-bar': { bgcolor: 'var(--primary)' } }}
    />
  </Box>
);

const EvidenceBlock = ({ evidence }) => (
  <Box
    sx={{
      p: 1.5,
      outline: '1px solid',
      outlineColor: 'divider',
      borderRadius: 'var(--radius-control)',
      bgcolor: 'background.default',
      display: 'flex',
      flexDirection: 'column',
      gap: 0.5,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}>
      <Box
        component="span"
        sx={{
          fontSize: 10.5,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
          color: evidence.role === 'primary' ? 'success.main' : 'text.secondary',
        }}
      >
        {evidence.role}
      </Box>
      {evidence.url ? (
        <Typography
          component="a"
          href={evidence.url}
          target="_blank"
          rel="noreferrer"
          sx={{ fontSize: 12.5, color: 'primary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          {SOURCE_LABEL[evidence.source] ?? evidence.source}
        </Typography>
      ) : (
        <Typography sx={{ fontSize: 12.5, color: 'text.primary', fontWeight: 600 }}>
          {SOURCE_LABEL[evidence.source] ?? evidence.source}
        </Typography>
      )}
      <Box component="span" sx={{ color: 'text.secondary', fontSize: 12 }}>
        · {formatRelative(evidence.occurredAt)}
      </Box>
    </Box>
    <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.5 }}>{evidence.statement}</Typography>
  </Box>
);

/**
 * Recognition Detail / "Why this recognition?" — the explainable decision
 * trail for one recognition: Contribution → Verified Evidence → Measured
 * Impact → Recognition Intelligence → Award Qualification → Governance,
 * with an optional secondary AI explanation. Deterministic information
 * renders immediately from the feed row; authoritative detail is refetched
 * on open and after approval. The AI panel is loaded only on explicit
 * request and never blocks the decision trail.
 */
const RecognitionDetailPanel = ({ item, onClose, onApproved }) => {
  const id = item?.id;
  const [detail, setDetail] = useState(item ?? null);
  const [detailError, setDetailError] = useState(false);
  const [approving, setApproving] = useState(false);
  const [ai, setAi] = useState({ status: 'idle', result: null });

  useEffect(() => {
    if (!id) return;
    setDetail(item);
    setDetailError(false);
    setApproving(false);
    setAi({ status: 'idle', result: null });
    let cancelled = false;
    fetchRecognitionDetail(id)
      .then((recognition) => {
        if (!cancelled) setDetail(recognition);
      })
      .catch(() => {
        if (!cancelled) setDetailError(true);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!id) return null;

  const source = detail ?? item;
  const person = avatarOf(source.person);
  const level = AWARD_LEVELS[source.award?.highestQualifiedLevel] ?? null;
  const intelligence = source.award?.intelligence ?? null;
  const basis = source.award?.basis ?? [];
  const qualifiedLevels = source.award?.qualifiedLevels ?? [];
  const evidence = source.evidence ?? [];
  const impact = source.impact ?? [];
  const status = source.approvalStatus ?? 'recommended';

  const handleApprove = async () => {
    setApproving(true);
    try {
      await approveRecognition(id, 'approved');
      const recognition = await fetchRecognitionDetail(id);
      setDetail(recognition);
      setDetailError(false);
      onApproved?.();
    } catch {
      setDetailError(true);
    } finally {
      setApproving(false);
    }
  };

  const handleExplain = async () => {
    setAi({ status: 'loading', result: null });
    try {
      const result = await fetchRecognitionExplanation(id);
      setAi({ status: 'ready', result });
    } catch {
      setAi({ status: 'error', result: null });
    }
  };

  return (
    <Drawer
      anchor="right"
      open
      onClose={onClose}
      slotProps={{
        root: { sx: { zIndex: (theme) => theme.zIndex.drawer + 2 } },
        paper: {
          sx: {
            width: { xs: '100%', sm: 560 },
            top: `${TOPBAR_HEIGHT}px`,
            height: `calc(100% - ${TOPBAR_HEIGHT}px)`,
          },
        },
      }}
    >
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.25, overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Why this recognition?</Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 12.5, mt: 0.25 }}>
              An evidence-driven decision trail, decided by verified signals — not AI.
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} aria-label="Close">
            <Close fontSize="small" />
          </IconButton>
        </Box>

        {detailError && (
          <Typography sx={{ fontSize: 12.5, color: 'error.main' }}>Couldn't refresh detail — showing the latest known data.</Typography>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 44, height: 44, flexShrink: 0, fontSize: 16, bgcolor: person.avatarColor }}>
            {person.initials}
          </Avatar>
          <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
              <Link to={paths.person(source.personId)} style={{ color: 'inherit' }}>
                {person.name}
              </Link>
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}>
              {level && (
                <Chip
                  size="small"
                  label={level.shortLabel}
                  sx={{ height: 24, fontSize: 11.5, fontWeight: 700, bgcolor: level.bg, color: level.color, '& .MuiChip-label': { px: 1.1 } }}
                />
              )}
              <StatusPill status={status} />
            </Box>
          </Box>
        </Box>

        <Box sx={{ color: 'text.secondary', fontSize: 13 }}>
          {DIMENSION_LABEL[source.type] ?? source.type} · {formatRelative(source.occurredAt)}
        </Box>

        <Divider />

        <Section step="01" icon={<Description sx={{ fontSize: 17, color: 'var(--primary)' }} />} title="Contribution">
          <Typography sx={{ color: 'text.secondary', fontSize: 14, lineHeight: 1.6 }}>{source.summary}</Typography>
        </Section>

        <Section
          step="02"
          icon={<Verified sx={{ fontSize: 17, color: 'var(--primary)' }} />}
          title="Verified Evidence"
          helper="Every recognition is linked to real engineering evidence — never copied, never fabricated."
        >
          {evidence.length === 0 ? (
            <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.5 }}>
              No evidence linked yet — reward is under human review.
            </Typography>
          ) : (
            evidence.map((e) => <EvidenceBlock key={e.id} evidence={e} />)
          )}
        </Section>

        <Section step="03" icon={<Insights sx={{ fontSize: 17, color: 'var(--primary)' }} />} title="Measured Impact" helper="Why this contribution matters.">
          {impact.length === 0 ? (
            <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.5 }}>No quantified impact recorded.</Typography>
          ) : (
            impact.map((line) => <CheckRow key={line}>{line}</CheckRow>)
          )}
        </Section>

        <Section
          step="04"
          icon={<Analytics sx={{ fontSize: 17, color: 'var(--primary)' }} />}
          title="Recognition Intelligence"
          helper="Derived from verified engineering signals."
        >
          {intelligence ? (
            INTELLIGENCE_DIMENSIONS.map(({ key, label }) => (
              <ScoreRow key={key} label={label} value={Math.round(intelligence[key] ?? 0)} />
            ))
          ) : (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 'var(--radius-control)',
                bgcolor: 'var(--primary-lighter)',
                border: '1px solid color-mix(in srgb, var(--primary) 35%, transparent)',
              }}
            >
              <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.5 }}>
                Intelligence is computed once this recognition is approved.
              </Typography>
            </Box>
          )}
        </Section>

        <Section step="05" icon={<MilitaryTech sx={{ fontSize: 17, color: 'var(--primary)' }} />} title="Award Qualification" helper="Qualification is decided by transparent deterministic conditions.">
          {level ? (
            <>
              {basis.map((line) => (
                <CheckRow key={line}>{line}</CheckRow>
              ))}
              {qualifiedLevels.length > 0 && (
                <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5 }}>
                  Qualified for: {qualifiedLevels.map((key) => AWARD_LEVELS[key]?.shortLabel ?? key).join(' · ')}
                </Typography>
              )}
            </>
          ) : (
            <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.5 }}>
              Pending approval — this recognition has not qualified for an award yet.
            </Typography>
          )}
        </Section>

        <Section step="06" icon={<FactCheck sx={{ fontSize: 17, color: 'var(--primary)' }} />} title="Governance" helper="The final decision stays with humans.">
          {status === 'approved' ? (
            <>
              <CheckRow>Approved</CheckRow>
              <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>
                Approved by {source.approvedBy ?? 'Admin'}
                {source.approvedAt ? ` on ${formatDate(source.approvedAt)}` : ''}
              </Typography>
            </>
          ) : status === 'rejected' ? (
            <Typography sx={{ fontSize: 13, color: 'error.main', lineHeight: 1.5 }}>Rejected</Typography>
          ) : (
            <>
              <Typography sx={{ fontSize: 13, color: 'var(--amber)', fontWeight: 600, lineHeight: 1.5 }}>Pending human approval</Typography>
              <Button
                variant="contained"
                startIcon={approving ? null : <FactCheck sx={{ fontSize: 16 }} />}
                disabled={approving}
                onClick={handleApprove}
                sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 700, borderRadius: '999px', mt: 0.5 }}
              >
                {approving ? (
                  <>
                    Approving… <CircularProgress size={14} sx={{ ml: 1, color: 'inherit' }} />
                  </>
                ) : (
                  'Approve Recognition'
                )}
              </Button>
            </>
          )}
        </Section>

        <Divider />

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
            <SparkleIcon sx={{ fontSize: 17, color: 'var(--ai)', flexShrink: 0 }} />
            <Typography sx={{ fontWeight: 700, fontSize: 14 }}>AI Explanation</Typography>
          </Box>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1 }}>
            AI summarizes the verified evidence and decision basis. It does not determine the outcome.
          </Typography>

          {ai.status === 'idle' && (
            <Button
              variant="outlined"
              startIcon={<SparkleIcon sx={{ fontSize: 16 }} />}
              onClick={handleExplain}
              sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 700, borderRadius: '999px' }}
            >
              Show explanation
            </Button>
          )}

          {ai.status === 'loading' && (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
              <CircularProgress size={16} />
              <Typography sx={{ fontSize: 12.5 }}>Generating explanation…</Typography>
            </Box>
          )}

          {ai.status === 'error' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography sx={{ fontSize: 12.5, color: 'text.secondary', lineHeight: 1.5 }}>
                Couldn't load the explanation right now. The deterministic decision trail above remains accurate.
              </Typography>
              <Button size="small" variant="outlined" onClick={handleExplain} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '999px', flexShrink: 0 }}>
                Try again
              </Button>
            </Box>
          )}

          {ai.status === 'ready' && ai.result && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 'var(--radius-control)',
                border: '1px solid color-mix(in srgb, var(--ai) 35%, transparent)',
                bgcolor: 'var(--ai-lighter)',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.75,
              }}
            >
              {ai.result.ai ? (
                <>
                  <Typography sx={{ fontSize: 12.5, color: 'text.secondary', lineHeight: 1.6 }}>{ai.result.ai.narrative}</Typography>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                    {ai.result.ai.provider ? `${ai.result.ai.provider} · ` : ''}
                    {ai.result.ai.model ? <Tooltip title={ai.result.ai.model}><Box component="span">{modelLabel(ai.result.ai.model)}</Box></Tooltip> : 'AI'}
                  </Typography>
                </>
              ) : (
                <>
                  <Typography sx={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}>
                    Decision summary
                  </Typography>
                  <Typography sx={{ fontSize: 12.5, color: 'text.secondary', lineHeight: 1.6 }}>{ai.result.deterministic?.narrative}</Typography>
                </>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default RecognitionDetailPanel;