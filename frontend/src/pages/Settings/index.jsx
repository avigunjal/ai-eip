import { Box, Chip, Grid, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';

/**
 * Settings — data sources, score config, notifications, workspace.
 *
 * REMAINING (extend later):
 *  - Data sources: connect/disconnect mock integration cards with status
 *  - Score config: sliders for health/risk scoring weights
 *  - Notifications: toggle switches per channel
 *  - Workspace: member list + roles + invite
 */
const Settings = () => {
  const [tab, setTab] = useState(0);

  const sections = [
    {
      title: 'Data sources',
      body: 'Connect the engineering tools that feed the platform — GitHub, Jira, Datadog, PagerDuty.',
      hints: ['Integration cards with Connected / Needs auth status', 'Last sync + error handling per source'],
    },
    {
      title: 'Score configuration',
      body: 'Tune how engineering health and risk scores are weighted.',
      hints: ['Health / risk scoring sliders', 'Thresholds for severity bands'],
    },
    {
      title: 'Notifications',
      body: 'Choose what the platform surfaces and how you’re alerted.',
      hints: ['Channel toggles (in-app, email, Slack)', 'Digest frequency'],
    },
    {
      title: 'Workspace',
      body: 'Manage members and their access roles.',
      hints: ['Member list + role assignment', 'Invite flow'],
    },
  ];
  const section = sections[tab];

  return (
    <Box>
      <PageHeader title="Settings" subtitle="Data sources, scoring preferences, notifications, workspace members." />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 3 }}>
        {sections.map((s) => <Tab key={s.title} label={s.title} />)}
      </Tabs>

      <Box sx={{ mt: 3, p: 3, outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-card)', bgcolor: 'background.paper' }}>
        <Typography sx={{ fontWeight: 600, fontSize: 18 }}>{section.title}</Typography>
        <Typography sx={{ color: 'text.secondary', mt: 1, maxWidth: 560 }}>{section.body}</Typography>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          {section.hints.map((h) => (
            <Grid item key={h} xs={12} sm={6}>
              <Box sx={{ p: 2, outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-control)', minHeight: 72 }}>
                <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>{h}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Chip label="Planned" size="small" variant="outlined" sx={{ mt: 2 }} />
      </Box>
    </Box>
  );
};

export default Settings;
