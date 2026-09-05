import { Box, Button, Typography } from '@mui/material';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import Surface from '../../../components/styled/Surface.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import RecognitionItem from './RecognitionItem.jsx';

/**
 * Recent Recognition list (spec section 10) — the main lower-left surface.
 * Renders the latest public recognition rows with their evidence metadata.
 */
const RecentRecognitionList = ({ items, limit = 6 }) => (
  <Surface sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Recent Recognition</Typography>
        <Typography sx={{ fontSize: 13.5, color: 'text.secondary', mt: 0.25 }}>
          Evidence-based highlights from the latest contributions.
        </Typography>
      </Box>
      <Button
        size="small"
        endIcon={<KeyboardArrowRight />}
        sx={{ textTransform: 'none', fontWeight: 600, flexShrink: 0 }}
      >
        View all
      </Button>
    </Box>

    {items.length === 0 ? (
      <EmptyState title="No public recognition yet" />
    ) : (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {items.slice(0, limit).map((item) => (
          <RecognitionItem key={item.id} item={item} />
        ))}
      </Box>
    )}
  </Surface>
);

export default RecentRecognitionList;