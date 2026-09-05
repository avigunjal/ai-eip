import { useState } from 'react';
import { Link } from 'react-router';
import { Avatar, Box, Button, Chip, Typography } from '@mui/material';
import Insights from '@mui/icons-material/Insights';
import Description from '@mui/icons-material/Description';
import AccountTree from '@mui/icons-material/AccountTree';
import Verified from '@mui/icons-material/Verified';
import FactCheck from '@mui/icons-material/FactCheck';
import { approveRecognition } from '../../../api/recognition.js';
import { AWARD_LEVELS } from '../data/awardLevels.js';
import { DIMENSION_LABEL, SOURCE_LABEL } from '../data/recognitionLabels.js';
import { formatRelative } from '../../../config/dates.js';
import { paths } from '../../../config/paths.js';

/** Compact metadata chip used in the evidence / impact row. */
const MetaChip = ({ icon, children }) => (
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.75,
      height: 26,
      maxWidth: '100%',
      px: 1.25,
      borderRadius: '999px',
      border: '1px solid',
      borderColor: 'divider',
      bgcolor: 'background.default',
      color: 'text.secondary',
      fontSize: 12.5,
    }}
  >
    {icon}
    <Typography component="span" noWrap sx={{ fontSize: 12.5, lineHeight: 1.4 }}>
      {children}
    </Typography>
  </Box>
);

/**
 * One recognition row: identity (avatar, name, award badge, dimension, date),
 * the contribution summary, an evidence/impact metadata row, and — for
 * non-approved entries — a human-in-the-loop review control.
 */
const RecognitionItem = ({ item, onApproved, onOpenDetail }) => {
  const [approving, setApproving] = useState(false);
  const level = AWARD_LEVELS[item.awardLevel] ?? AWARD_LEVELS.monthly;
  const person = item.person ?? { name: 'Team member', initials: '?', avatarColor: 'var(--primary)' };
  const evidence = item.evidence ?? [];
  const needsReview = item.approvalStatus && item.approvalStatus !== 'approved';
  const intelligence = item.award?.intelligence;
  const basis = item.award?.basis?.[0];

  const handleApprove = async () => {
    setApproving(true);
    try {
      await approveRecognition(item.id, 'approved');
      onApproved?.();
    } catch {
      setApproving(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        p: { xs: 1.75, sm: 2.15 },
        outline: '1px solid',
        outlineColor: 'divider',
        borderRadius: 'var(--radius-card)',
        bgcolor: 'background.paper',
      }}
    >
      <Avatar sx={{ width: 44, height: 44, flexShrink: 0, fontSize: 16, bgcolor: person.avatarColor }}>
        {person.initials}
      </Avatar>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
            <Link to={paths.person(item.personId)} style={{ color: 'inherit' }}>
              {person.name}
            </Link>
          </Typography>
          {item.awardLevel ? (
            <Chip
              size="small"
              label={level.shortLabel}
              sx={{
                height: 24,
                fontSize: 11.5,
                fontWeight: 700,
                bgcolor: level.bg,
                color: level.color,
                '& .MuiChip-label': { px: 1.1 },
              }}
            />
          ) : null}
          {needsReview ? (
            <Chip
              size="small"
              label="Pending review"
              sx={{
                height: 24,
                fontSize: 11.5,
                fontWeight: 700,
                bgcolor: 'var(--amber-lighter)',
                color: 'var(--amber)',
                '& .MuiChip-label': { px: 1.1 },
              }}
            />
          ) : item.approvalStatus === 'approved' ? (
            <Chip
              size="small"
              label="Approved"
              sx={{
                height: 24,
                fontSize: 11.5,
                fontWeight: 700,
                bgcolor: 'var(--success-lighter)',
                color: 'success.main',
                '& .MuiChip-label': { px: 1.1 },
              }}
            />
          ) : null}
          <Box component="span" sx={{ color: 'text.secondary', fontSize: 13 }}>
            {DIMENSION_LABEL[item.type]} · {formatRelative(item.occurredAt)}
          </Box>
        </Box>

        <Typography sx={{ color: 'text.secondary', fontSize: 14, mt: 0.65, lineHeight: 1.55 }}>{item.summary}</Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.25 }}>
          {item.impact?.length > 0 && (
            <MetaChip icon={<Insights sx={{ fontSize: 14, color: 'var(--primary)', flexShrink: 0 }} />}>
              {item.impact[0]}
            </MetaChip>
          )}
          <MetaChip icon={<Description sx={{ fontSize: 13.5, flexShrink: 0 }} />}>
            {evidence.length} {evidence.length === 1 ? 'piece' : 'pieces'} of evidence
          </MetaChip>
          {item.project && (
            <MetaChip icon={<AccountTree sx={{ fontSize: 13.5, flexShrink: 0 }} />}>
              {item.project.name}
            </MetaChip>
          )}
          {onOpenDetail && (
            <Button
              size="small"
              onClick={() => onOpenDetail(item)}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                color: 'var(--primary)',
                fontSize: 12.5,
                minWidth: 0,
                px: 0.5,
                ml: 0.5,
                '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' },
              }}
            >
              Why this recognition? →
            </Button>
          )}
          {needsReview && (
            <Button
              size="small"
              variant="outlined"
              color="primary"
              startIcon={<FactCheck sx={{ fontSize: 15 }} />}
              disabled={approving}
              onClick={handleApprove}
              sx={{ textTransform: 'none', fontWeight: 700, height: 26, borderRadius: '999px' }}
            >
              {approving ? 'Approving…' : 'Approve'}
            </Button>
          )}
        </Box>

        {/* "Why was this person recognized?" — the evidence trail */}
        {evidence.length > 0 && (
          <Box
            sx={{
              mt: 1.25,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.75,
              borderRadius: 'var(--radius-card)',
              bgcolor: 'background.default',
              p: 1.25,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Verified sx={{ fontSize: 14, color: 'var(--primary)', flexShrink: 0 }} />
              <Typography sx={{ fontWeight: 700, fontSize: 12.5, color: 'text.secondary' }}>
                Verified evidence
              </Typography>
            </Box>
            {evidence.map((e) => (
              <Typography key={e.id} sx={{ fontSize: 12.5, color: 'text.secondary', lineHeight: 1.5 }}>
                <Box
                  component="span"
                  sx={{
                    display: 'inline-block',
                    fontSize: 10.5,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.4,
                    color: e.role === 'primary' ? 'success.main' : 'text.secondary',
                    mr: 0.75,
                  }}
                >
                  {e.role}
                </Box>
                <Box component="span" sx={{ color: 'primary.main', mr: 0.5 }}>{SOURCE_LABEL[e.source] ?? e.source}:</Box>
                {e.statement}
              </Typography>
            ))}
            {intelligence && (
              <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mt: 0.25 }}>
                Evidence {intelligence.evidenceStrength}/100 · Impact {intelligence.impact}/100 ·
                Scope {intelligence.scope}/100 · Consistency {intelligence.consistency}/100
                {basis ? ` — ${basis}` : ''}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default RecognitionItem;