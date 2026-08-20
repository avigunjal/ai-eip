import { blue, green, grey, lightBlue, orange, purple, red } from './colors.js';

/**
 * Builds the MUI palette from an active token set (moss or classic).
 * `background.default` is the canvas, `background.paper` the card surface.
 * `secondary` is the AI accent — reserved for AI functionality so it stays
 * visually recognizable across the product. Aurora-style `chGrey/chRed/...`
 * scales are exposed for charts (identical in both themes).
 */
const createPalette = (t) => ({
  mode: 'light',
  common: { black: '#000000', white: '#ffffff' },
  primary: {
    lighter: t.primaryLighter,
    light: t.primaryLight,
    main: t.primaryHover,
    dark: t.primaryDark,
    darker: t.primaryDarker,
    contrastText: '#FFFFFF',
  },
  secondary: {
    lighter: t.aiLighter,
    light: t.aiLight,
    main: t.ai,
    dark: t.aiDark,
    darker: t.aiDarker,
    contrastText: '#FFFFFF',
  },
  success: {
    lighter: t.successLighter,
    light: t.successLight,
    main: t.success,
    dark: t.successDark,
    contrastText: '#FFFFFF',
  },
  warning: {
    lighter: t.amberLighter,
    light: t.warningLight,
    main: t.amber,
    dark: t.warningDark,
    contrastText: '#FFFFFF',
  },
  error: {
    lighter: t.redLighter,
    light: t.errorLight,
    main: t.red,
    dark: t.errorDark,
    contrastText: '#FFFFFF',
  },
  info: {
    lighter: t.infoLighter,
    light: t.infoLight,
    main: t.info,
    dark: t.infoDark,
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
    primary: t.text,
    secondary: t.textMuted,
    disabled: t.textDisabled,
  },
  divider: t.border,
  background: {
    default: t.canvas,
    paper: t.surface,
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
});

export default createPalette;