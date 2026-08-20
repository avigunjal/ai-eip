import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import Person2Outlined from '@mui/icons-material/Person2Outlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuthStore } from '../../store/authStore.js';
import SparkleIcon from '../../components/ui/SparkleIcon.jsx';

/**
 * Lightweight sign-in page. Shown only when the backend requires auth
 * (AUTH_PASSWORD configured); otherwise RequireAuth lets users straight in.
 * Styled to match the dashboard: card on canvas, brand mark, Inter, soft radii.
 */
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const from = location.state?.from || '/';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    const result = await login(username, password);
    setSubmitting(false);
    if (result.ok) {
      navigate(from, { replace: true });
    } else {
      setError(result.message);
    }
  };

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
        component="form"
        onSubmit={handleSubmit}
        sx={{
          position: 'relative',
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
        {/* Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
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
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 19, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              AI-EIP
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.3 }}>
              Engineering Intelligence Platform
            </Typography>
          </Box>
        </Box>

        <Typography sx={{ fontWeight: 700, fontSize: 26, letterSpacing: '-0.02em' }}>
          Welcome back
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 15, mt: 1, mb: 4 }}>
          Sign in to your workspace to continue.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, '& .MuiAlert-message': { fontSize: 13.5 } }}>
            {error}
          </Alert>
        )}

        <TextField
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          autoFocus
          fullWidth
          size="medium"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Person2Outlined sx={{ fontSize: 22, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 2.5 }}
        />

        <TextField
          placeholder="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          fullWidth
          size="medium"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined sx={{ fontSize: 21, color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((v) => !v)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 3 }}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={submitting}
          sx={{ py: 1.5, fontSize: 15, textTransform: 'none', fontWeight: 600 }}
        >
          {submitting ? <CircularProgress size={22} color="inherit" /> : 'Sign in'}
        </Button>

        <Divider sx={{ my: 4 }} />

        <Typography sx={{ fontSize: 13, color: 'text.disabled', textAlign: 'center', lineHeight: 1.5 }}>
          Secured workspace access · Session expires automatically.
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;