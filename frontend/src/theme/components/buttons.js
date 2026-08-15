// Button family overrides + Aurora-style `soft` variant.
const softColors = ['primary', 'secondary', 'success', 'warning', 'error', 'info'];

const softVariants = softColors.map((color) => ({
  props: { variant: 'soft', color },
  style: ({ theme }) => ({
    backgroundColor: theme.palette[color].lighter,
    color: theme.palette[color].dark || theme.palette[color].main,
    '&:hover': {
      backgroundColor: `${theme.palette[color].main}1f`,
    },
  }),
}));

export default {
  MuiButton: {
    defaultProps: { disableElevation: true },
    variants: softVariants,
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 'var(--radius-control)',
        fontWeight: 600,
        fontSize: '0.875rem',
        lineHeight: 1.43,
        padding: theme.spacing(1, 2),
        textTransform: 'none',
        minHeight: 36,
        '&.Mui-focusVisible': {
          outline: '2px solid var(--primary)',
          outlineOffset: '2px',
        },
      }),
      sizeSmall: { minHeight: 30, fontSize: '0.8125rem' },
      sizeLarge: { minHeight: 42, fontSize: '0.9375rem' },
      containedPrimary: {
        boxShadow: 'none',
        '&:hover': { backgroundColor: 'var(--primary-hover)' },
      },
    },
  },
  MuiIconButton: {
    defaultProps: { size: 'small' },
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 'var(--radius-control)',
        color: theme.palette.text.secondary,
        '&:hover': { backgroundColor: 'var(--surface-subtle)' },
        '&.Mui-focusVisible': { outline: '2px solid var(--primary)', outlineOffset: '2px' },
      }),
    },
  },
};
