import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Typography,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import BookmarkBorder from '@mui/icons-material/BookmarkBorder';
import Bookmark from '@mui/icons-material/Bookmark';
import Close from '@mui/icons-material/Close';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ShieldOutlined from '@mui/icons-material/ShieldOutlined';
import SourceOutlined from '@mui/icons-material/SourceOutlined';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ArrowForward from '@mui/icons-material/ArrowForward';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import Refresh from '@mui/icons-material/Refresh';
import Surface from '../styled/Surface.jsx';
import AiDisclaimer from '../common/AiDisclaimer.jsx';
import SparkleIcon from './SparkleIcon.jsx';
import AnalyzingPanel from './AnalyzingPanel.jsx';
import { useAiTerms } from '../../hooks/useAiTerms.js';
import { getSeverity } from '../../config/riskLabels.js';
import { fadeSlideIn, expandDown, highlightFlash } from '../../config/animations.js';
import { modelLabel } from '../../config/modelLabel.js';
import { formatRelative } from '../../config/dates.js';

const SECTION_LABEL = { evidence: 'Evidence', reasoning: 'Reasoning', impact: 'Impact' };

const SOURCE_LABELS = {
  github: 'GitHub',
  gitlab: 'GitLab',
  jira: 'Jira',
  docs: 'Docs',
  confluence: 'Confluence',
  slack: 'Slack',
  pagerduty: 'PagerDuty',
  datadog: 'Datadog',
  incident: 'Incidents',
  planning: 'Planning',
};
const SOURCE_KEYS = Object.keys(SOURCE_LABELS);

// Group insight evidence strings by their source when they carry one
// ("<statement>: github"), otherwise keep them as a flat list.
function groupEvidence(items) {
  const groups = new Map();
  const add = (key, text) => {
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(text);
  };
  for (const item of items ?? []) {
    const lower = item.toLowerCase();
    const trailing = lower.match(new RegExp(`:\\s*(${SOURCE_KEYS.join('|')})\\s*$`));
    if (trailing) {
      add(trailing[1], item.slice(0, item.length - trailing[0].length).trim());
      continue;
    }
    const leading = lower.match(new RegExp(`^(${SOURCE_KEYS.join('|')})\\s*:`));
    if (leading) {
      add(leading[1], item.slice(leading[0].length).trim());
      continue;
    }
    add('', item);
  }
  return [...groups.entries()];
}

// Entrance reveal that starts hidden and staggers in, but stays fully visible
// for reduced-motion users.

// Swap the "Explain with AI" label for "Generate reasoning →" on hover (pure CSS).
const hoverLabelSx = {
  '& .ai-hover-label': { display: 'none' },
  '&:hover .ai-hover-label': { display: 'inline-flex' },
  '&:hover .ai-idle-label': { display: 'none' },
};

/**
 * Final AI output shown after an explanation is generated: the lead sentence,
 * the reasoning, and the recommended action — the moment the card "answers".
 */
const AiExplanationPanel = ({ insight, explanation }) => (
  <Box
    sx={{
      border: '1px solid color-mix(in srgb, var(--primary) 35%, transparent)',
      bgcolor: 'var(--primary-lighter)',
      borderRadius: 'var(--radius-control)',
      p: 1.5,
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <SparkleIcon sx={{ fontSize: 15, color: 'var(--ai)' }} />
      <Typography
        sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)' }}
      >
        AI-generated analysis
      </Typography>
    </Box>
    <Typography sx={{ fontSize: 13, fontWeight: 600, mt: 1 }}>{insight.title}</Typography>
    <Typography
      sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.primary', mt: 1.5 }}
    >
      Reasoning
    </Typography>
    <Divider sx={{ my: 0.75 }} />
    <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{explanation.reasoning}</Typography>
    {explanation.impact && (
      <>
        <Typography
          sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.primary', mt: 1.5 }}
        >
          Recommended action
        </Typography>
        <Divider sx={{ my: 0.75 }} />
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{explanation.impact}</Typography>
      </>
    )}
  </Box>
);

/**
 * AI insight card: "AI Insight" marker, severity + AI confidence +
 * evidence panel, and Save / Dismiss actions. The "Why am I seeing this?"
 * disclosure walks Evidence (grouped by source) → Reasoning → Impact so every
 * signal is explainable.
 *
 * Optional AI layer: `onExplain` triggers an explicit LLM explanation with an
 * animated "Analyzing evidence…" checklist; `aiExplanation`/`aiMeta` show the
 * per-insight result ("✦ AI · model · Generated X ago") with `onRegenerate`.
 * `showAiLabel` shows the "✨ AI Insight" marker (only on the first card,
 * so the list doesn't repeat it); `defaultOpen` starts the disclosure open.
 */
const InsightCard = ({ insight, onSave, onDismiss, saved, actions, onExplain, explaining, onRegenerate, regenerating, aiExplanation, aiMeta, showAiLabel = true, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const { aiEnabled, t } = useAiTerms();
  const severity = getSeverity(insight.severity ?? 'medium');
  const why = insight.why;
  const isLlm = aiMeta?.source === 'llm';
  const grouped = groupEvidence(why?.evidence);
  const assessmentTone =
    why?.assessmentTone === 'success' ? 'var(--teal)' : why?.assessmentTone === 'warning' ? 'var(--amber)' : 'var(--red)';

  return (
    <Surface
      sx={{
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        transition: 'transform 150ms ease, box-shadow 150ms ease, outline-color 150ms ease',
        ...(aiExplanation
          ? {
              outlineColor: 'color-mix(in srgb, var(--ai) 50%, transparent)',
              boxShadow: '0 0 0 1px var(--ai-lighter), 0 6px 20px rgba(107, 92, 231, 0.14), var(--shadow-card)',
            }
          : {}),
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: aiExplanation
            ? '0 0 0 1px var(--ai-lighter), 0 10px 26px rgba(107, 92, 231, 0.22), var(--shadow-card)'
            : 'var(--shadow-float)',
          outlineColor: 'color-mix(in srgb, var(--ai) 35%, transparent)',
          '& .ai-observation-sparkle': { color: 'var(--ai)' },
        },
      }}
    >
      {/* AI marker — only on the first card so the list doesn't repeat it */}
      {showAiLabel && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <SparkleIcon
            className="ai-observation-sparkle"
            sx={{ fontSize: 15, color: 'var(--ai)', transition: 'color 150ms ease' }}
          />
          <Typography
            sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ai)' }}
          >
            {t('insight')}
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
        <Typography sx={{ fontWeight: 600 }}>{insight.title}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title={saved ? 'Saved' : 'Save insight'}>
            <IconButton size="small" aria-label="Save insight" onClick={onSave}>
              {saved ? <Bookmark fontSize="small" /> : <BookmarkBorder fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Dismiss insight">
            <IconButton size="small" aria-label="Dismiss insight" onClick={onDismiss}>
              <Close fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>{insight.summary}</Typography>

      {/* AI confidence + evidence panel */}
      <Box
        sx={{
          bgcolor: 'var(--surface-subtle)',
          borderRadius: 'var(--radius-control)',
          p: 1.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: severity.color }}>
            {severity.label}
          </Typography>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <ShieldOutlined sx={{ fontSize: 14, color: 'var(--primary)' }} />
            <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{t('confidence')}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={`${t('confidence')}: ${insight.confidence}%`}>
            <LinearProgress
              variant="determinate"
              value={insight.confidence}
              sx={{
                flex: 1,
                height: 6,
                borderRadius: 4,
                bgcolor: 'action.hover',
                '& .MuiLinearProgress-bar': { bgcolor: severity.color },
              }}
            />
          </Tooltip>
          <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{insight.confidence}%</Typography>
        </Box>
        <Tooltip title={`${insight.evidenceCount} evidence sources`}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: 12, color: 'text.secondary' }}>
            <SourceOutlined sx={{ fontSize: 14, color: 'text.disabled' }} />
            Evidence · {insight.evidenceCount} {insight.evidenceCount === 1 ? 'source' : 'sources'}
          </Box>
        </Tooltip>
      </Box>

      {actions && <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>{actions}</Box>}

      <Divider sx={{ my: 0.5 }} />

      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            startIcon={<SparkleIcon sx={{ fontSize: 16, color: 'var(--ai)' }} />}
            endIcon={open ? <ExpandLess /> : <ExpandMore />}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            sx={{ textTransform: 'none', justifyContent: 'flex-start', color: 'text.primary' }}
          >
            Why this matters
          </Button>
          {explaining ? (
            <Button size="small" disabled startIcon={<CircularProgress size={14} />} sx={{ textTransform: 'none' }}>
              Analyzing…
            </Button>
          ) : regenerating ? (
            <Button size="small" disabled startIcon={<CircularProgress size={14} />} sx={{ textTransform: 'none' }}>
              Regenerating…
            </Button>
          ) : aiExplanation ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                animation: `${fadeSlideIn} 300ms ease`,
              }}
            >
              <Tooltip title={aiMeta?.model ? `${aiMeta.provider} · ${aiMeta.model}` : 'Signal-derived assessment'}>
                <Chip
                  size="small"
                  variant="outlined"
                  color={isLlm ? 'primary' : 'default'}
                  label={isLlm ? `✦ AI · ${modelLabel(aiMeta.model)}` : 'Engineering signals'}
                />
              </Tooltip>
              {isLlm && (
                <Button
                  size="small"
                  startIcon={<Refresh sx={{ fontSize: 15 }} />}
                  onClick={onRegenerate}
                  aria-label="Regenerate explanation"
                  sx={{ textTransform: 'none', minWidth: 0, px: 1 }}
                >
                  Regenerate
                </Button>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Tooltip title="Assessment derived from recorded engineering signals, without the LLM">
                <Chip
                  size="small"
                  variant="outlined"
                  icon={<CheckCircle sx={{ fontSize: 15, color: 'var(--teal)' }} />}
                  label="Engineering signals"
                  sx={{ '& .MuiChip-icon': { ml: '6px' } }}
                />
              </Tooltip>
              <Button
                size="small"
                startIcon={aiEnabled ? <SparkleIcon /> : <AutoAwesome />}
                disabled={!aiEnabled}
                onClick={onExplain}
                sx={{ textTransform: 'none', ...(aiEnabled ? hoverLabelSx : {}) }}
              >
                <Box component="span" className="ai-idle-label" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                  {t('explain')}
                </Box>
                <Box component="span" className="ai-hover-label" sx={{ display: 'none', alignItems: 'center', gap: 0.5 }}>
                  Generate explanation
                  <ArrowForward sx={{ fontSize: 15 }} />
                </Box>
              </Button>
            </Box>
          )}
        </Box>

        {explaining && <AnalyzingPanel />}

        {open && (
          <Box
            key={aiExplanation ? 'explained' : 'raw'}
            sx={{
              mt: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.25,
              animation: aiExplanation ? `${expandDown} 350ms ease` : `${fadeSlideIn} 300ms ease`,
            }}
          >
            {why ? (
              <>
                {aiExplanation ? (
                  <>
                    <Box>
                      <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary' }}>
                        Evidence
                      </Typography>
                      <Box
                        key="evidence-ai"
                        sx={{
                          borderRadius: 'var(--radius-control)',
                          px: 1,
                          py: 0.5,
                          mx: -1,
                          animation: `${highlightFlash} 1.4s ease`,
                        }}
                      >
                        <Box
                          component="ul"
                          sx={{ m: 0, pl: 0, mt: 0.25, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 0.75 }}
                        >
                          {grouped.map(([source, texts]) =>
                            texts.map((text, i) => (
                              <Box
                                component="li"
                                key={`${source}-${i}`}
                                sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}
                              >
                                <CheckCircle sx={{ fontSize: 14, mt: '2px', color: 'var(--teal)', flexShrink: 0 }} />
                                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                                  {source && i === 0 && (
                                    <Box component="span" sx={{ fontWeight: 600, color: 'text.primary', mr: 0.5 }}>
                                      {SOURCE_LABELS[source]}
                                    </Box>
                                  )}
                                  {text}
                                </Typography>
                              </Box>
                            )),
                          )}
                        </Box>
                      </Box>
                    </Box>

                    <AiExplanationPanel insight={insight} explanation={aiExplanation} />
                  </>
                ) : (
                  Object.entries(SECTION_LABEL).map(([key, label]) => (
                    <Box key={key}>
                      <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary' }}>
                        {label}
                      </Typography>
                      {key === 'evidence' ? (
                        <Box
                          component="ul"
                          sx={{ m: 0, pl: 0, mt: 0.25, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 0.75 }}
                        >
                          {grouped.map(([source, texts]) =>
                            texts.map((text, i) => (
                              <Box
                                component="li"
                                key={`${source}-${i}`}
                                sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}
                              >
                                <CheckCircle sx={{ fontSize: 14, mt: '2px', color: 'var(--teal)', flexShrink: 0 }} />
                                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                                  {source && i === 0 && (
                                    <Box component="span" sx={{ fontWeight: 600, color: 'text.primary', mr: 0.5 }}>
                                      {SOURCE_LABELS[source]}
                                    </Box>
                                  )}
                                  {text}
                                </Typography>
                              </Box>
                            )),
                          )}
                        </Box>
                      ) : (
                        <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.25 }}>
                          {aiExplanation?.[key] ?? why[key]}
                        </Typography>
                      )}
                    </Box>
                  ))
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary' }}>
                    {t('assessment')}
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: assessmentTone }}>
                    {why.assessment}
                  </Typography>
                </Box>

                {aiExplanation && (
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {isLlm
                      ? `AI-generated reasoning · Generated ${formatRelative(aiMeta.generatedAt)}`
                      : 'Reasoning and impact are AI-generated; evidence stays grounded in recorded signals.'}
                  </Typography>
                )}
                {isLlm && <AiDisclaimer sx={{ mt: 0.5 }} />}
              </>
            ) : (
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                Based on recent signals from your connected data sources.
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Surface>
  );
};

export default InsightCard;