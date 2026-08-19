import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import HelpOutlineOutlined from '@mui/icons-material/HelpOutlineOutlined';
import Surface from '../styled/Surface.jsx';
import { useCountUp } from '../../hooks/useCountUp.js';

/**
 * KPI card: label + big value + optional delta/context. `trend` slot can hold
 * a tiny chart (e.g. Recharts sparkline). Clickable when `onClick` is provided.
 * `help` renders a tooltip next to the label (e.g. clarifying a metric's meaning).
 * `chain` renders the engineering relationship hops under the detail.
 *
 * Values count up 0 → target on first load (800ms); hover lifts the card,
 * softens the shadow, scales the icon, and highlights the value.
 */
const MetricCard = ({ label, value, delta, detail, icon, iconBg, iconColor, trend, onClick, help, chain, compact, sx }) => {
  const deltaGood = delta != null && delta >= 0;
  const DeltaIcon = delta != null && delta >= 0 ? ArrowUpward : ArrowDownward;
  const animatedValue = useCountUp(value);
  return (
    <Surface
      onClick={onClick}
      sx={{
        p: compact ? 1.5 : 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 150ms ease, box-shadow 150ms ease',
        '& .metric-icon': { transition: 'transform 150ms ease' },
        '& .metric-value': { transition: 'color 150ms ease' },
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 'var(--shadow-float)',
          '& .metric-icon': { transform: 'scale(1.12)' },
          '& .metric-value': { color: 'var(--primary)' },
        },
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, minWidth: 0 }}>
        <Box sx={{ flex: 1, minWidth: 0, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
          <Typography sx={{ fontSize: compact ? 10 : 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {label}
          </Typography>
          {help && (
            <Tooltip title={help} arrow placement="top">
              <IconButton size="small" aria-label={`About ${label}`} sx={{ p: 0.25, color: 'text.disabled', flexShrink: 0 }}>
                <HelpOutlineOutlined sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        {icon && (
          <Box className="metric-icon" sx={{ flexShrink: 0, display: 'inline-flex' }}>
            {iconBg ? (
              <Box
                sx={{
                  width: compact ? 30 : 36,
                  height: compact ? 30 : 36,
                  borderRadius: 'var(--radius-control)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: iconBg,
                  color: iconColor,
                  flexShrink: 0,
                  '& svg': { fontSize: compact ? 17 : 20 },
                }}
              >
                {icon}
              </Box>
            ) : (
              icon
            )}
          </Box>
        )}
      </Box>

      <Typography className="metric-value" sx={{ fontSize: compact ? 24 : 32, fontWeight: 700, lineHeight: compact ? '30px' : '40px', mt: compact ? 0.75 : 1.5 }}>
        {animatedValue}
      </Typography>

      {delta != null && (
        <Typography sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: compact ? 11.5 : 13, mt: 0.25, color: deltaGood ? 'success.main' : 'error.main' }}>
          <DeltaIcon sx={{ fontSize: compact ? 14 : 16 }} />
          {delta}%
        </Typography>
      )}
      {detail &&
        (typeof detail === 'string' ? (
          <Typography sx={{ fontSize: compact ? 11.5 : 13, color: 'text.secondary', mt: 0.25 }}>{detail}</Typography>
        ) : (
          <Box sx={{ mt: 0.25 }}>{detail}</Box>
        ))}

      {chain && <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1.25 }}>{chain}</Box>}

      {trend && <Box sx={{ mt: 'auto', pt: compact ? 1 : 1.5 }}>{trend}</Box>}
    </Surface>
  );
};

export default MetricCard;