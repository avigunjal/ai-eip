import { useEffect } from 'react';
import { Link, useLocation, useMatches } from 'react-router';
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Typography,
  Breadcrumbs,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { useUiStore } from '../store/uiStore.js';
import { paths } from '../config/paths.js';
import { pageTitles } from '../routes/sitemap.js';
import { DEFAULT_DATE_RANGE, TOPBAR_HEIGHT, SIDEBAR_WIDTH } from '../config/constants.js';
import AvatarMenu from '../components/ui/AvatarMenu.jsx';
import NotificationBell from '../components/ui/NotificationBell.jsx';
import DateRangePicker from '../components/ui/DateRangePicker.jsx';
import { useUrlFilters } from '../hooks/useUrlFilters.js';

/**
 * Fixed top bar: breadcrumb (desktop) and contextual actions (date range,
 * notifications, avatar). Stays visually stable while page content scrolls
 * independently.
 *
 * The page title is resolved from the matched route's `handle.title` (set in
 * router.jsx), so the browser tab + breadcrumb stay in sync on navigation.
 */
const TopBar = () => {
  const { toggleMobileNav } = useUiStore();
  const { pathname } = useLocation();
  const { values, set } = useUrlFilters(['range']);

  // Route-aware title: resolve from the sitemap (exact match first), then the
  // deepest matched route's handle.title as a fallback (e.g. detail pages).
  const matchedTitle = useMatches().reduce((_, m) => m.handle?.title ?? _, null);
  const pageTitle = pageTitles[pathname] ?? matchedTitle ?? 'Engineering Overview';

  useEffect(() => {
    document.title = `AI-EIP — ${pageTitle}`;
  }, [pageTitle]);

  const segments = pathname.split('/').filter(Boolean);
  const isOverview = pathname === paths.root;

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
        ml: { md: `${SIDEBAR_WIDTH}px` },
        height: TOPBAR_HEIGHT,
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ px: { xs: 1.5, sm: 2.5, md: 4 }, gap: 1 }}>
        <IconButton onClick={toggleMobileNav} aria-label="Open navigation" sx={{ display: { md: 'none' } }}>
          <MenuIcon />
        </IconButton>

        {/* Breadcrumb */}
        <Breadcrumbs
          aria-label="breadcrumb"
          separator={<ChevronRight fontSize="small" />}
          sx={{ display: { xs: 'none', md: 'block' }, flexShrink: 0 }}
        >
          <Typography
            component={Link}
            to={paths.root}
            sx={{ fontSize: 14, color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
          >
            AI-EIP
          </Typography>
          {!isOverview && segments.length > 0 && (
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }}>
              {pageTitle}
            </Typography>
          )}
        </Breadcrumbs>

        <Typography
          sx={{ fontSize: 14, fontWeight: 600, display: { md: 'none' }, flexShrink: 0, whiteSpace: 'nowrap' }}
        >
          {pageTitle}
        </Typography>

        {/* Right actions */}
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
          <DateRangePicker value={values.range || DEFAULT_DATE_RANGE} onChange={(key) => set('range', key)} />
          <NotificationBell />
          <AvatarMenu />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
