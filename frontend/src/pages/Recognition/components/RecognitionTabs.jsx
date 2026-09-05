import { Box, Tabs, Tab } from '@mui/material';
import { RECOGNITION_TABS } from '../data/awardLevels.js';

/**
 * Horizontal recognition navigation (spec section 5). Overview is the default;
 * each award tab is wired to a filtered award view.
 */
const RecognitionTabs = ({ value, onChange, sx }) => (
  <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', ...sx }}>
    <Tabs
      value={value}
      onChange={(_e, next) => onChange(next)}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      sx={{
        minHeight: 46,
        '& .MuiTabs-scrollButtons': { color: 'var(--text-muted)', width: 32 },
        '& .MuiTab-root': {
          minHeight: 46,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: 13.5,
          px: { xs: 2, sm: 2.5 },
        },
        '& .MuiTabs-indicator': { backgroundColor: 'var(--primary)', height: 3 },
      }}
    >
      {RECOGNITION_TABS.map((tab) => (
        <Tab key={tab.key} value={tab.key} label={tab.label} />
      ))}
    </Tabs>
  </Box>
);

export default RecognitionTabs;