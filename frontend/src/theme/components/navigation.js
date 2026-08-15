// Navigation components: Tabs, Tab, Breadcrumbs, Menu, Pagination, List.
export default {
  MuiTabs: {
    defaultProps: { textColor: 'inherit' },
    styleOverrides: {
      indicator: {
        backgroundColor: 'var(--primary)',
        height: 2,
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: ({ theme }) => ({
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.875rem',
        color: theme.palette.text.secondary,
        minHeight: 40,
        padding: theme.spacing(1, 1.5),
        '&.Mui-selected': { color: theme.palette.primary.main },
        '&.Mui-focusVisible': { outline: '2px solid var(--primary)', outlineOffset: '2px' },
      }),
    },
  },
  MuiBreadcrumbs: {
    styleOverrides: {
      separator: {
        color: 'var(--text-disabled)',
      },
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: ({ theme }) => ({
        borderRadius: 'var(--radius-control)',
        boxShadow: 'var(--shadow-float)',
        border: `1px solid ${theme.palette.divider}`,
      }),
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: {
        minHeight: 36,
        borderRadius: 'var(--radius-small)',
        fontSize: '0.8125rem',
      },
    },
  },
  MuiPaginationItem: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 'var(--radius-small)',
        '&.Mui-selected': {
          backgroundColor: theme.palette.primary.main,
          color: '#fff',
          '&:hover': { backgroundColor: 'var(--primary-hover)' },
        },
        '&.Mui-focusVisible': { outline: '2px solid var(--primary)', outlineOffset: '2px' },
      }),
    },
  },
  MuiList: {
    styleOverrides: { root: { padding: 0 } },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 'var(--radius-control)',
        padding: '10px 12px',
        color: theme.palette.text.secondary,
        '&:hover': { backgroundColor: theme.palette.action.hover },
        '&.Mui-selected': {
          backgroundColor: theme.palette.primary.lighter,
          color: theme.palette.primary.main,
          fontWeight: 600,
          '&:hover': { backgroundColor: theme.palette.primary.lighter },
          '& .MuiListItemText-primary': { color: theme.palette.primary.main },
        },
        '&.Mui-focusVisible': {
          outline: '2px solid var(--primary)',
          outlineOffset: '2px',
        },
      }),
    },
  },
  MuiListItemIcon: {
    styleOverrides: { root: { color: 'inherit', minWidth: 36 } },
  },
};
