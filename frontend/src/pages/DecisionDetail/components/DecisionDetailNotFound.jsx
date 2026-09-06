import { Box, Button, Typography } from '@mui/material';
import SearchOff from '@mui/icons-material/SearchOff';
import { Link as RouterLink } from 'react-router';
import Surface from '../../../components/styled/Surface.jsx';
import { paths } from '../../../config/paths.js';

/**
 * Unknown decision id — a friendly "not found" rather than a generic error,
 * with a clear way back to the Decision Inbox.
 */
const DecisionDetailNotFound = () => (
  <Surface sx={{ p: { xs: 3, md: 5 }, textAlign: 'center', maxWidth: 560, mx: 'auto' }}>
    <Box
      sx={{
        width: 56,
        height: 56,
        mx: 'auto',
        borderRadius: 'var(--radius-control)',
        bgcolor: 'var(--surface-subtle)',
        color: 'text.secondary',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <SearchOff sx={{ fontSize: 26 }} />
    </Box>
    <Typography sx={{ fontSize: 20, fontWeight: 700, mt: 2 }}>Decision not found</Typography>
    <Typography sx={{ color: 'text.secondary', mt: 1, maxWidth: 380, mx: 'auto', lineHeight: 1.5 }}>
      This decision doesn't exist or is no longer available. Head back to the Decision Inbox to pick from the decisions that need attention.
    </Typography>
    <Button
      component={RouterLink}
      to={paths.decisionIntelligence}
      variant="contained"
      sx={{ mt: 2.5, px: 3, textTransform: 'none', fontWeight: 700 }}
    >
      Back to decisions
    </Button>
  </Surface>
);

export default DecisionDetailNotFound;