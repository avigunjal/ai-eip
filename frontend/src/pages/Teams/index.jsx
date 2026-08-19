import { Link } from 'react-router';
import { Box, Button, Chip, Grid, Typography } from '@mui/material';
import PageHeader from '../../components/common/PageHeader.jsx';
import MetricCard from '../../components/common/MetricCard.jsx';
import AvatarGroup from '../../components/common/AvatarGroup.jsx';
import { getProjects, getPeople } from '../../data/service.js';
import { fetchTeams } from '../../api/teams.js';
import { useData } from '../../hooks/useData.js';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import { useCountUpNumber } from '../../hooks/useCountUp.js';
import { slowPulse } from '../../config/animations.js';
import { SUSTAINABLE_CAPACITY } from '../../config/constants.js';
import { paths } from '../../config/paths.js';

/**
 * Animated capacity bar — counts up from 0 on mount and pulses softly when the
 * team is overloaded (replaces static LinearProgress).
 */
function TeamCapacityBar({ value, over }) {
  const display = useCountUpNumber(value);
  return (
    <>
      <Box
        sx={{
          flex: 1,
          height: 8,
          borderRadius: 4,
          bgcolor: 'action.hover',
          overflow: 'hidden',
          ...(over ? { animation: `${slowPulse} 3s ease-in-out infinite` } : {}),
        }}
      >
        <Box
          sx={{
            height: '100%',
            borderRadius: 4,
            bgcolor: over ? 'error.main' : value > 70 ? 'warning.main' : 'success.main',
            width: `${display}%`,
            transition: 'width 800ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </Box>
      <Typography sx={{ fontSize: 12, fontWeight: 700, color: over ? 'error.main' : 'text.secondary', whiteSpace: 'nowrap' }}>
        {over ? 'Overloaded' : `${Math.round(display)}%`}
      </Typography>
    </>
  );
}

/**
 * Teams — engineering health, capacity, composition, and risk exposure.
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
  const openRisks = teams.reduce((sum, t) => sum + (t.riskExposure ?? 0), 0);
  const avgHealth = teams.length
    ? Math.round(teams.reduce((sum, t) => sum + (t.healthScore ?? 0), 0) / teams.length)
    : 0;

  return (
    <Box>
      <PageHeader title="Teams" subtitle="Engineering health, capacity, risk exposure, and composition." />

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={6} sm={3}><MetricCard label="Teams" value={teams.length} /></Grid>
        <Grid item xs={6} sm={3}><MetricCard label="Avg health" value={avgHealth} /></Grid>
        <Grid item xs={6} sm={3}><MetricCard label="Overloaded" value={overloaded} detail={`Above ${SUSTAINABLE_CAPACITY}% sustainable load`} /></Grid>
        <Grid item xs={6} sm={3}><MetricCard label="Open critical/high risks" value={openRisks} /></Grid>
      </Grid>

      <Box
        sx={{
          mt: 3,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
          gridAutoRows: '1fr',
          gap: 3,
        }}
      >
        {teams.map((t) => {
          const members = t.memberIds.map((id) => people.find((p) => p.id === id)).filter(Boolean);
          const count = projects.filter((p) => p.teamIds.includes(t.id)).length;
          const over = t.capacityPct > SUSTAINABLE_CAPACITY;
          const health = t.healthScore ?? 0;
          const riskExposure = t.riskExposure ?? 0;
          return (
            <Box key={t.id} sx={{
              display: 'flex', flexDirection: 'column', gap: 1.5, p: 3, minWidth: 0,
              outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-card)',
              bgcolor: 'background.paper',
              '&:hover': { outlineColor: 'var(--primary)', boxShadow: 'var(--shadow-float)' },
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>{t.name}</Typography>
                <Chip
                  size="small"
                  variant="outlined"
                  label={`Health ${health}`}
                  color={health >= 70 ? 'success' : health >= 45 ? 'warning' : 'error'}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <TeamCapacityBar value={t.capacityPct} over={over} />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                  <AvatarGroup people={members} max={4} />
                  <Typography sx={{ fontSize: 12, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                    {members.length} members · {count} projects
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  variant="outlined"
                  label={`${riskExposure} open risk${riskExposure === 1 ? '' : 's'}`}
                  color={riskExposure > 0 ? 'warning' : 'default'}
                  sx={{ height: 20, flexShrink: 0, '& .MuiChip-label': { px: 1, fontSize: 11 } }}
                />
              </Box>

              <Button
                size="small"
                variant="outlined"
                component={Link}
                to={paths.team(t.id)}
                sx={{ alignSelf: 'flex-start', mt: 'auto', textTransform: 'none' }}
              >
                View Team Health
              </Button>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default Teams;
