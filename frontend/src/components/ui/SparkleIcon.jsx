import AutoAwesome from '@mui/icons-material/AutoAwesome';
import { sparkleSpin } from '../../config/animations.js';
import { useAiEnabled } from '../../store/aiStore.js';

/**
 * AutoAwesome icon with a very subtle periodic sparkle rotation (every 5s).
 * Used on AI-trigger buttons and the AI identity header so the AI layer reads
 * as alive without constant motion.
 *
 * When AI is disabled in Settings the icon renders static and greyed out —
 * the same "disabled" look the Insights page uses for its AI actions.
 */
const SparkleIcon = ({ sx, ...props }) => {
  const aiEnabled = useAiEnabled();
  return (
    <AutoAwesome
      sx={{
        animation: aiEnabled ? `${sparkleSpin} 5s ease-in-out infinite` : 'none',
        ...(aiEnabled ? {} : { opacity: 0.5, filter: 'grayscale(1)' }),
        ...sx,
      }}
      {...props}
    />
  );
};

export default SparkleIcon;
