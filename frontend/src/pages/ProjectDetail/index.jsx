import { Link, useParams } from 'react-router';
import { Box, Button, Chip, Grid, Tab, Tabs, Typography } from '@mui/material';
import StarBorder from '@mui/icons-material/StarBorder';
import Star from '@mui/icons-material/Star';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import MetricCard from '../../components/common/MetricCard.jsx';
import AvatarGroup from '../../components/common/AvatarGroup.jsx';
import ChartCard from '../../components/ui/ChartCard.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import { useData } from '../../hooks/useData.js';
import { useToast } from '../../hooks/useToast.js';
import { useActionStore } from '../../store/actionStore.js';
import { fetchProject, getTeam, getRisksForProject, peopleForProject } from '../../data/service.js';
import { knowledgeAreas } from '../../data/fixtures.js';
import { getProjectStatus, getSeverity } from '../../config/riskLabels.js';
import { paths } from '../../config/paths.js';
import { formatDate } from '../../config/dates.js';
import { useState } from 'react';

/**
 * ProjectDetail — header with status/owners/watch, KPI row, and tabs.
 *
 * REMAINING (extend later):
 *  - annotated health trend with milestone markers
 *  - tabs: Overview / Risks / Dependencies / Team / Activity
 *  - milestone timeline + prevention checklist
 *  - risk drivers list
 */
const ProjectDetail = () => {
  const { projectId } = useParams();
  const { data: project, loading, error, retry } = useData(() => fetchProject(projectId), [projectId]);
  const [tab, setTab] = useState(0);
  const { isWatched, toggleWatch } = useActionStore();
  const toast = useToast();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={retry} />;
  if (!project) return <Typography>Project not found.</Typography>;

  const team = getTeam(project.teamIds[0]);
  const risks = getRisksForProject(project.id);
  const people = peopleForProject(project);

  return (
    <Box>
      <PageHeader
        title={project.name}
        subtitle={`${team?.name ?? 'No team'} · Target ${formatDate(project.targetDate)}`}
        actions={
          <>
            <StatusBadge config={getProjectStatus(project.status)} />
            <Button
              variant="outlined"
              startIcon={isWatched(project.id) ? <Star /> : <StarBorder />}
              onClick={() => {
                toggleWatch(project.id);
                toast(isWatched(project.id) ? 'Project unwatched' : 'Project watched', {
                  actionLabel: 'Undo',
                  action: () => toggleWatch(project.id),
                });
              }}
            >
              {isWatched(project.id) ? 'Watching' : 'Watch'}
            </Button>
          </>
        }
      />

      {/* KPI row */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={6} md={3}><MetricCard label="Health" value={project.healthScore} /></Grid>
        <Grid item xs={6} md={3}><MetricCard label="Delivery confidence" value={`${project.deliveryConfidence}%`} /></Grid>
        <Grid item xs={6} md={3}><MetricCard label="Open risks" value={risks.length} /></Grid>
        <Grid item xs={6} md={3}>
          <Box sx={{ height: '100%', outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-card)', p: 3, bgcolor: 'background.paper' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>Owners</Typography>
            <Box sx={{ mt: 1.5 }}><AvatarGroup people={people} max={4} /></Box>
          </Box>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ mt: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Overview" />
          <Tab label="Risks" />
          <Tab label="Activity" />
        </Tabs>

        <Box sx={{ mt: 2 }}>
          {tab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <ChartCard
                title="Health trend"
                data={project.trend}
                dataColumns={[{ key: 'date', label: 'Week' }, { key: 'score', label: 'Score' }]}
              >
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={project.trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" fontSize={12} stroke="var(--text-muted)" />
                    <YAxis fontSize={12} stroke="var(--text-muted)" domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <Box sx={{ p: 3, outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-card)', bgcolor: 'background.paper' }}>
                <Typography sx={{ fontWeight: 600 }}>Top driver</Typography>
                <Typography sx={{ color: 'text.secondary', mt: 0.5 }}>{project.topDriver}</Typography>
              </Box>
            </Box>
          )}

          {tab === 1 && (
            <DataTable
              columns={[
                { key: 'title', label: 'Risk', render: (r) => <Link to={paths.risks} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>{r.title}</Link> },
                { key: 'severity', label: 'Severity', render: (r) => <StatusBadge config={getSeverity(r.severity)} /> },
                { key: 'confidence', label: 'Confidence', sortable: true },
                { key: 'trend', label: 'Trend' },
              ]}
              rows={risks}
              emptyTitle="No open risks"
              emptyDescription="This project has no tracked risks."
            />
          )}

          {tab === 2 && (
            <Typography sx={{ color: 'text.secondary' }}>
              Activity timeline coming here. {/* REMAINING: recent commits/PRs/deploys feed */}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Related areas */}
      <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Linked systems:</Typography>
        {knowledgeAreas.filter((a) => a.linkedProjectIds.includes(project.id)).map((a) => (
          <Chip key={a.id} component="a" href={paths.system(a.id)} label={a.name} variant="outlined" size="small" clickable />
        ))}
      </Box>
    </Box>
  );
};

export default ProjectDetail;
