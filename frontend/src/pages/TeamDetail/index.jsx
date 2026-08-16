import { Link, useParams } from 'react-router';
import { Box, Chip, Grid, LinearProgress, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import MetricCard from '../../components/common/MetricCard.jsx';
import AvatarGroup from '../../components/common/AvatarGroup.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import { useData } from '../../hooks/useData.js';
import { fetchTeam } from '../../api/teams.js';
import { getPeople, getProjectsForTeam } from '../../data/service.js';
import { SUSTAINABLE_CAPACITY } from '../../config/constants.js';
import { getProjectStatus } from '../../config/riskLabels.js';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { paths } from '../../config/paths.js';

/**
 * TeamDetail — allocation, skills coverage, delivery commitments, members.
 *
 * REMAINING (extend later):
 *  - tabs: Overview / Capacity / Skills / Projects / Members
 *  - skills coverage heatmap + gaps
 *  - project cards with delivery commitment details
 */
const TeamDetail = () => {
  const { teamId } = useParams();
  const { data: team, loading, error, retry } = useData(() => fetchTeam(teamId), [teamId]);
  const [tab, setTab] = useState(0);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={retry} />;
  if (!team) return <Typography>Team not found.</Typography>;

  const people = getPeople();
  const members = team.memberIds.map((id) => people.find((p) => p.id === id)).filter(Boolean);
  const projects = getProjectsForTeam(team.id);
  const over = team.capacityPct > SUSTAINABLE_CAPACITY;

  return (
    <Box>
      <PageHeader
        title={team.name}
        subtitle={`${members.length} members · ${projects.length} projects`}
        actions={<Chip label={over ? `Overloaded (${team.capacityPct}%)` : `Capacity ${team.capacityPct}%`} color={over ? 'error' : 'default'} variant="outlined" />}
      />

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={6} md={3}><MetricCard label="Capacity" value={`${team.capacityPct}%`} detail={`Sustainable: ${SUSTAINABLE_CAPACITY}%`} /></Grid>
        <Grid item xs={6} md={3}><MetricCard label="Health" value={team.healthScore} /></Grid>
        <Grid item xs={6} md={3}><MetricCard label="Members" value={members.length} /></Grid>
        <Grid item xs={6} md={3}><MetricCard label="Projects" value={projects.length} /></Grid>
      </Grid>

      <Box sx={{ mt: 3, p: 3, outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-card)', bgcolor: 'background.paper' }}>
        <Typography sx={{ fontWeight: 600 }}>Capacity vs sustainable load</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1.5 }}>
          <LinearProgress variant="determinate" value={team.capacityPct} sx={{ flex: 1, height: 10, borderRadius: 6, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: over ? 'error.main' : 'success.main' } }} />
          <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{team.capacityPct}%</Typography>
        </Box>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 1 }}>
          Sustainable-load marker: {SUSTAINABLE_CAPACITY}% — {over ? 'this team is above it.' : 'within limits.'}
        </Typography>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 3 }}>
        <Tab label="Members" />
        <Tab label="Projects" />
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {tab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {members.map((m) => (
              <Box key={m.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-card)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <AvatarGroup people={[m]} max={1} size={32} />
                  <Link to={paths.person(m.id)} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>{m.name}</Link>
                </Box>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{m.role}</Typography>
              </Box>
            ))}
          </Box>
        )}

        {tab === 1 && (
          <DataTable
            columns={[
              { key: 'name', label: 'Project', render: (r) => <Link to={paths.project(r.id)} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>{r.name}</Link> },
              { key: 'status', label: 'Status', render: (r) => <StatusBadge config={getProjectStatus(r.status)} /> },
              { key: 'healthScore', label: 'Health', sortable: true },
              { key: 'deliveryConfidence', label: 'Confidence', sortable: true },
            ]}
            rows={projects}
            emptyTitle="No projects"
            emptyDescription="This team has no active projects."
          />
        )}
      </Box>
    </Box>
  );
};

export default TeamDetail;
