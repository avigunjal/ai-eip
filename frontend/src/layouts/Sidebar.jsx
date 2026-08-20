import { Link as RouterLink, NavLink } from 'react-router';
import {
  Box,
  Drawer,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Typography,
  Avatar,
  Divider,
} from '@mui/material';
import HelpOutlineOutlined from '@mui/icons-material/HelpOutlineOutlined';
import Close from '@mui/icons-material/Close';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { sidebarLinks, workspace, iconMap } from '../routes/sitemap.js';
import { useUiStore } from '../store/uiStore.js';
import { SIDEBAR_WIDTH } from '../config/constants.js';
import AvatarMenu from '../components/ui/AvatarMenu.jsx';
import SparkleIcon from '../components/ui/SparkleIcon.jsx';

function SidebarContent({ onNavigate }) {
  return (
    <Box sx={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
      {/* Brand */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          height: 72,
          px: 2.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            placeItems: 'center',
            width: 32,
            height: 32,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--violet) 100%)',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.28)',
          }}
        >
          <SparkleIcon sx={{ fontSize: 18, color: '#FFFFFF' }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>
            AI-EIP
          </Typography>
          <Typography sx={{ fontSize: 10.5, color: 'text.secondary', lineHeight: 1.3, whiteSpace: 'nowrap' }}>
            Engineering Intelligence Platform
          </Typography>
        </Box>
        <IconButton
          onClick={onNavigate}
          aria-label="Close navigation"
          sx={{ ml: 'auto', display: { md: 'none' } }}
        >
          <Close fontSize="small" />
        </IconButton>
      </Box>

      {/* Nav */}
      <Box component="nav" sx={{ flex: 1, overflowY: 'auto', px: 1.5, py: 2 }}>
        {sidebarLinks.map((link) => {
          const Icon = iconMap[link.icon];
          return (
            <ListItemButton
              key={link.to}
              component={NavLink}
              to={link.to}
              end={link.exact}
              onClick={onNavigate}
              sx={{
                mb: 0.5,
                gap: 1.5,
                '& .MuiSvgIcon-root': { fontSize: 20 },
              }}
            >
              <ListItemIcon sx={{ minWidth: 0 }}>
                <Icon />
              </ListItemIcon>
              <ListItemText
                primary={link.name}
                primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
              />
              {typeof link.badge === 'number' && link.badge > 0 && (
                <Box
                  component="span"
                  sx={{
                    minWidth: 20,
                    px: 0.5,
                    py: 0.25,
                    borderRadius: 999,
                    bgcolor: 'error.main',
                    color: 'error.contrastText',
                    fontSize: 11,
                    fontWeight: 700,
                    textAlign: 'center',
                  }}
                >
                  {link.badge}
                </Box>
              )}
            </ListItemButton>
          );
        })}
      </Box>

      {/* Footer */}
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', p: 1.5 }}>
        <Tooltip title="Switch workspace" placement="top">
          <ListItemButton component={RouterLink} to="/" sx={{ gap: 1.5 }}>
            <Avatar sx={{ width: 30, height: 30, fontSize: 11, bgcolor: 'background.default', color: 'text.secondary' }}>
              {workspace.initials}
            </Avatar>
            <ListItemText
              primary={workspace.name}
              secondary="Workspace"
              primaryTypographyProps={{ fontSize: 13, fontWeight: 600, noWrap: true }}
              secondaryTypographyProps={{ fontSize: 11 }}
              sx={{ minWidth: 0 }}
            />
            <ExpandMore fontSize="small" sx={{ color: 'text.disabled' }} />
          </ListItemButton>
        </Tooltip>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
          <Tooltip title="Help">
            <IconButton aria-label="Help">
              <HelpOutlineOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <AvatarMenu />
        </Box>
      </Box>
    </Box>
  );
}

/**
 * Responsive sidebar: a permanent Drawer on desktop, a temporary slide-in
 * drawer on mobile (toggled from the top bar).
 */
const Sidebar = () => {
  const { mobileNavOpen, closeMobileNav } = useUiStore();

  return (
    <>
      {/* Desktop */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <SidebarContent />
      </Drawer>

      {/* Mobile */}
      <Drawer
        variant="temporary"
        open={mobileNavOpen}
        onClose={closeMobileNav}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH } }}
      >
        <SidebarContent onNavigate={closeMobileNav} />
      </Drawer>
    </>
  );
};

export default Sidebar;
