import { createTheme } from '@mui/material/styles';
import { mossTokens, classicTokens } from './colors.js';
import createPalette from './palette.js';
import createTypography from './typography.js';
import { shadowsByVariant } from './shadows.js';
import components from './components/index.js';

/**
 * Builds the app theme for a variant ('moss' | 'classic'). Palette values come
 * from the matching token set; raw CSS resolves the same values from
 * styles/tokens.css via the data-theme attribute on <html>.
 */
const createAppTheme = (variant = 'moss') => {
  const tokens = variant === 'classic' ? classicTokens : mossTokens;
  return createTheme({
    palette: createPalette(tokens),
    typography: createTypography(),
    shadows: shadowsByVariant[variant] ?? shadowsByVariant.moss,
    shape: { borderRadius: 8 },
    // Enterprise-felt, slightly slower drawer/modal enter (risk drawer slide).
    transitions: { duration: { enteringScreen: 300 } },
    components,
  });
};

export default createAppTheme;