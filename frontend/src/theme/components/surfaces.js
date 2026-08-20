// Surface-level components: Paper, AppBar, Drawer, Card, Table surfaces.
export default {
  MuiPaper: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundImage: 'none',
        backgroundColor: theme.palette.background.paper,
        borderRadius: 'var(--radius-control)',
      }),
    },
  },
  MuiAppBar: {
    defaultProps: { color: 'inherit', elevation: 0 },
    styleOverrides: {
      root: {
        boxShadow: 'none',
        backgroundColor: 'var(--header-bg)',
        color: 'var(--header-text)',
        borderBottom: '1px solid var(--header-border)',
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        boxShadow: 'none',
        backgroundColor: 'var(--surface-elevated)',
      },
      docked: {
        '& .MuiPaper-root': { boxShadow: 'none' },
      },
    },
  },
  MuiPopover: {
    styleOverrides: {
      paper: { backgroundColor: 'var(--surface-elevated)' },
    },
  },
  MuiCard: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 'var(--radius-card)',
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        overflow: 'hidden',
      }),
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderColor: 'var(--border-table)',
        fontSize: '0.8125rem',
        color: theme.palette.text.primary,
        padding: '12px 16px',
      }),
      head: ({ theme }) => ({
        fontSize: '0.6875rem',
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: theme.palette.text.secondary,
        backgroundColor: 'var(--surface-subtle)',
      }),
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: ({ theme: _theme }) => ({
        '&:hover': { backgroundColor: 'var(--surface-subtle)' },
        '&:last-of-type .MuiTableCell-root': { borderBottom: 'none' },
      }),
    },
  },
  MuiTableSortLabel: {
    styleOverrides: {
      root: ({ theme }) => ({
        '&.MuiTableSortLabel-active': { color: theme.palette.primary.main, fontWeight: 700 },
      }),
    },
  },
  MuiToolbar: {
    styleOverrides: {
      root: {
        minHeight: '72px',
      },
    },
  },
};
