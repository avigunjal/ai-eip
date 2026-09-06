import { Box, Button, Typography } from '@mui/material';
import ArrowForward from '@mui/icons-material/ArrowForward';
import SparkleIcon from '../../../components/ui/SparkleIcon.jsx';

/**
 * Compact onboarding strip (spec section 6). One quiet line of context between
 * the KPI row and the inbox — useful copy without competing for attention.
 */
const DecisionIntelligenceBanner = ({ onLearnMore, sx }) => (
  <Box
    sx={{
      px: 2,
      py: 1.5,
      borderRadius: 'var(--radius-control)',
      border: '1px solid',
      borderColor: 'divider',
      bgcolor: 'var(--surface-subtle)',
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      flexWrap: 'wrap',
      ...sx,
    }}
  >
    <SparkleIcon sx={{ fontSize: 16, color: 'var(--ai)', flexShrink: 0 }} />
    <Typography sx={{ fontWeight: 700, fontSize: 13 }}>From signals to decisions</Typography>
    <Typography sx={{ fontSize: 12.5, color: 'text.secondary', flex: 1, minWidth: 240 }}>
      AI connects risks, capacity, skills and knowledge to recommend the best path forward.
    </Typography>
    <Button
      variant="text"
      endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
      onClick={onLearnMore}
      sx={{ textTransform: 'none', fontSize: 12.5, fontWeight: 600, p: 0.5 }}
    >
      Learn more
    </Button>
  </Box>
);

export default DecisionIntelligenceBanner;