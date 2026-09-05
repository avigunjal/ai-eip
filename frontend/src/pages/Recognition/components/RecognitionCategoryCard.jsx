import { Box, IconButton, Typography } from '@mui/material';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import QueryStats from '@mui/icons-material/QueryStats';
import Star from '@mui/icons-material/Star';
import MilitaryTech from '@mui/icons-material/MilitaryTech';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import Surface from '../../../components/styled/Surface.jsx';

const LEVEL_ICONS = {
  calendar: CalendarMonth,
  analytics: QueryStats,
  star: Star,
  medal: MilitaryTech,
};

/** Single award category card: icon, description, recipient count, arrow. */
const RecognitionCategoryCard = ({ level, onNavigate }) => {
  const Icon = LEVEL_ICONS[level.icon] ?? Star;
  const premium = !!level.premium;
  return (
    <Surface
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        p: 2.5,
        height: '100%',
        transition: 'transform 150ms ease, box-shadow 150ms ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: 'var(--shadow-float)' },
        ...(premium && {
          backgroundImage:
            'linear-gradient(160deg, rgba(214,181,118,0.16) 0%, rgba(214,181,118,0.06) 40%, rgba(214,181,118,0.02) 100%)',
          outline: '1px solid rgba(184,137,79,0.45)',
          boxShadow: 'inset 0 1px 0 rgba(214,181,118,0.35), 0 1px 2px rgba(0,0,0,0.06)',
        }),
      }}
    >
      {premium && (
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            top: 0,
            left: 16,
            right: 16,
            height: 2,
            borderRadius: '999px',
            background: 'linear-gradient(90deg, transparent, #c99b5a, #e6cd94, #c99b5a, transparent)',
          }}
        />
      )}
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 'var(--radius-control)',
          display: 'grid',
          placeItems: 'center',
          bgcolor: level.bg,
          color: level.color,
          ...(premium && { color: '#8a5a1e', boxShadow: '0 2px 8px rgba(184,137,79,0.25)' }),
          '& svg': { fontSize: 20 },
        }}
      >
        <Icon />
      </Box>
      <Typography sx={{ fontWeight: 700, fontSize: 15, ...(premium && { letterSpacing: '0.01em' }), color: premium ? '#7a4f16' : 'inherit' }}>
        {level.title}
      </Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: 13, flex: 1, lineHeight: 1.5 }}>
        {level.description}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
        <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>
          {level.recipients} {level.recipients === 1 ? 'recipient' : 'recipients'}
        </Typography>
        <IconButton
          size="small"
          aria-label={`View ${level.title}`}
          onClick={onNavigate}
          sx={{ color: level.color }}
        >
          <KeyboardArrowRight />
        </IconButton>
      </Box>
    </Surface>
  );
};

export default RecognitionCategoryCard;