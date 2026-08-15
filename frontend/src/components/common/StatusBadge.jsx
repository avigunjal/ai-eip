import { Chip } from '@mui/material';
import CheckCircle from '@mui/icons-material/CheckCircle';
import WarningAmber from '@mui/icons-material/WarningAmber';
import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined';
import Info from '@mui/icons-material/Info';

/**
 * Status pill that combines an icon + label + color, never color alone (a11y).
 * `config` is a record from config/riskLabels.js ({ label, color, bg, tone }).
 * `tone` selects a default icon; pass `icon` to override.
 */
const toneIcon = {
  success: CheckCircle,
  warning: WarningAmber,
  error: ErrorOutlineOutlined,
  info: Info,
  secondary: Info,
};

const StatusBadge = ({ config, icon, size = 'small', sx }) => {
  const Icon = icon ?? toneIcon[config.tone] ?? Info;
  return (
    <Chip
      size={size}
      icon={<Icon />}
      label={config.label}
      sx={{
        bgcolor: config.bg,
        color: config.color,
        fontWeight: 600,
        '& .MuiChip-icon': { color: config.color },
        ...sx,
      }}
    />
  );
};

export default StatusBadge;
