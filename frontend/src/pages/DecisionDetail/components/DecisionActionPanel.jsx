import dayjs from 'dayjs';
import { Box, Button, Typography } from '@mui/material';
import Check from '@mui/icons-material/Check';
import CheckCircle from '@mui/icons-material/CheckCircle';
import RecordVoiceOver from '@mui/icons-material/RecordVoiceOver';
import { formatRelative } from '../../../config/dates.js';
import Surface from '../../../components/styled/Surface.jsx';

/** Item labels the user has reviewed by reaching this final step. */
const REVIEWED = ['Engineering signals', 'Possible paths', 'Outcome comparison', 'AI recommendation', 'Expected impact'];

/** "Recorded just now" for a fresh record, otherwise the relative time. */
function recordedLabel(at) {
  return at && dayjs().diff(at, 'minute') < 1 ? 'just now' : formatRelative(at);
}

/**
 * FINAL STEP — the single commitment point (spec §5/§6/§16). Unnumbered
 * capstone that ends the numbered analysis (01–06): the AI recommended, the
 * human decides here. Recording is the only irreversible action on the page.
 * Once recorded it flips to a success state with a subtle update affordance.
 */
const DecisionActionPanel = ({ selected, recommendedId, recorded, onRecord, onUpdate }) => {
  const isRecorded = Boolean(recorded);
  const isRecommended = selected?.id === recommendedId;

  return (
    <Box component="section" id="decision-section" aria-label="Record decision" sx={{ mt: 4, scrollMarginTop: 80 }}>
      <Surface
        sx={{
          p: { xs: 2.5, md: 3.5 },
          bgcolor: 'var(--primary-lighter)',
          outlineColor: 'color-mix(in srgb, var(--primary) 30%, transparent)',
        }}
      >
        <Typography
          sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)' }}
        >
          FINAL STEP · DECISION
        </Typography>
        <Typography
          sx={{
            fontSize: 20,
            fontWeight: 700,
            lineHeight: 1.3,
            mt: 0.75,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
          }}
        >
          {isRecorded && <CheckCircle sx={{ fontSize: 22, color: 'var(--teal)' }} />}
          {isRecorded ? 'Decision recorded' : 'Record your decision'}
        </Typography>

        {isRecorded ? (
          <>
            <Typography sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 760, lineHeight: 1.5 }}>
              Recorded <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>{recordedLabel(recorded.at)}</Box> based on the
              path you selected. You can revisit the workspace and update the record at any time.
            </Typography>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
              <Check sx={{ fontSize: 15, color: 'var(--teal)' }} />
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'var(--teal)' }}>Action planned</Typography>
            </Box>
          </>
        ) : (
          <>
            <Typography sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 760, lineHeight: 1.5 }}>
              You've reviewed the engineering signals, possible paths, expected outcomes and AI recommendation. Confirming the
              selected option records this decision for the current session — it is the only irreversible action on this page.
            </Typography>
            <Box
              sx={{
                mt: 1.5,
                p: 0,
                m: 0,
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.35rem 1.25rem',
              }}
              component="ul"
              aria-label="What you have reviewed"
            >
              {REVIEWED.map((item) => (
                <Box component="li" key={item} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, listStyle: 'none' }}>
                  <Check sx={{ fontSize: 14, color: 'var(--teal)' }} />
                  <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>{item}</Typography>
                </Box>
              ))}
            </Box>
          </>
        )}

        <Box
          sx={{
            mt: 2.5,
            pt: 2,
            borderTop: '1px solid',
            borderTopColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}>
              Selected path
            </Typography>
            {selected ? (
              <Typography sx={{ fontSize: 14.5, fontWeight: 700, mt: 0.25, lineHeight: 1.4 }}>
                {selected.name}
                <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  {'  '}Option {selected.id}
                  {isRecommended && <Box component="span" sx={{ fontWeight: 700, color: 'var(--ai)' }}> · AI recommended</Box>}
                </Box>
              </Typography>
            ) : (
              <Typography sx={{ fontSize: 13.5, color: 'text.secondary', mt: 0.25, lineHeight: 1.4 }}>
                No path selected yet — select a path above before recording your decision.
              </Typography>
            )}
          </Box>

          {isRecorded ? (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                size="large"
                variant="outlined"
                startIcon={<CheckCircle />}
                onClick={onUpdate}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  color: 'var(--teal)',
                  borderColor: 'color-mix(in srgb, var(--teal) 50%, transparent)',
                  '&:hover': { borderColor: 'var(--teal)', bgcolor: 'var(--teal-lighter)' },
                }}
              >
                Update record
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              size="large"
              startIcon={<RecordVoiceOver />}
              disabled={!selected}
              onClick={onRecord}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                px: 3,
                '&.Mui-disabled': {
                  bgcolor: 'var(--primary-lighter)',
                  color: 'var(--primary)',
                  opacity: 1,
                },
              }}
            >
              Record decision
            </Button>
          )}
        </Box>
      </Surface>
    </Box>
  );
};

export default DecisionActionPanel;