import { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  IconButton,
  Tooltip,
  Typography,
  LinearProgress,
} from '@mui/material';
import BookmarkBorder from '@mui/icons-material/BookmarkBorder';
import Bookmark from '@mui/icons-material/Bookmark';
import Close from '@mui/icons-material/Close';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ShieldOutlined from '@mui/icons-material/ShieldOutlined';
import SourceOutlined from '@mui/icons-material/SourceOutlined';
import Surface from '../styled/Surface.jsx';
import { getSeverity } from '../../config/riskLabels.js';

const SECTION_LABEL = { evidence: 'Evidence', reasoning: 'Reasoning', impact: 'Impact' };

/**
 * AI insight card: severity badge, title, summary, AI confidence, evidence
 * count, and Save / Dismiss actions. The "Why am I seeing this?" disclosure
 * walks Evidence → Reasoning → Impact → AI Assessment so every signal is
 * explainable and tied to a confidence score.
 */
const InsightCard = ({ insight, onSave, onDismiss, saved, actions }) => {
  const [open, setOpen] = useState(false);
  const severity = getSeverity(insight.severity ?? 'medium');
  const why = insight.why;
  const assessmentTone =
    why?.assessmentTone === 'success' ? 'var(--teal)' : why?.assessmentTone === 'warning' ? 'var(--amber)' : 'var(--red)';

  return (
    <Surface sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
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

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: severity.color }}>
          {severity.label}
        </Typography>
        <Tooltip title={`AI confidence: ${insight.confidence}%`}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, fontSize: 12, color: 'text.secondary' }}>
            <ShieldOutlined sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Box sx={{ width: 56 }}>
              <LinearProgress
                variant="determinate"
                value={insight.confidence}
                sx={{ height: 6, borderRadius: 4, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: severity.color } }}
              />
            </Box>
            <Typography component="span" sx={{ fontSize: 12, fontWeight: 600 }}>{insight.confidence}%</Typography>
          </Box>
        </Tooltip>
        <Tooltip title={`${insight.evidenceCount} evidence sources`}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: 12, color: 'text.secondary' }}>
            <SourceOutlined sx={{ fontSize: 14, color: 'text.disabled' }} />
            {insight.evidenceCount} sources
          </Box>
        </Tooltip>
      </Box>

      {actions && <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>{actions}</Box>}

      <Divider sx={{ my: 0.5 }} />

      <Box>
        <Button
          size="small"
          endIcon={open ? <ExpandLess /> : <ExpandMore />}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
        >
          Why am I seeing this?
        </Button>

        {open && (
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {why ? (
              <>
                {Object.entries(SECTION_LABEL).map(([key, label]) => (
                  <Box key={key}>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary' }}>
                      {label}
                    </Typography>
                    {key === 'evidence' ? (
                      <Box component="ul" sx={{ m: 0, pl: 2, mt: 0.25 }}>
                        {why.evidence.map((item) => (
                          <Typography component="li" key={item} sx={{ fontSize: 13, color: 'text.secondary' }}>
                            {item}
                          </Typography>
                        ))}
                      </Box>
                    ) : (
                      <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.25 }}>{why[key]}</Typography>
                    )}
                  </Box>
                ))}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary' }}>
                    AI assessment
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: assessmentTone }}>
                    {why.assessment}
                  </Typography>
                </Box>
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
