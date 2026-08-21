import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuthStore } from '../../store/authStore.js';
import SparkleIcon from '../ui/SparkleIcon.jsx';

/**
 * Route guard. Probes the backend once (bootstrap), shows a branded
 * loading state while checking, and sends anonymous users to /login.
 * The login page is intentionally outside this guard so it stays reachable.
 */
const RequireAuth = ({ children }) => {
  const status = useAuthStore((s) => s.status);
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const location = useLocation();

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  if (status === 'idle' || status === 'loading') {
    return (
      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'background.default',
          p: 2,
          overflow: 'hidden',
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
            Verifying your session…
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress size={28} />
          </Box>
        </Box>
      </Box>
    );
  }

  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return children;
};

export default RequireAuth;