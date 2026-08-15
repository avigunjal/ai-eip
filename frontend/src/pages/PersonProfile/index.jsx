import { Link, useParams } from 'react-router';
import { Box, Chip, Grid, Typography } from '@mui/material';
import PageHeader from '../../components/common/PageHeader.jsx';
import MetricCard from '../../components/common/MetricCard.jsx';
import AvatarGroup from '../../components/common/AvatarGroup.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import { useData } from '../../hooks/useData.js';
import { fetchPerson, getTeam, getRecognitions, getKnowledgeAreas } from '../../data/service.js';
import { paths } from '../../config/paths.js';
import { formatRelative } from '../../config/dates.js';

/**
 * PersonProfile — individual impact, expertise, and recognition context.
 *
 * REMAINING (extend later):
 *  - tabs: Impact / Expertise / Collaborations / Recognition
 *  - impact timeline chart
 *  - workload / allocation context from team capacity
 */
const PersonProfile = () => {
  const { personId } = useParams();
  const { data: person, loading, error, retry } = useData(() => fetchPerson(personId), [personId]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={retry} />;
  if (!person) return <Typography>Person not found.</Typography>;

  const team = getTeam(person.teamId);
  const areas = getKnowledgeAreas();
  const recognitions = getRecognitions().filter((r) => r.personId === person.id);

  const expertise = person.expertise.map((x) => ({
    ...x,
    area: areas.find((a) => a.id === x.knowledgeAreaId)?.name ?? 'Unknown',
  }));

  return (
    <Box>
      <PageHeader
        title={person.name}
        subtitle={`${person.role} · ${team?.name ?? 'No team'}`}
      />

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={6} md={3}><MetricCard label="Areas" value={expertise.length} /></Grid>
        <Grid item xs={6} md={3}><MetricCard label="Recognition" value={recognitions.length} /></Grid>
        <Grid item xs={6} md={3}>
          <Box sx={{ height: '100%', outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-card)', p: 3, bgcolor: 'background.paper' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>Team</Typography>
            <Link to={team ? paths.team(team.id) : '#'} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              {team?.name ?? '—'}
            </Link>
          </Box>
        </Grid>
        <Grid item xs={6} md={3}>
          <Box sx={{ height: '100%', outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-card)', p: 3, bgcolor: 'background.paper' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>Expertise</Typography>
            <Box sx={{ mt: 1 }}><AvatarGroup people={[person]} max={1} size={32} /></Box>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, p: 3, outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-card)', bgcolor: 'background.paper' }}>
        <Typography sx={{ fontWeight: 600 }}>Expertise areas</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
          {expertise.map((x) => (
            <Chip key={x.knowledgeAreaId} label={`${x.area} (${x.level})`} variant="outlined" component="a" href={paths.system(x.knowledgeAreaId)} clickable />
          ))}
        </Box>
      </Box>

      <Box sx={{ mt: 3, p: 3, outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-card)', bgcolor: 'background.paper' }}>
        <Typography sx={{ fontWeight: 600 }}>Recent recognition</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1.5 }}>
          {recognitions.length === 0 && <Typography sx={{ color: 'text.secondary' }}>No recognition yet.</Typography>}
          {recognitions.map((r) => (
            <Box key={r.id} sx={{ p: 2, outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-card)' }}>
              <Typography sx={{ fontSize: 14 }}>{r.summary}</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5 }}>{formatRelative(r.occurredAt)}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default PersonProfile;
