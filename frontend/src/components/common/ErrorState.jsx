import { Box, Button, Typography } from '@mui/material';
import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined';

/**
 * Error state with a Retry action. Used by pages via the `useData` hook when a
 * fetcher rejects.
 *
 * REMAINING (extend later):
 *  - show a technical message / error id for support
 *  - context-specific guidance (which fetch failed)
 */
const ErrorState = ({ message = 'Something went wrong while loading this data.', onRetry, sx }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      py: 6,
      px: 3,
      ...sx,
    }}
  >
    <Box sx={{ color: 'error.main', mb: 1 }}>
      <ErrorOutlineOutlined sx={{ fontSize: 40 }} />
    </Box>
    <Typography sx={{ fontWeight: 600 }}>Couldn’t load data</Typography>
    <Typography sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 360 }}>{message}</Typography>
    {onRetry && (
      <Button variant="contained" onClick={onRetry} sx={{ mt: 2 }}>
        Retry
      </Button>
    )}
  </Box>
);

export default ErrorState;
