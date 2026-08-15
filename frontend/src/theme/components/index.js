import surfaces from './surfaces.js';
import buttons from './buttons.js';
import inputs from './inputs.js';
import navigation from './navigation.js';
import feedback from './feedback.js';

/**
 * Merged MUI component overrides. Kept as plain objects so the theme stays
 * serializable and easy to extend (matches the Aurora theme/components layout).
 */
const components = {
  ...surfaces,
  ...buttons,
  ...inputs,
  ...navigation,
  ...feedback,
};

export default components;
