import { useMediaQuery, useTheme } from '@mui/material';

/**
 * MUI-breakpoint helpers used across the shell for responsive behavior.
 * Returns boolean flags for the common breakpoints.
 */
export function useBreakpoints() {
  const theme = useTheme();
  return {
    isMobile: useMediaQuery(theme.breakpoints.down('sm')), // < 600
    isTablet: useMediaQuery(theme.breakpoints.between('sm', 'md')), // 600-899
    isDesktop: useMediaQuery(theme.breakpoints.up('md')), // >= 900
    isLarge: useMediaQuery(theme.breakpoints.up('lg')), // >= 1200
  };
}
