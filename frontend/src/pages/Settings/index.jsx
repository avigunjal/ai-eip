import { Box, Button, Chip, Grid, LinearProgress, Switch, Tab, Tabs, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import { fetchAiSettings, updateAiSettings } from '../../api/ai.js';
import { useAiStore } from '../../store/aiStore.js';
import { useToast } from '../../hooks/useToast.js';

/**
 * Settings — data sources, score config, notifications, workspace, AI.
 *
 * REMAINING (extend later):
 *  - Data sources: connect/disconnect mock integration cards with status
 *  - Score config: sliders for health/risk scoring weights
 *  - Notifications: toggle switches per channel
 *  - Workspace: member list + roles + invite
 */

/**
 * Runtime AI toggle. Backed by GET/PATCH /api/ai/settings — an in-memory
 * backend setting seeded from AI_ENABLED at startup. Toggling never writes to
 * .env and never exposes API keys; provider/model are shown read-only.
 */
const AiSettingsSection = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [updating, setUpdating] = useState(false);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      setSettings(await fetchAiSettings());
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggle = async () => {
    const next = !settings.enabled;
    setUpdating(true);
    setSettings((prev) => ({ ...prev, enabled: next })); // optimistic
    useAiStore.getState().setAiSettings({ ...settings, enabled: next }); // keep global AI state in sync
    try {
      const confirmed = await updateAiSettings({ enabled: next }); // confirmed
      setSettings(confirmed);
      useAiStore.getState().setAiSettings(confirmed);
      toast(next ? 'AI enabled' : 'AI disabled');
    } catch {
      setSettings((prev) => ({ ...prev, enabled: !next })); // revert
      useAiStore.getState().setAiSettings({ ...settings, enabled: !next });
      toast(`Couldn't update AI settings`, { severity: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Box>
      <Typography sx={{ color: 'text.secondary', mt: 1, maxWidth: 560 }}>
        AI is an optional reasoning layer for the existing intelligence — never the source of truth.
        Turning it off keeps every page fully deterministic and offline.
      </Typography>

      {loading ? (
        <LinearProgress sx={{ mt: 3 }} />
      ) : loadError ? (
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ color: 'var(--red)' }}>Couldn't load the AI settings.</Typography>
          <Button size="small" sx={{ mt: 1 }} onClick={load}>Retry</Button>
        </Box>
      ) : (
        settings && (
          <>
            <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Switch checked={settings.enabled} disabled={updating} onChange={handleToggle} />
                <Chip
                  size="small"
                  variant="outlined"
                  sx={{
                    color: settings.enabled ? 'var(--violet)' : 'text.secondary',
                    borderColor: settings.enabled ? 'var(--violet)' : 'divider',
                    fontWeight: 600,
                  }}
                  label={settings.enabled ? '● AI Enabled' : '○ AI Disabled'}
                />
              </Box>
              <Typography sx={{ color: 'text.secondary', maxWidth: 420, fontSize: 14 }}>
                {settings.enabled
                  ? 'AI-powered reasoning and explanations are active.'
                  : 'Using deterministic engineering intelligence only.'}
              </Typography>
            </Box>

            <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip size="small" variant="outlined" label={`Provider · ${settings.provider}`} />
              <Chip size="small" variant="outlined" label={`Model · ${settings.model}`} />
            </Box>
          </>
        )
      )}
    </Box>
  );
};

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
    { title: 'AI', render: <AiSettingsSection /> },
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

        {section.render ? (
          section.render
        ) : (
          <>
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
          </>
        )}
      </Box>
    </Box>
  );
};

export default Settings;