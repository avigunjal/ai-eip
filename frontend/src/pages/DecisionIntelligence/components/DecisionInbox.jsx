import { Box } from '@mui/material';
import { Link as RouterLink } from 'react-router';
import Button from '@mui/material/Button';
import Inbox from '@mui/icons-material/Inbox';
import DecisionCard from './DecisionCard.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingState from '../../../components/common/LoadingState.jsx';
import { paths } from '../../../config/paths.js';

/**
 * The decision inbox (spec section 8): the data-driven list of decisions that
 * need attention. Shows the empty state copy when a filter (or the dataset)
 * yields nothing, and card skeletons while the future live API loads.
 */
const DecisionInbox = ({ decisions, loading = false }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <LoadingState key={i} sx={{ p: 2 }} />
        ))}
      </Box>
    );
  }

  if (decisions.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No decisions require attention"
        description="AI-EIP will surface decisions when engineering signals indicate that action or trade-offs may be needed."
        action={
          <Button component={RouterLink} to={paths.projects} variant="contained" sx={{ textTransform: 'none' }}>
            Explore projects
          </Button>
        }
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {decisions.map((decision, index) => (
        <DecisionCard key={decision.id} decision={decision} index={index} />
      ))}
    </Box>
  );
};

export default DecisionInbox;