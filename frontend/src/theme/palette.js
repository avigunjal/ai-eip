import { blue, green, grey, lightBlue, orange, purple, red, token } from './colors.js';

/**
 * MUI palette derived from the AI-EIP CSS-variable tokens.
 * `background.default` is the canvas, `background.paper` the card surface.
 * Aurora-style `chGrey/chRed/chBlue/...` scales are exposed for charts.
 */
const palette = {
  mode: 'light',
  common: { black: '#000000', white: '#ffffff' },
  primary: {
    lighter: token.primaryLighter,
    light: '#7DA3F2',
    main: token.primary,
    dark: token.primaryHover,
    darker: '#1E3A8A',
    contrastText: '#FFFFFF',
  },
  secondary: {
    lighter: token.violetLighter,
    light: '#A98EF0',
    main: token.violet,
    dark: '#5B3FBF',
    contrastText: '#FFFFFF',
  },
  success: {
    lighter: token.tealLighter,
    light: '#4CC3AE',
    main: token.teal,
    dark: '#0B7A6B',
    contrastText: '#FFFFFF',
  },
  warning: {
    lighter: token.amberLighter,
    light: '#E6A84B',
    main: token.amber,
    dark: '#B26E0B',
    contrastText: '#FFFFFF',
  },
  error: {
    lighter: token.redLighter,
    light: '#E47777',
    main: token.red,
    dark: '#AD3434',
    contrastText: '#FFFFFF',
  },
  info: {
    lighter: token.infoLighter,
    light: '#5CC4E6',
    main: token.info,
    dark: '#0B84AB',
    contrastText: '#FFFFFF',
  },
  neutral: {
    lighter: grey[100],
    light: grey[600],
    main: grey[800],
    dark: grey[900],
    darker: grey[950],
    contrastText: '#FFFFFF',
  },
  text: {
    primary: token.text,
    secondary: token.textMuted,
    disabled: token.textDisabled,
  },
  divider: token.border,
  background: {
    default: token.canvas,
    paper: token.surface,
  },
  action: {
    active: grey[600],
    hover: grey[100],
    selected: grey[100],
    hoverOpacity: 0.06,
    selectedOpacity: 0.12,
    disabled: grey[400],
    disabledBackground: grey[200],
    focus: grey[300],
  },
  grey,
  chGrey: grey,
  chBlue: blue,
  chRed: red,
  chOrange: orange,
  chGreen: green,
  chLightBlue: lightBlue,
  chPurple: purple,
};

export default palette;
