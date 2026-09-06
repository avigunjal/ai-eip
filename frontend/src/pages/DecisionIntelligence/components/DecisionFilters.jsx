import { Box, Tab, Tabs } from '@mui/material';
import { DECISION_CATEGORIES } from '../data/decisions.js';

/**
 * Decision category filter tabs (spec section 7). "All" is the default; counts
 * are derived from the source dataset and shown as plain muted text (the tab's
 * underline + dark text mark the selected state — no container/pill). Reuses
 * the MUI Tabs styling used across the app and is keyboard accessible.
 */
const DecisionFilters = ({ value, onChange, decisions, sx }) => {
  const tabs = [
    { key: 'all', label: 'All decisions' },
    ...DECISION_CATEGORIES,
  ];

  const counts = {
    all: decisions.length,
    ...Object.fromEntries(
      DECISION_CATEGORIES.map(({ key }) => [key, decisions.filter((d) => d.type === key).length]),
    ),
  };

  return (
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
        {tabs.map(({ key, label }) => (
          <Tab
            key={key}
            value={key}
            label={
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 0.5 }}>
                {label}
                <Box
                  component="span"
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: value === key ? 'var(--primary)' : 'var(--text-disabled)',
                  }}
                >
                  {counts[key]}
                </Box>
              </Box>
            }
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default DecisionFilters;