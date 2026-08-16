import { Link } from 'react-router';
import { Box, Grid, LinearProgress, Typography } from '@mui/material';
import PageHeader from '../../components/common/PageHeader.jsx';
import MetricCard from '../../components/common/MetricCard.jsx';
import AvatarGroup from '../../components/common/AvatarGroup.jsx';
import { getProjects, getPeople } from '../../data/service.js';
import { fetchTeams } from '../../api/teams.js';
import { useData } from '../../hooks/useData.js';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import { SUSTAINABLE_CAPACITY } from '../../config/constants.js';
import { paths } from '../../config/paths.js';

/**
 * Teams — cards with capacity vs sustainable-load, health, and membership.
 *
 * REMAINING (extend later):
 *  - capability heatmap (team × skill)
 *  - staffing recommendations for overloaded teams
 *  - toggle between card and table views
 */
const Teams = () => {
  const { data: teams = [], loading, error, retry } = useData(fetchTeams);
  const projects = getProjects();
  const people = getPeople();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={retry} />;

  const overloaded = teams.filter((t) => t.capacityPct > SUSTAINABLE_CAPACITY).length;

  return (
    <Box>
      <PageHeader title="Teams" subtitle="Team health, capacity, composition, and staffing needs." />

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={6} sm={4}><MetricCard label="Teams" value={teams.length} /></Grid>
        <Grid item xs={6} sm={4}><MetricCard label="Overloaded" value={overloaded} detail={`Above ${SUSTAINABLE_CAPACITY}% sustainable load`} /></Grid>
        <Grid item xs={12} sm={4}><MetricCard label="Engineers" value={people.length} /></Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        {teams.map((t) => {
          const members = t.memberIds.map((id) => people.find((p) => p.id === id)).filter(Boolean);
          const count = projects.filter((p) => p.teamIds.includes(t.id)).length;
          const over = t.capacityPct > SUSTAINABLE_CAPACITY;
          return (
            <Grid item key={t.id} xs={12} sm={6} lg={4}>
              <Box component={Link} to={paths.team(t.id)} sx={{
                display: 'flex', flexDirection: 'column', gap: 1.5, p: 3,
                outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-card)',
                bgcolor: 'background.paper', textDecoration: 'none', color: 'inherit',
                '&:hover': { outlineColor: 'var(--primary)', boxShadow: 'var(--shadow-float)' },
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>{t.name}</Typography>
                  <Typography sx={{ fontSize: 12, color: over ? 'error.main' : 'text.secondary', fontWeight: 600 }}>
                    {over ? 'Overloaded' : `${t.capacityPct}%`}
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={t.capacityPct}
                  sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: over ? 'error.main' : t.capacityPct > 70 ? 'warning.main' : 'success.main' } }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <AvatarGroup people={members} max={4} />
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {members.length} members · {count} projects
                  </Typography>
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default Teams;
