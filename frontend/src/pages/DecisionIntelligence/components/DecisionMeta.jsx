import { Chip } from '@mui/material';
import Groups from '@mui/icons-material/Groups';
import Shield from '@mui/icons-material/Shield';
import MenuBook from '@mui/icons-material/MenuBook';
import Flag from '@mui/icons-material/Flag';

/**
 * Shared Decision Intelligence metadata: category chips and the page-local
 * severity table used by both Screen 1 (Decision Inbox) and Screen 2
 * (Decision Workspace), so badges never drift between the two.
 */

/** Subtle category differentiation — compact icon + badge, never a big block. */
export const DECISION_TYPE_META = {
  staffing: { label: 'Staffing decision', icon: Groups, color: 'var(--info)', bg: 'var(--info-lighter)' },
  risk_mitigation: { label: 'Risk mitigation decision', icon: Shield, color: 'var(--amber)', bg: 'var(--amber-lighter)' },
  knowledge: { label: 'Knowledge decision', icon: MenuBook, color: 'var(--teal)', bg: 'var(--teal-lighter)' },
  priority_scope: { label: 'Priority / Scope decision', icon: Flag, color: 'var(--violet)', bg: 'var(--violet-lighter)' },
};

/**
 * Decision severities. Page-local so High can read as orange (distinct from
 * Risk's red High treatment) via the shared StatusBadge (icon + label — never
 * color alone) using global tokens. Critical = red, High = orange, Medium =
 * amber, Low = teal.
 */
export const DECISION_SEVERITY = {
  critical: { label: 'Critical', color: 'var(--red)', bg: 'var(--red-lighter)', tone: 'error' },
  high: { label: 'High', color: 'var(--orange)', bg: 'var(--orange-lighter)', tone: 'error' },
  medium: { label: 'Medium', color: 'var(--amber)', bg: 'var(--amber-lighter)', tone: 'warning' },
  low: { label: 'Low', color: 'var(--teal)', bg: 'var(--teal-lighter)', tone: 'success' },
};

/** Compact type chip (icon + label) used across decision surfaces. */
export const DecisionTypeChip = ({ type, sx }) => {
  const meta = DECISION_TYPE_META[type] ?? DECISION_TYPE_META.staffing;
  const Icon = meta.icon;
  return (
    <Chip
      size="small"
      icon={<Icon sx={{ fontSize: 15 }} />}
      label={meta.label}
      sx={{
        height: 22,
        fontSize: 11.5,
        fontWeight: 600,
        borderRadius: 999,
        bgcolor: meta.bg,
        color: meta.color,
        border: `1px solid color-mix(in srgb, ${meta.color} 30%, transparent)`,
        '& .MuiChip-icon': { color: meta.color },
        ...sx,
      }}
    />
  );
};

export default DecisionTypeChip;