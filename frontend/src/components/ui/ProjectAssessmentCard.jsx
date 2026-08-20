import { Box, Button, Chip, CircularProgress, LinearProgress, Skeleton, Tooltip, Typography } from '@mui/material';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import Replay from '@mui/icons-material/Replay';
import BarChart from '@mui/icons-material/BarChart';
import AiDisclaimer from '../common/AiDisclaimer.jsx';
import AnalyzingPanel from './AnalyzingPanel.jsx';
import { useAiTerms } from '../../hooks/useAiTerms.js';
import { paths } from '../../config/paths.js';
import { modelLabel } from '../../config/modelLabel.js';
import { formatAbsolute } from '../../config/dates.js';
import { fadeSlideIn } from '../../config/animations.js';

/**
 * Project Assessment card — one card, two views.
 *
 * The deterministic assessment (source of truth) is always available. When the
 * user asks for AI, the same card transforms into the AI view; "View Engineering
 * Signals" switches back instantly with no API call. The cached AI result is
 * never deleted — the views are just two renderings of the same data.
 */

const SectionLabel = ({ children }) => (
  <Typography sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary' }}>
    {children}
  </Typography>
);

const ConfidenceBar = ({ value }) => (
  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, minWidth: 160 }}>
    <Box sx={{ width: 90 }}>
      <LinearProgress
        variant="determinate"
        value={value ?? 0}
        sx={{ height: 6, borderRadius: 4, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: 'var(--ai)' } }}
      />
    </Box>
    <Typography component="span" sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary' }}>
      {value != null ? `${value}%` : 'n/a'}
    </Typography>
  </Box>
);

const CardShell = ({ children }) => (
  <Box sx={{ position: 'relative', mt: 3, p: 3, outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-card)', bgcolor: 'background.paper' }}>
    {children}
  </Box>
);

const ProjectAssessmentCard = ({ deterministic, ai, view, aiStatus, regenerating, onRegenerate, onViewSignals }) => {
  const showAi = view === 'ai' && aiStatus === 'success' && ai;
  const model = ai?.model ?? null;
  const { t } = useAiTerms();

  if (aiStatus === 'loading') {
    return (
      <CardShell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Box sx={{ width: 34, height: 34, borderRadius: 'var(--radius-control)', display: 'grid', placeItems: 'center', bgcolor: 'var(--primary-lighter)', color: 'var(--primary)' }}>
            <BarChart sx={{ fontSize: 18 }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Project Assessment</Typography>
          <Chip size="small" label="Enhancing with AI…" color="primary" variant="outlined" />
        </Box>
        <AnalyzingPanel />
        <Skeleton sx={{ mt: 2 }} height={20} animation="wave" />
        <Skeleton width="85%" height={16} animation="wave" />
        <Skeleton sx={{ mt: 2 }} height={14} width={120} animation="wave" />
        <Skeleton height={14} animation="wave" />
        <Skeleton width="60%" height={14} animation="wave" />
      </CardShell>
    );
  }

  return (
    <CardShell>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Box
            sx={{
              width: 34, height: 34, borderRadius: 'var(--radius-control)', display: 'grid', placeItems: 'center',
              bgcolor: showAi ? 'var(--ai-lighter)' : 'var(--primary-lighter)',
              color: showAi ? 'var(--ai)' : 'var(--primary)',
            }}
          >
            {showAi ? <AutoAwesome sx={{ fontSize: 18 }} /> : <BarChart sx={{ fontSize: 18 }} />}
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{showAi ? t('assessment') : 'Project Assessment'}</Typography>
          {showAi ? (
            <Chip size="small" label={`AI · ${modelLabel(model)}`} color="primary" variant="filled" />
          ) : (
            <Chip size="small" label="Deterministic · Engineering signals" variant="outlined" />
          )}
        </Box>
        {showAi && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={regenerating ? <CircularProgress size={14} /> : <Replay />}
              disabled={regenerating}
              onClick={onRegenerate}
              sx={{ textTransform: 'none' }}
            >
              {regenerating ? 'Regenerating…' : 'Regenerate with AI'}
            </Button>
            <Button size="small" variant="text" onClick={onViewSignals} sx={{ textTransform: 'none' }}>
              View Engineering Signals
            </Button>
          </Box>
        )}
      </Box>

      <Typography sx={{ mt: 1, fontSize: 12, color: 'text.disabled' }}>
        {showAi
          ? (
            <Tooltip title={`${ai.provider} · ${model}`} componentsProps={{ tooltip: { sx: { fontSize: 12 } } }}>
              <span>Powered by {modelLabel(model)} · Generated {formatAbsolute(ai.generatedAt)}</span>
            </Tooltip>
          )
          : `Deterministic analysis · engineering signals · Generated ${formatAbsolute(deterministic.generatedAt)}`}
      </Typography>

      {showAi ? (
        <Box sx={{ animation: `${fadeSlideIn} 300ms ease` }}>
          <Typography sx={{ mt: 1.5 }}>{ai.summary}</Typography>

          {ai.findings?.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <SectionLabel>Key findings</SectionLabel>
              <Box component="ul" sx={{ m: 0, mt: 0.5, pl: 2 }}>
                {ai.findings.map((finding, index) => (
                  <Typography component="li" key={index} sx={{ fontSize: 14, color: 'text.secondary', '& + &': { mt: 0.25 } }}>
                    {finding}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}

          {ai.recommendedActions?.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <SectionLabel>Recommended actions</SectionLabel>
              <Box component="ol" sx={{ m: 0, mt: 0.5, pl: 2 }}>
                {ai.recommendedActions.map((action, index) => (
                  <Typography component="li" key={index} sx={{ fontSize: 14, color: 'text.secondary', '& + &': { mt: 0.25 } }}>
                    {action}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}

          {ai.evidence?.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <SectionLabel>Grounding evidence</SectionLabel>
              <Box sx={{ mt: 0.5, display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                {ai.evidence.map((item) => {
                  const target = item.type === 'risk'
                    ? { href: paths.risks }
                    : item.type === 'knowledge'
                      ? { href: paths.system(item.id) }
                      : null;
                  return (
                    <Chip
                      key={item.id}
                      size="small"
                      variant="outlined"
                      label={`${item.type} · ${item.summary}`}
                      {...(target ? { component: 'a', href: target.href, clickable: true } : {})}
                    />
                  );
                })}
              </Box>
            </Box>
          )}

          {ai.confidence != null && ai.confidence > 0 && (
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderTopColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <SectionLabel>{t('confidence')}</SectionLabel>
              <ConfidenceBar value={ai.confidence} />
            </Box>
          )}

          <AiDisclaimer sx={{ mt: 2 }} />
        </Box>
      ) : (
        <>
          <Typography sx={{ mt: 1.5 }}>{deterministic.summary}</Typography>

          {deterministic.findings?.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <SectionLabel>Key risks</SectionLabel>
              <Box component="ul" sx={{ m: 0, mt: 0.5, pl: 2 }}>
                {deterministic.findings.map((finding, index) => (
                  <Typography component="li" key={index} sx={{ fontSize: 14, color: 'text.secondary', '& + &': { mt: 0.25 } }}>
                    {finding}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}

          {deterministic.recommendedActions?.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <SectionLabel>Recommended actions</SectionLabel>
              <Box component="ol" sx={{ m: 0, mt: 0.5, pl: 2 }}>
                {deterministic.recommendedActions.map((action, index) => (
                  <Typography component="li" key={index} sx={{ fontSize: 14, color: 'text.secondary', '& + &': { mt: 0.25 } }}>
                    {action}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}
        </>
      )}
    </CardShell>
  );
};

export default ProjectAssessmentCard;