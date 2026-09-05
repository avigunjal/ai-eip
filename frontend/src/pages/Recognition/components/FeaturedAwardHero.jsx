import { Box, Button, Typography } from '@mui/material';
import EmojiEvents from '@mui/icons-material/EmojiEvents';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import dayjs from 'dayjs';

/**
 * Featured League Extraordinaire hero (spec section 7). Dark olive background,
 * subtle gold accents, trophy as support — never dominating the content.
 */
const FeaturedAwardHero = () => {
  const year = dayjs().format('YYYY');
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        minHeight: 240,
        p: { xs: 3, sm: 4 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 'var(--radius-card)',
        background: 'linear-gradient(135deg, #4c5a42 0%, #3a4530 55%, #2e3727 100%)',
        color: '#f5f2e9',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,181,118,0.30), transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <EmojiEvents
        aria-hidden
        sx={{
          position: 'absolute',
          top: '50%',
          right: { xs: 12, sm: 28 },
          transform: 'translateY(-50%)',
          fontSize: { xs: 84, sm: 128 },
          color: 'rgba(214,181,118,0.34)',
          filter: 'drop-shadow(0 4px 18px rgba(214,181,118,0.30))',
          pointerEvents: 'none',
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box
          component="span"
          sx={{
            alignSelf: 'flex-start',
            px: 1.25,
            py: 0.5,
            borderRadius: '999px',
            border: '1px solid rgba(214,181,118,0.55)',
            color: '#e6cd94',
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          Featured
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: { xs: 24, sm: 28 }, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
          League Extraordinaire {year}
        </Typography>
        <Typography sx={{ color: 'rgba(245,242,233,0.78)', fontSize: 14, maxWidth: 480, lineHeight: 1.55 }}>
          Recognizing engineers who create lasting impact beyond projects — driving innovation,
          growth and a stronger engineering organization.
        </Typography>
      </Box>

      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mt: 3 }}>
        <Button
          endIcon={<KeyboardArrowRight />}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            color: '#e6cd94',
            borderColor: 'rgba(214,181,118,0.55)',
            '&:hover': { borderColor: '#e6cd94', bgcolor: 'rgba(214,181,118,0.12)' },
          }}
          variant="outlined"
        >
          View Nominees
        </Button>
        <Typography sx={{ fontSize: 12.5, color: 'rgba(245,242,233,0.6)' }}>
          The highest recognition for lasting organizational impact
        </Typography>
      </Box>
    </Box>
  );
};

export default FeaturedAwardHero;