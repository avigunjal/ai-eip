import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  Box,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Person from '@mui/icons-material/Person';
import AccountTree from '@mui/icons-material/AccountTree';
import MenuBook from '@mui/icons-material/MenuBook';
import WarningAmber from '@mui/icons-material/WarningAmber';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import PageHeader from '../../components/common/PageHeader.jsx';
import Surface from '../../components/styled/Surface.jsx';
import MetricCard from '../../components/common/MetricCard.jsx';
import AvatarGroup from '../../components/common/AvatarGroup.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { getProjects, getTeams, getPeople, getKnowledgeAreas, getRisksForProject } from '../../data/service.js';
import { paths } from '../../config/paths.js';

/**
 * AI Composer — composes an engineering team for a selected project using the
 * full engineering relationship graph: Projects → Teams → People → Skills →
 * Knowledge → Risk. Every recommendation is explainable ("Why this team?").
 *
 * REMAINING (extend later):
 *  - drag/drop people between draft / confirmed slots
 *  - persisted composition drafts (Zustand)
 *  - generative "compose for a new goal" free-text entry
 */
const Composer = () => {
  const [projectId, setProjectId] = useState(getProjects()[0].id);
  const projects = getProjects();
  const teams = getTeams();
  const people = getPeople();
  const areas = getKnowledgeAreas();

  const project = projects.find((p) => p.id === projectId) ?? projects[0];
  const team = teams.find((t) => t.id === project.teamIds[0]) ?? teams[0];
  const members = team.memberIds.map((id) => people.find((p) => p.id === id)).filter(Boolean);
  const risks = getRisksForProject(project.id);
  const projectAreas = areas.filter((a) => a.linkedProjectIds.includes(project.id));

  const composition = useMemo(() => {
    const ranked = [...members].sort((a, b) => {
      const score = (person) =>
        person.expertise.filter((x) => projectAreas.some((a) => a.id === x.knowledgeAreaId && x.level === 'primary')).length;
      return score(b) - score(a);
    });
    return ranked;
  }, [members, projectAreas]);

  const primarySkillCoverage = useMemo(() => {
    let covered = 0;
    projectAreas.forEach((a) => {
      const hasPrimary = composition.some((p) =>
        p.expertise.some((x) => x.knowledgeAreaId === a.id && x.level === 'primary'),
      );
      if (hasPrimary) covered += 1;
    });
    return projectAreas.length ? Math.round((covered / projectAreas.length) * 100) : 0;
  }, [projectAreas, composition]);

  const singleOwnerAreas = projectAreas.filter((a) => a.expertIds.length <= 1);
  const riskExposure = risks.filter((r) => r.severity === 'critical' || r.severity === 'high').length;

  const rationale = useMemo(() => {
    const points = [];
    if (primarySkillCoverage >= 70) {
      points.push(`Covers ${primarySkillCoverage}% of the project's primary skill areas.`);
    } else {
      points.push(`Only ${primarySkillCoverage}% of primary skill areas have an expert on the team.`);
    }
    if (singleOwnerAreas.length) {
      points.push(`${singleOwnerAreas.length} single-owner system${singleOwnerAreas.length > 1 ? 's' : ''} increase bus-factor risk.`);
    }
    if (riskExposure) {
      points.push(`${riskExposure} open critical/high risk${riskExposure > 1 ? 's' : ''} affect this project.`);
    }
    return points;
  }, [primarySkillCoverage, singleOwnerAreas.length, riskExposure]);

  const aiAssessment =
    riskExposure === 0 && primarySkillCoverage >= 70
      ? 'Well-positioned'
      : primarySkillCoverage < 50 || riskExposure >= 3
        ? 'High Risk'
        : 'Needs attention';

  const assessmentConfig =
    aiAssessment === 'Well-positioned'
      ? { label: 'Well-positioned', color: 'var(--teal)', bg: 'var(--teal-lighter)' }
      : aiAssessment === 'High Risk'
        ? { label: 'High Risk', color: 'var(--red)', bg: 'var(--red-lighter)' }
        : { label: 'Needs attention', color: 'var(--amber)', bg: 'var(--amber-lighter)' };

  return (
    <Box>
      <PageHeader
        title="AI Composer"
        subtitle="Compose the right engineering team for the work ahead, backed by your relationship graph."
        actions={
          <Chip
            icon={<AutoAwesome />}
            label="AI-generated recommendation"
            sx={{ bgcolor: 'var(--violet-lighter)', color: 'var(--violet)', fontWeight: 600 }}
          />
        }
      />

      {/* Target selector */}
      <Surface sx={{ p: 3, mt: 3 }}>
        <TextField
          select
          label="Target project"
          value={project.id}
          onChange={(e) => setProjectId(e.target.value)}
          sx={{ maxWidth: 420 }}
        >
          {projects.map((p) => (
            <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
          ))}
        </TextField>
      </Surface>

      <Grid container spacing={3} sx={{ mt: 0 }}>
        <Grid item xs={6} sm={3}>
          <MetricCard label="Team capacity" value={`${team.capacityPct}%`} icon={<AccountTree color="info" />} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <MetricCard label="Skill coverage" value={`${primarySkillCoverage}%`} icon={<MenuBook color="secondary" />} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <MetricCard label="Open risk" value={riskExposure} icon={<WarningAmber color="warning" />} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <MetricCard label="Single-owner" value={singleOwnerAreas.length} icon={<Person color="primary" />} />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 0 }}>
        {/* Recommended composition */}
        <Grid item xs={12} lg={7}>
          <Surface sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography sx={{ fontWeight: 600 }}>Recommended composition</Typography>
              <Chip size="small" label={`${team.name} · ${composition.length} people`} variant="outlined" />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {composition.map((p) => {
                const matchCount = p.expertise.filter((x) => projectAreas.some((a) => a.id === x.knowledgeAreaId)).length;
                return (
                  <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-control)' }}>
                    <AvatarGroup people={[p]} max={1} size={32} />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Link to={paths.person(p.id)} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                        {p.name}
                      </Link>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{p.role}</Typography>
                    </Box>
                    <Tooltip title={`${matchCount} matching skill${matchCount === 1 ? '' : 's'} for this project`}>
                      <Chip size="small" label={`${matchCount} skills`} variant="outlined" />
                    </Tooltip>
                  </Box>
                );
              })}
            </Box>
          </Surface>
        </Grid>

        {/* Rationale */}
        <Grid item xs={12} lg={5}>
          <Surface sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AutoAwesome color="secondary" />
              <Typography sx={{ fontWeight: 600 }}>Why this team?</Typography>
            </Box>

            <Typography sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary', mt: 1 }}>
              Evidence
            </Typography>
            <List dense disablePadding>
              {rationale.map((r) => (
                <ListItem key={r} disableGutters sx={{ py: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 22 }}><Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} /></ListItemIcon>
                  <ListItemText primary={r} primaryTypographyProps={{ fontSize: 13, color: 'text.secondary' }} />
                </ListItem>
              ))}
            </List>

            <Typography sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary', mt: 1.5 }}>
              Reasoning
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5 }}>
              People were ranked by primary expertise across the systems this project depends on; teams inherit the capacity, skills, and risk of the engineers and systems they touch.
            </Typography>

            <Typography sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary', mt: 1.5 }}>
              Impact
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5 }}>
              {projectAreas.length} systems in scope, {singleOwnerAreas.length} with a single owner, {riskExposure} open high/critical risk. Missing coverage means slower delivery and higher bus-factor.
            </Typography>

            <Box sx={{ mt: 'auto', pt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary' }}>
                AI assessment
              </Typography>
              <StatusBadge config={assessmentConfig} />
            </Box>

            <Typography sx={{ fontSize: 12, color: 'text.disabled', mt: 1 }}>
              Confidence 84% · 4 evidence sources
            </Typography>
          </Surface>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Composer;
