import { Box, Typography } from '@mui/material';
import FormatQuote from '@mui/icons-material/FormatQuote';
import Surface from '../../../components/styled/Surface.jsx';

/** Light quote card that balances the featured hero (spec section 8). */
const RecognitionPhilosophy = () => (
  <Surface sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: { xs: 3, sm: 4 } }}>
    <Box>
      <FormatQuote sx={{ fontSize: 34, color: 'var(--primary)', opacity: 0.55 }} />
      <Typography
        sx={{
          mt: 1,
          fontWeight: 700,
          fontSize: { xs: 19, sm: 22 },
          lineHeight: 1.4,
          letterSpacing: '-0.01em',
        }}
      >
        “Recognizing engineers who build more than code —
        they build the future.”
      </Typography>
    </Box>
    <Typography sx={{ mt: 4, color: 'text.secondary', fontSize: 13, fontWeight: 600 }}>
      — AI-EIP
    </Typography>
  </Surface>
);

export default RecognitionPhilosophy;