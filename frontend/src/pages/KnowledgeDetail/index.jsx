import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, TextField, Typography } from '@mui/material';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import MetricCard from '../../components/common/MetricCard.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import { useData } from '../../hooks/useData.js';
import { useToast } from '../../hooks/useToast.js';
import { getPeople, getProject, areaHierarchy } from '../../data/service.js';
import { fetchKnowledgeArea, fetchTransferPlans } from '../../api/knowledge.js';
import { coverageStatus, getRiskLevel } from '../../config/riskLabels.js';
import { paths } from '../../config/paths.js';
import { formatRelative } from '../../config/dates.js';

const LEVEL_LABEL = { primary: 'Primary', capable: 'Capable', learning: 'Learning', unverified: 'Unverified' };
const LEVEL_COLOR = { primary: 'var(--primary)', capable: 'var(--teal)', learning: 'var(--amber)', unverified: 'var(--text-muted)' };

const SOURCE_LABEL = { github: 'GitHub', jira: 'Jira', docs: 'Docs', incident: 'Incident', pagerduty: 'PagerDuty' };

const KnowledgeDetail = () => {
  const { systemId } = useParams();
  const { data: area, loading, error, retry } = useData(() => fetchKnowledgeArea(systemId), [systemId]);
  const { data: plans = [] } = useData(fetchTransferPlans, []);
  const toast = useToast();
  const [planOpen, setPlanOpen] = useState(false);
  const [planForm, setPlanForm] = useState({ backupOwnerId: '', sessions: 2, dueDate: '' });

  if (loading) return <LoadingState variant="card" />;
  if (error) return <ErrorState onRetry={retry} />;
  if (!area) return <Typography>System not found.</Typography>;

  const people = getPeople();
  const projects = area.linkedProjectIds.map((id) => getProject(id)).filter(Boolean);
  const groups = { primary: [], capable: [], learning: [], unverified: [] };
  (area.expertise ?? []).forEach((x) => (groups[x.level] ?? groups.learning).push(x));
  const transferPlan = plans?.find((p) => p.areaId === area.id) ?? null;
  const chain = areaHierarchy(area.id);

  const submitPlan = () => {
    setPlanOpen(false);
    toast('Transfer plan started', {
      actionLabel: 'Undo',
      action: () => setPlanOpen(true),
    });
  };

  return (
    <Box>
      <PageHeader
        title={area.name}
        subtitle={
          <span>
            <Typography component="span" sx={{ fontWeight: 600 }}>{chain[0]?.clientName ?? 'Client'}</Typography>
            {' / '}
            <Link to={paths.project(chain[0]?.projectId ?? '')} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{chain[0]?.projectName ?? 'Project'}</Link>
            {' / '}{chain[0]?.areaName ?? area.name}
          </span>
        }
        actions={<StatusBadge config={getRiskLevel(area.riskLevel)} />}
      />

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={6} md={3}><MetricCard label="Knowledge risk" value={`${area.riskScore}/100`} help="Criticality × concentration × availability × documentation gap." /></Grid>
        <Grid item xs={6} md={3}><MetricCard label="Coverage" value={`${area.coverage}%`} /></Grid>
        <Grid item xs={6} md={3}><MetricCard label="Criticality" value={`${area.criticalityScore}/100`} /></Grid>
        <Grid item xs={6} md={3}><MetricCard label="Docs freshness" value={`${area.documentationFreshnessDays}d`} /></Grid>
      </Grid>

      {/* Risk summary */}
      <Box sx={{ mt: 3, p: 3, outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-card)', bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Risk summary</Typography>
          {area.riskLevel === 'critical' || area.riskLevel === 'high' ? (
            <Button variant="contained" onClick={() => setPlanOpen(true)}>Start transfer plan</Button>
          ) : (
            <StatusBadge config={coverageStatus(area.coverage)} />
          )}
        </Box>
        <Typography sx={{ mt: 1.5, maxWidth: 720 }}>
          {area.name} is a {area.riskLevel === 'critical' ? 'critical single-expert dependency' : 'concentrated-knowledge area'}. The dominant expert holds {area.dominantExpertShare}% of recent contribution and incident-resolution knowledge{area.expertise.some((x) => x.level === 'capable') ? '' : '; no confirmed backup can independently support the service'}.
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 13, color: 'text.secondary' }}>
          Confidence 87% · Evidence {area.evidence?.length ?? 0} signals · Last assessed recently
        </Typography>
        {projects.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
            {projects.map((p) => (
              <Chip key={p.id} component="a" href={paths.project(p.id)} label={p.name} variant="outlined" clickable size="small" />
            ))}
          </Box>
        )}
      </Box>

      {/* Why flagged */}
      <Box sx={{ mt: 3, p: 3, outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-card)', bgcolor: 'background.paper' }}>
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Why flagged</Typography>
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>Scoring inputs and the evidence timeline behind this assessment.</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, gap: 1.5, mb: 2 }}>
          {[
            ['Criticality', `${area.criticalityScore}/100`],
            ['Concentration', `${area.dominantExpertShare}%`],
            ['Coverage', `${area.coverage}%`],
            ['Docs gap', `${area.documentationFreshnessDays}d`],
          ].map(([k, v]) => (
            <Box key={k} sx={{ p: 1.5, outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-control)' }}>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{k}</Typography>
              <Typography sx={{ fontWeight: 700 }}>{v}</Typography>
            </Box>
          ))}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {(area.evidence ?? []).map((ev) => (
            <Box key={ev.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 1.5, outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-control)' }}>
              <Chip size="small" label={SOURCE_LABEL[ev.source] ?? ev.source} variant="outlined" sx={{ flexShrink: 0 }} />
              <Box>
                <Typography sx={{ fontSize: 14 }}>{ev.statement}</Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{formatRelative(ev.occurredAt)}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Expertise coverage */}
      <Box sx={{ mt: 3, p: 3, outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-card)', bgcolor: 'background.paper' }}>
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Expertise coverage</Typography>
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>Observed coverage and recency only — not an ability ranking.</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
          {(['primary', 'capable', 'learning', 'unverified']).map((level) => {
            const members = groups[level] ?? [];
            return (
              <Box key={level} sx={{ p: 1.5, outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-control)' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: LEVEL_COLOR[level] }}>{LEVEL_LABEL[level]}</Typography>
                {members.length === 0 && <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5 }}>None identified.</Typography>}
                {members.map((m) => (
                  <Box key={m.personId} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Link to={paths.person(m.personId)} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                      {m.name ?? 'Unknown'}
                    </Link>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{m.share}% · {formatRelative(m.lastContributionAt)}</Typography>
                  </Box>
                ))}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Mitigation plan */}
      {transferPlan && (
        <Box sx={{ mt: 3, p: 3, outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-card)', bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Mitigation plan</Typography>
            <Chip size="small" label={`Target ${transferPlan.fromCoverage}% → ${transferPlan.targetCoverage}% coverage`} variant="outlined" />
          </Box>
          <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>Time-bound actions to improve coverage.</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {transferPlan.actions.map((a) => {
              const owner = people.find((p) => p.id === a.ownerId);
              return (
                <Box key={a.id} sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, p: 1.5, outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-control)' }}>
                  <Box sx={{ flex: '1 1 220px', minWidth: 0 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{a.title}</Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{a.expectedOutcome}</Typography>
                  </Box>
                  <Chip size="small" variant="outlined" label={owner?.name ?? '—'} />
                  <Chip size="small" variant="outlined" label={a.status.replace('_', ' ')} />
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Start transfer plan modal */}
      <Dialog open={planOpen} onClose={() => setPlanOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Start transfer plan</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              Build a knowledge-transfer plan to raise coverage for {area.name} from {area.coverage}% toward {Math.min(90, area.coverage + 27)}%.
            </Typography>
            <TextField
              select
              label="Backup owner"
              value={planForm.backupOwnerId}
              onChange={(e) => setPlanForm({ ...planForm, backupOwnerId: e.target.value })}
              helperText="Name one accountable backup and define support expectations."
            >
              <MenuItem value="">Select a person</MenuItem>
              {people.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
            </TextField>
            <TextField
              select
              label="Knowledge-transfer sessions"
              value={planForm.sessions}
              onChange={(e) => setPlanForm({ ...planForm, sessions: Number(e.target.value) })}
            >
              {[2, 3, 4].map((n) => <MenuItem key={n} value={n}>{n} sessions</MenuItem>)}
            </TextField>
            <TextField
              label="Target date"
              type="date"
              value={planForm.dueDate}
              onChange={(e) => setPlanForm({ ...planForm, dueDate: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPlanOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={!planForm.backupOwnerId || !planForm.dueDate} onClick={submitPlan}>
            Start plan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KnowledgeDetail;
