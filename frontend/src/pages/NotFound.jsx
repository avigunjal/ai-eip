import { Link } from 'react-router';
import { Box, Button, Typography } from '@mui/material';
import { paths } from '../config/paths.js';

/**
 * Route-level error / not-found fallback shown by the router's `errorElement`.
 */
const NotFound = () => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      bgcolor: 'background.default',
      p: 3,
      textAlign: 'center',
    }}
  >
    <Box sx={{ maxWidth: 420 }}>
      <Typography variant="h1" sx={{ fontSize: 64, fontWeight: 700, color: 'primary.main' }}>
        404
      </Typography>
      <Typography variant="h5" sx={{ mt: 1 }}>
        This page is out of bounds
      </Typography>
      <Typography sx={{ color: 'text.secondary', mt: 1 }}>
        The page you’re looking for doesn’t exist or the project, system, team, or person was
        removed.
      </Typography>
      <Button component={Link} to={paths.root} variant="contained" sx={{ mt: 3 }}>
        Back to overview
      </Button>
    </Box>
  </Box>
);

export default NotFound;
