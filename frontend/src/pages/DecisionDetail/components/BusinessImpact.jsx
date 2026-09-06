import { Box, Typography } from '@mui/material';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import TrendingUp from '@mui/icons-material/TrendingUp';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import Surface from '../../../components/styled/Surface.jsx';

const ARROW_ICON = {
  up: { Icon: ArrowUpward, color: 'var(--teal)' },
  down: { Icon: ArrowDownward, color: 'var(--red)' },
};

/**
 * Section 06 — Impact if we act (spec §19/§20): the projected outcomes of the
 * recommended path as four compact metrics. Arrows only decorate — the label
 * and value text carry the meaning.
 */
const BusinessImpact = ({ explanation }) => (
  <Box
    component="section"
    aria-label="Potential impact"
    sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}
  >
    {explanation.impact.map((item) => {
      const arrow = ARROW_ICON[item.arrow] ?? { Icon: TrendingUp, color: 'var(--teal)' };
      return (
        <Surface key={item.label} sx={{ p: { xs: 2, md: 2.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}>
              {item.label}
            </Typography>
            {item.arrow ? <arrow.Icon sx={{ fontSize: 17, color: arrow.color }} aria-hidden /> : <InfoOutlined sx={{ fontSize: 16, color: 'text.disabled' }} aria-hidden />}
          </Box>
          <Typography sx={{ fontSize: { xs: 19, md: 21 }, fontWeight: 700, mt: 1, letterSpacing: '-0.01em' }}>
            {item.value}
          </Typography>
        </Surface>
      );
    })}
  </Box>
);

export default BusinessImpact;