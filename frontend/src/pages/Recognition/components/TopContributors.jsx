import { Avatar, Box, Button, Typography } from '@mui/material';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import Surface from '../../../components/styled/Surface.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';

/**
 * Recognition Highlights (spec section 12). Deliberately framed as "recognition
 * activity" — the backend never infers performance rankings, and this list
 * must not read like a leaderboard.
 */
const TopContributors = ({ contributors }) => (
  <Surface sx={{ p: 3 }}>
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Recognition Highlights</Typography>
        <Typography sx={{ fontSize: 13.5, color: 'text.secondary', mt: 0.25 }}>
          Recognition activity this period
        </Typography>
      </Box>
      <Button size="small" endIcon={<KeyboardArrowRight />} sx={{ textTransform: 'none', fontWeight: 600, flexShrink: 0 }}>
        View all
      </Button>
    </Box>

    {contributors.length === 0 ? (
      <EmptyState title="No recognition activity yet" />
    ) : (
      <Box sx={{ mt: 1 }}>
        {contributors.map((c) => (
          <Box
            key={c.person.id}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, borderBottom: '1px solid', borderBottomColor: 'divider', '&:last-of-type': { borderBottom: 0 } }}
          >
            <Typography
              sx={{
                width: 22,
                textAlign: 'center',
                fontWeight: 700,
                fontSize: 14,
                color: c.rank <= 3 ? 'var(--amber)' : 'text.disabled',
              }}
            >
              {c.rank}
            </Typography>
            <Avatar sx={{ width: 32, height: 32, flexShrink: 0, fontSize: 12, bgcolor: c.person.avatarColor }}>
              {c.person.initials}
            </Avatar>
            <Typography noWrap sx={{ flex: 1, minWidth: 0, fontWeight: 600, fontSize: 13.5 }}>
              {c.person.name}
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 12.5, flexShrink: 0 }}>
              {c.count} {c.count === 1 ? 'recognition' : 'recognitions'}
            </Typography>
          </Box>
        ))}
      </Box>
    )}
  </Surface>
);

export default TopContributors;