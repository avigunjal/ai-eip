import { useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import createAppTheme from '../theme/theme.js';
import { useThemeStore } from '../store/themeStore.js';

/**
 * Applies the active theme variant. Sets the data-theme attribute on <html>
 * (drives the CSS token set in styles/tokens.css) and rebuilds the MUI theme
 * so both CSS-var and palette-based styles stay in sync.
 */
const ThemeProvider = ({ children }) => {
  const variant = useThemeStore((s) => s.variant);

  useEffect(() => {
    document.documentElement.dataset.theme = variant;
  }, [variant]);

  const theme = useMemo(() => createAppTheme(variant), [variant]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

export default ThemeProvider;