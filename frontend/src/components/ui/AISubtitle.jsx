import { Box } from '@mui/material';
import SparkleIcon from './SparkleIcon.jsx';

/**
 * Page-subtitle helper that prefixes an AI sparkle icon to AI-related copy.
 * Renders as an inline element so it can sit inside a parent Typography.
 */
const AISubtitle = ({ children }) => (
  <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
    <SparkleIcon sx={{ fontSize: 16, color: 'var(--ai)' }} />
    <Box component="span">{children}</Box>
  </Box>
);

export default AISubtitle;