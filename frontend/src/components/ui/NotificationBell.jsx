import { useState } from 'react';
import { Badge, Box, Button, Divider, IconButton, Popover, Typography } from '@mui/material';
import NotificationsNone from '@mui/icons-material/NotificationsNone';
import { formatRelative } from '../../config/dates.js';

/**
 * Notification bell with unread badge and a popover listing notifications.
 * Uses local mock state for now.
 *
 * REMAINING (extend later):
 *  - wire to actionStore / a notifications store
 *  - "Mark all as read" + per-item read state
 *  - deep links (tap a notification → relevant route)
 *  - grouping + empty state
 */
const NotificationBell = () => {
  const [anchor, setAnchor] = useState(null);
  const [unread, setUnread] = useState(2);

  // TODO(mock): replace with real notifications store
  const items = [
    { id: 1, title: 'Atlas Platform Migration dropped to critical', meta: 'Risk alert' },
    { id: 2, title: 'Payments Engineering exceeds sustainable capacity', meta: 'Capacity' },
    { id: 3, title: 'Two engineers recognized for knowledge sharing', meta: 'Recognition' },
  ];

  return (
    <>
      <IconButton
        aria-label="Notifications"
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ color: 'var(--header-text)', mx: 0.5 }}
      >
        <Badge badgeContent={unread} color="error">
          <NotificationsNone />
        </Badge>
      </IconButton>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 320 } } }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 600 }}>Notifications</Typography>
          <Button size="small" onClick={() => setUnread(0)}>Mark all read</Button>
        </Box>
        <Divider />
        <Box sx={{ p: 1 }}>
          {items.map((n) => (
            <Box key={n.id} sx={{ px: 1, py: 1.5, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}>
              <Typography sx={{ fontSize: 14 }}>{n.title}</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{n.meta} · {formatRelative(Date.now())}</Typography>
            </Box>
          ))}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;
