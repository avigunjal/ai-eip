import { Chip } from '@mui/material';
import CheckCircle from '@mui/icons-material/CheckCircle';
import WarningAmber from '@mui/icons-material/WarningAmber';
import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined';
import Info from '@mui/icons-material/Info';
import { slowPulse } from '../../config/animations.js';

/**
 * Status pill that combines an icon + label + color, never color alone (a11y).
 * `config` is a record from config/riskLabels.js ({ label, color, bg, tone }).
 * `tone` selects a default icon; pass `icon` to override.
 * `pulse` adds a slow (3s) breathing animation — used for critical risk badges.
 */
const toneIcon = {
  success: CheckCircle,
  warning: WarningAmber,
  error: ErrorOutlineOutlined,
  info: Info,
  secondary: Info,
};

const StatusBadge = ({ config, icon, size = 'small', sx, pulse }) => {
  const Icon = icon ?? toneIcon[config.tone] ?? Info;
  return (
    <Chip
      size={size}
      variant="filled"
      icon={<Icon />}
      label={config.label}
      sx={{
        bgcolor: config.bg,
        color: config.color,
        fontWeight: 600,
        borderRadius: 999,
        border: `1px solid color-mix(in srgb, ${config.color} 30%, transparent)`,
        '& .MuiChip-icon': { color: config.color, fontSize: size === 'small' ? 16 : 18 },
        ...(pulse ? { animation: `${slowPulse} 3s ease-in-out infinite` } : {}),
        ...sx,
      }}
    />
  );
};

export default StatusBadge;
