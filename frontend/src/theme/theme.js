import { createTheme } from '@mui/material/styles';
import palette from './palette.js';
import createTypography from './typography.js';
import shadows from './shadows.js';
import components from './components/index.js';

/**
 * Aurora-aligned MUI theme (light only). Composes palette (from CSS-var
 * tokens), Inter typography, soft shadows, and component overrides.
 */
const theme = createTheme({
  palette,
  typography: createTypography(),
  shadows,
  shape: { borderRadius: 8 },
  components,
});

export default theme;
