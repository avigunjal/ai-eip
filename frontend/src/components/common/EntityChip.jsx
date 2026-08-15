import { Chip } from '@mui/material';

/**
 * Small linked tag pointing to a project/system/team/person route.
 * `to` is a router path; optional `icon` and `color`.
 *
 * REMAINING (extend later):
 *  - avatar-leading variant for people/teams
 *  - onRemove (chip with a trailing close icon) for filter pills
 */
const EntityChip = ({ label, to, icon, color = 'primary', sx }) => (
  <Chip
    component={to ? 'a' : undefined}
    href={to}
    label={label}
    icon={icon}
    size="small"
    color={color}
    variant="outlined"
    clickable={!!to}
    sx={{ fontWeight: 600, textDecoration: 'none', ...sx }}
  />
);

export default EntityChip;
