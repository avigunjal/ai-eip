import { Link } from 'react-router';
import { Avatar, Box, Chip, Typography } from '@mui/material';
import Insights from '@mui/icons-material/Insights';
import Description from '@mui/icons-material/Description';
import AccountTree from '@mui/icons-material/AccountTree';
import { AWARD_LEVELS } from '../data/awardLevels.js';
import { formatRelative } from '../../../config/dates.js';
import { paths } from '../../../config/paths.js';

const DIMENSION_LABEL = {
  reliability: 'Reliability',
  mentorship: 'Mentorship',
  delivery: 'Delivery',
  knowledge_sharing: 'Knowledge Sharing',
};

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
 * One recognition row in the Recent Recognition list: identity (avatar, name,
 * award badge, contribution dimension, relative date), the contribution
 * summary, and an evidence/impact metadata row.
 */
const RecognitionItem = ({ item }) => {
  const level = AWARD_LEVELS[item.awardLevel] ?? AWARD_LEVELS.monthly;
  const person = item.person ?? { name: 'Team member', initials: '?', avatarColor: 'var(--primary)' };
  const evidenceCount = item.evidenceIds?.length ?? 0;

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
            {evidenceCount} {evidenceCount === 1 ? 'piece' : 'pieces'} of evidence
          </MetaChip>
          {item.project && (
            <MetaChip icon={<AccountTree sx={{ fontSize: 13.5, flexShrink: 0 }} />}>
              {item.project.name}
            </MetaChip>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default RecognitionItem;