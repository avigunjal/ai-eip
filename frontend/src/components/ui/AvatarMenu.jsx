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
import { useAuthStore } from '../../store/authStore.js';

const FALLBACK_USER = { name: 'Alex Chen', role: 'Engineering Manager' };

const initialsOf = (name) =>
  String(name || '')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

/**
 * User avatar that opens a profile menu. Keyboard accessible: the avatar acts
 * as a button and the menu is focus-managed by MUI. Reflects the signed-in
 * user from the auth store; "Sign out" returns the app to the login gate.
 */
const AvatarMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const user = useAuthStore((s) => s.user) ?? FALLBACK_USER;
  const logout = useAuthStore((s) => s.logout);

  const handleKey = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setAnchorEl(event.currentTarget);
    }
  };

  const handleSignOut = () => {
    setAnchorEl(null);
    logout();
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
          bgcolor: 'var(--header-avatar-bg)',
          color: 'var(--header-avatar-text)',
          cursor: 'pointer',
          '&:focus-visible': { outline: '2px solid var(--primary)', outlineOffset: '2px' },
        }}
      >
        {initialsOf(user.name)}
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
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
          <ListItemText>Sign out</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default AvatarMenu;