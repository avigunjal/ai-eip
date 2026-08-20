// Feedback components: Chip, Tooltip, Dialog, Snackbar, Progress, Skeleton, Alert.
export default {
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 'var(--radius-control)',
        fontWeight: 500,
        '&.Mui-focusVisible': { outline: '2px solid var(--primary)', outlineOffset: '2px' },
      },
      colorPrimary: { backgroundColor: 'var(--primary-lighter)', color: 'var(--primary)' },
      colorDefault: { backgroundColor: 'var(--surface-subtle)', color: 'var(--text-muted)' },
    },
  },
  MuiTooltip: {
    defaultProps: { arrow: true, placement: 'top' },
    styleOverrides: {
      tooltip: {
        backgroundColor: 'var(--text)',
        fontSize: '0.75rem',
        fontWeight: 500,
        borderRadius: 'var(--radius-small)',
        padding: '6px 10px',
      },
      arrow: { color: 'var(--text)' },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-float)',
        backgroundColor: 'var(--surface-elevated)',
      },
    },
  },
  MuiDialogTitle: {
    styleOverrides: { root: { fontSize: '1.125rem', fontWeight: 700 } },
  },
  MuiSnackbarContent: {
    styleOverrides: {
      root: {
        borderRadius: 'var(--radius-control)',
        fontWeight: 500,
        backgroundColor: 'var(--surface-elevated)',
        color: 'var(--text)',
      },
    },
  },
  MuiLinearProgress: {
    defaultProps: { color: 'primary' },
    styleOverrides: {
      root: { borderRadius: 4, height: 6 },
      bar: { borderRadius: 4 },
    },
  },
  MuiCircularProgress: {
    defaultProps: { size: 22 },
  },
  MuiSkeleton: {
    defaultProps: { animation: 'pulse' },
    styleOverrides: {
      root: { backgroundColor: 'var(--surface-subtle)' },
      rounded: { borderRadius: 'var(--radius-control)' },
    },
  },
};
