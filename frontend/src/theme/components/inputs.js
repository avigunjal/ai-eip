// Input components: TextField / OutlinedInput, Select, Autocomplete, Checkbox, Radio, Switch.
export default {
  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 'var(--radius-control)',
        backgroundColor: theme.palette.background.paper,
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.divider,
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: 'var(--border-strong)',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.primary.main,
        },
      }),
    },
  },
  MuiInputLabel: {
    styleOverrides: {
      root: ({ theme }) => ({
        '&.Mui-focused': { color: theme.palette.primary.main },
      }),
    },
  },
  MuiAutocomplete: {
    styleOverrides: {
      paper: ({ theme: _theme }) => ({
        borderRadius: 'var(--radius-control)',
        boxShadow: 'var(--shadow-float)',
      }),
    },
  },
  MuiCheckbox: {
    defaultProps: { color: 'primary' },
  },
  MuiRadio: {
    defaultProps: { color: 'primary' },
  },
  MuiSwitch: {
    defaultProps: { color: 'primary' },
  },
  MuiSelect: {
    defaultProps: { size: 'small' },
  },
};
