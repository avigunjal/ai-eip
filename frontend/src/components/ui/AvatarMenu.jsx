import { useState } from 'react';
import { Link } from 'react-router';
import {
  Avatar,
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import Person from '@mui/icons-material/Person';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';

const user = { name: 'Alex Chen', role: 'Engineering Manager', initials: 'AC', color: '#2563EB' };

/**
 * User avatar that opens a profile menu. Keyboard accessible: the avatar acts
 * as a button and the menu is focus-managed by MUI.
 */
const AvatarMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleKey = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setAnchorEl(event.currentTarget);
    }
  };

  return (
    <>
      <Avatar
        onClick={(e) => setAnchorEl(e.currentTarget)}
        onKeyDown={handleKey}
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.name}`}
        sx={{
          width: 32,
          height: 32,
          fontSize: 13,
          bgcolor: user.color,
          cursor: 'pointer',
          '&:focus-visible': { outline: '2px solid var(--primary)', outlineOffset: '2px' },
        }}
      >
        {user.initials}
      </Avatar>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{user.name}</Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{user.role}</Typography>
        </Box>
        <Divider />
        <MenuItem component={Link} to="/people/p-01" onClick={() => setAnchorEl(null)}>
          <ListItemIcon><Person fontSize="small" /></ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem component={Link} to="/settings" onClick={() => setAnchorEl(null)}>
          <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
          <ListItemText>Sign out</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default AvatarMenu;
