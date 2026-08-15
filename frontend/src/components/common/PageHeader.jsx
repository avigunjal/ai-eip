import { Box, Typography } from '@mui/material';

/**
 * Consistent page header: title, optional subtitle, and right-aligned actions
 * (buttons / filters). Wraps responsively on narrow viewports.
 *
 * REMAINING (extend later):
 *  - sticky/scroll-aware header
 *  - optional `meta` slot (breadcrumb/context line above the title)
 *  - animated title reveal / description truncation with "show more"
 */
const PageHeader = ({ title, subtitle, actions, sx }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 2,
      flexWrap: 'wrap',
      ...sx,
    }}
  >
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="h3" component="h1" sx={{ fontSize: 28, lineHeight: '36px', fontWeight: 700 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ color: 'text.secondary', mt: 0.5 }}>{subtitle}</Typography>
      )}
    </Box>
    {actions && (
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>{actions}</Box>
    )}
  </Box>
);

export default PageHeader;
