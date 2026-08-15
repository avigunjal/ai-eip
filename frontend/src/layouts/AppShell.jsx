import { Outlet } from 'react-router';
import { Box } from '@mui/material';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import CommandPalette from '../components/ui/CommandPalette.jsx';
import { CONTENT_MAX_WIDTH, SIDEBAR_WIDTH, TOPBAR_HEIGHT } from '../config/constants.js';

/**
 * Persistent app shell (Aurora-inspired): fixed sidebar + fixed top bar with a
 * scrolling, max-width content region. Desktop uses a permanent rail; mobile
 * uses a temporary drawer opened from the top bar. The command palette is
 * mounted here (inside the router tree) so it can call useNavigate().
 */
const AppShell = () => (
  <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
    <Sidebar />
    <TopBar />
    <CommandPalette />
    <Box
      component="main"
      id="main-content"
      tabIndex={-1}
      sx={{
        pt: `${TOPBAR_HEIGHT + 24}px`,
        pl: { md: `${SIDEBAR_WIDTH + 32}px` },
        pr: { xs: 3, md: 4 },
        pb: 6,
        minWidth: 0,
        outline: 'none',
      }}
    >
      <Box sx={{ mx: 'auto', maxWidth: CONTENT_MAX_WIDTH, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Outlet />
      </Box>
    </Box>
  </Box>
);

export default AppShell;
