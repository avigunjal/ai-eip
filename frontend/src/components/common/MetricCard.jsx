import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import HelpOutlineOutlined from '@mui/icons-material/HelpOutlineOutlined';
import Surface from '../styled/Surface.jsx';

/**
 * KPI card: label + big value + optional delta/context. `trend` slot can hold
 * a tiny chart (e.g. Recharts sparkline). Clickable when `onClick` is provided.
 * `help` renders a tooltip next to the label (e.g. clarifying a metric's meaning).
 * `chain` renders the engineering relationship hops under the detail.
 */
const MetricCard = ({ label, value, delta, detail, icon, trend, onClick, help, chain, sx }) => {
  const deltaGood = delta != null && delta >= 0;
  const DeltaIcon = delta != null && delta >= 0 ? ArrowUpward : ArrowDownward;
  return (
    <Surface
      onClick={onClick}
      sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', cursor: onClick ? 'pointer' : 'default', ...sx }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary' }}>
            {label}
          </Typography>
          {help && (
            <Tooltip title={help} arrow placement="top">
              <IconButton size="small" aria-label={`About ${label}`} sx={{ p: 0.25, color: 'text.disabled' }}>
                <HelpOutlineOutlined sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        {icon}
      </Box>

      <Typography sx={{ fontSize: 32, fontWeight: 700, lineHeight: '40px', mt: 1.5 }}>{value}</Typography>

      {delta != null && (
        <Typography sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: 13, mt: 0.5, color: deltaGood ? 'success.main' : 'error.main' }}>
          <DeltaIcon sx={{ fontSize: 16 }} />
          {delta}%
        </Typography>
      )}
      {detail && <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5 }}>{detail}</Typography>}

      {chain && <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1.5 }}>{chain}</Box>}

      {trend && <Box sx={{ mt: 'auto', pt: 1.5 }}>{trend}</Box>}
    </Surface>
  );
};

export default MetricCard;
