import { styled } from '@mui/material/styles';
import { Paper } from '@mui/material';

/**
 * The standard AI-EIP card surface.
 * Aurora-inspired: relies on a 1px outline (not border) so layout doesn't
 * shift, with a 14px radius and a very soft elevation. Use for all cards.
 */
const Surface = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  backgroundImage: 'none',
  borderRadius: 'var(--radius-card)',
  outline: `1px solid ${theme.palette.divider}`,
  boxShadow: 'var(--shadow-card)',
  '&:focus-visible': {
    outline: '2px solid var(--primary)',
    outlineOffset: '2px',
  },
}));

export default Surface;
