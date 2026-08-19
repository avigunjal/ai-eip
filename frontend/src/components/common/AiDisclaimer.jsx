import { Box, Typography } from '@mui/material';
import AutoAwesome from '@mui/icons-material/AutoAwesome';

/**
 * Small, unobtrusive disclaimer shown wherever AI-generated content appears.
 * Kept tiny (12px) so it reinforces trust without competing with the content.
 */
const AiDisclaimer = ({ sx }) => (
  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, color: 'text.disabled', ...sx }}>
    <AutoAwesome sx={{ fontSize: 13 }} />
    <Typography component="span" sx={{ fontSize: 12, lineHeight: 1.4 }}>
      AI-generated recommendation. Verify before making decisions.
    </Typography>
  </Box>
);

export default AiDisclaimer;