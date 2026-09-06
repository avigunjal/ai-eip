import { Box, LinearProgress, Tooltip, Typography } from '@mui/material';
import HelpOutlineOutlined from '@mui/icons-material/HelpOutlineOutlined';
import Surface from '../../../components/styled/Surface.jsx';
import SparkleIcon from '../../../components/ui/SparkleIcon.jsx';
import AiDisclaimer from '../../../components/common/AiDisclaimer.jsx';
import { formatCurrency } from '../../../config/currency.js';

/**
 * Section 05 — AI recommendation (spec §16/§17). The focal panel of the
 * workspace: recommended option, evidence-grounded summary, confidence with
 * a clarifying tooltip, and provenance that never overclaims ("Based on
 * current engineering signals"). When the user compares an alternative, a
 * deterministic note explains why the recommended path still leads.
 */
const AIRecommendation = ({ explanation, options, selectedId }) => {
  const recommended = options.find((o) => o.id === explanation.recommendedOptionId) ?? options[0];
  const selected = options.find((o) => o.id === selectedId) ?? null;
  const comparingOther = selected !== null && selected.id !== recommended.id;
  const selectedMatches = selected !== null && selected.id === recommended.id;
  const topScore = explanation.optionScores[0];
  const selectedScore = selected ? explanation.optionScores.find((s) => s.optionId === selected.id) ?? topScore : topScore;

  return (
    <Surface
      sx={{
        p: { xs: 2.5, md: 3.5 },
        border: '1px solid color-mix(in srgb, var(--primary) 40%, transparent)',
        bgcolor: 'var(--primary-lighter)',
      }}
    >
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
        <SparkleIcon sx={{ fontSize: 17, color: 'var(--primary)' }} />
        <Typography
          sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--primary)' }}
        >
          AI recommendation
        </Typography>
      </Box>

      <Typography
        sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', mt: 2 }}
      >
        Recommended option
      </Typography>
      <Typography sx={{ fontSize: { xs: 20, md: 22 }, fontWeight: 700, lineHeight: 1.3, mt: 0.25 }}>
        {recommended.name}
      </Typography>

      <Typography sx={{ color: 'text.secondary', mt: 1.25, maxWidth: 760, lineHeight: 1.55 }}>{explanation.summary}</Typography>

      {comparingOther && (
        <Box
          sx={{
            mt: 2,
            p: 1.75,
            borderRadius: 'var(--radius-control)',
            bgcolor: 'background.paper',
            outline: '1px solid',
            outlineColor: 'divider',
          }}
        >
          <Typography sx={{ fontSize: 13, lineHeight: 1.55 }}>
            <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
              AI-EIP recommends {recommended.name} based on the current engineering signals.
            </Box>
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 13, color: 'text.secondary', lineHeight: 1.55 }}>
            You selected {selected.name} (Option {selected.id}). Option {recommended.id} still leads the composite scoring by{' '}
            <Box component="span" sx={{ fontWeight: 700 }}>
              {(topScore.score - selectedScore.score).toFixed(0)} points
            </Box>{' '}
            — on risk reduction ({recommended.outcomes.riskReduction}%), expected value ({formatCurrency(recommended.outcomes.value)}) and
            delivery confidence ({recommended.outcomes.confidence}%).
          </Typography>
        </Box>
      )}

      {selectedMatches && (
        <Typography sx={{ mt: 2, fontSize: 13, color: 'text.secondary', lineHeight: 1.55 }}>
          <Box component="span" sx={{ fontWeight: 700, color: 'var(--teal)' }}>
            ✓ Your selection matches the AI recommendation.
          </Box>
        </Typography>
      )}

      <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid', borderTopColor: 'color-mix(in srgb, var(--primary) 25%, transparent)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}>
            Recommendation confidence
          </Typography>
          <Box sx={{ flex: 1, minWidth: 140, maxWidth: 260 }}>
            <LinearProgress
              variant="determinate"
              value={explanation.confidence}
              sx={{
                height: 6,
                borderRadius: 4,
                bgcolor: 'color-mix(in srgb, var(--primary) 18%, transparent)',
                '& .MuiLinearProgress-bar': { bgcolor: 'var(--primary)' },
              }}
            />
          </Box>
          <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{explanation.confidence}%</Typography>
          <Tooltip title="Confidence reflects how strongly the current engineering signals support this recommendation.">
            <HelpOutlineOutlined sx={{ fontSize: 16, color: 'text.disabled', cursor: 'help' }} />
          </Tooltip>
        </Box>

        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, mt: 1.5, color: 'text.disabled' }}>
          <SparkleIcon sx={{ fontSize: 13, color: 'var(--primary)' }} />
          <Typography component="span" sx={{ fontSize: 12 }}>
            Based on current engineering signals
          </Typography>
        </Box>
      </Box>

      <AiDisclaimer sx={{ mt: 1.75 }} />
    </Surface>
  );
};

export default AIRecommendation;