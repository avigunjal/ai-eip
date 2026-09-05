import { Box, Chip, Typography } from '@mui/material';
import Surface from '../../components/styled/Surface.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import RecognitionItem from './components/RecognitionItem.jsx';
import { AWARD_LEVELS } from './data/awardLevels.js';

/**
 * Shared award view used by all four award tabs (spec section 5). Shows the
 * award's description plus the recognitions of people at that award level.
 */
const RecognitionAwardsView = ({ levelKey, items }) => {
  const level = AWARD_LEVELS[levelKey] ?? AWARD_LEVELS.monthly;
  const filtered = items.filter((r) => r.awardLevel === levelKey);
  const recipients = new Set(filtered.map((r) => r.personId)).size;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Surface sx={{ p: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 18 }}>{level.title}</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 13.5, mt: 0.5, maxWidth: 600 }}>
            {level.description}
          </Typography>
        </Box>
        <Chip
          size="small"
          label={`${recipients} ${recipients === 1 ? 'recipient' : 'recipients'}`}
          sx={{ bgcolor: level.bg, color: level.color, fontWeight: 700, flexShrink: 0 }}
        />
      </Surface>

      {filtered.length === 0 ? (
        <EmptyState title={`No ${level.title.toLowerCase()} yet`} description="Recognitions will appear here as team members reach this milestone." />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filtered.map((item) => (
            <RecognitionItem key={item.id} item={item} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default RecognitionAwardsView;