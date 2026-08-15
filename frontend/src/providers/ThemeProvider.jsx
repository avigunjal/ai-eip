import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import theme from '../theme/theme.js';

/**
 * Wraps the app with the Aurora-aligned MUI theme and baseline reset.
 * CssBaseline normalizes styles on top of our tokens.css base.
 */
const ThemeProvider = ({ children }) => (
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    {children}
  </MuiThemeProvider>
);

export default ThemeProvider;
