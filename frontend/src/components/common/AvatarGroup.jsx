import { Avatar, AvatarGroup as MuiAvatarGroup, Tooltip } from '@mui/material';

/**
 * Stacked avatars with tooltips. Each `person` needs { id, name, initials, avatarColor }.
 * Overflow "+N" shows a summary tooltip of the remaining names (MUI default).
 *
 * REMAINING (extend later):
 *  - click avatar -> person profile route
 *  - status ring / online dot around avatars
 */
const AvatarGroup = ({ people = [], max = 4, size = 28, sx }) => (
  <MuiAvatarGroup
    max={max}
    sx={{
      '& .MuiAvatar-root': {
        width: size,
        height: size,
        fontSize: Math.round(size * 0.4),
        border: '2px solid',
        borderColor: 'background.paper',
        cursor: 'pointer',
      },
      ...sx,
    }}
  >
    {people.map((person) => (
      <Tooltip key={person.id} title={person.name}>
        <Avatar sx={{ bgcolor: person.avatarColor }}>{person.initials}</Avatar>
      </Tooltip>
    ))}
  </MuiAvatarGroup>
);

export default AvatarGroup;
