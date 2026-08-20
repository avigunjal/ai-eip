import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuthStore } from '../../store/authStore.js';

/**
 * Route guard. Probes the backend once (bootstrap), shows a theme-matched
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
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={28} />
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>Checking session…</Typography>
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