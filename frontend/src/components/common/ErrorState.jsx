import { Box, Button, Typography } from '@mui/material';
import SparkleIcon from '../../components/ui/SparkleIcon.jsx';

/**
 * Themed error state with Retry action and AI-EIP brand mark.
 * Used by pages via the `useData` hook when a fetcher rejects.
 */
const ErrorState = ({ message = 'Something went wrong while loading this data.', onRetry, sx }) => (
  <Box
    sx={{
      position: 'relative',
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      bgcolor: 'background.default',
      p: 2,
      overflow: 'hidden',
      ...sx,
    }}
  >
    {/* Soft decorative gradient accents behind the card */}
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        top: -120,
        right: -120,
        width: 420,
        height: 420,
        borderRadius: '50%',
        background: 'radial-gradient(circle, var(--blob-primary), transparent 70%)',
        pointerEvents: 'none',
      }}
    />
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        bottom: -140,
        left: -140,
        width: 420,
        height: 420,
        borderRadius: '50%',
        background: 'radial-gradient(circle, var(--blob-secondary), transparent 70%)',
        pointerEvents: 'none',
      }}
    />

    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        width: '100%',
        maxWidth: 460,
        p: { xs: 4, sm: 5 },
        outline: '1px solid',
        outlineColor: 'divider',
        borderRadius: 'var(--radius-card)',
        bgcolor: 'background.paper',
        boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
      }}
    >
      {/* Brand mark - centered logo with tagline */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, mb: 4 }}>
        <Box
          sx={{
            display: 'grid',
            placeItems: 'center',
            width: 52,
            height: 52,
            borderRadius: '16px',
            background: 'var(--brand-gradient)',
            color: '#FFFFFF',
            boxShadow: 'var(--brand-shadow-lg)',
          }}
        >
          <SparkleIcon sx={{ fontSize: 28, color: '#FFFFFF' }} />
        </Box>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.3 }}>
          Engineering Intelligence Platform
        </Typography>
      </Box>

      <Typography sx={{ fontWeight: 700, fontSize: 26, letterSpacing: '-0.02em' }}>
        Couldn&apos;t load data
      </Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: 15, mt: 1, mb: 3, maxWidth: 360 }}>
        {message}
      </Typography>

      {onRetry && (
        <Button
          variant="contained"
          onClick={onRetry}
          size="large"
          sx={{ mt: 1, py: 1.5, fontSize: 15, textTransform: 'none', fontWeight: 600 }}
        >
          Retry
        </Button>
      )}
    </Box>
  </Box>
);

export default ErrorState;