import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, TextField, Typography } from '@mui/material';
import HelpOutlineOutlined from '@mui/icons-material/HelpOutlineOutlined';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import Check from '@mui/icons-material/Check';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import MetricCard from '../../components/common/MetricCard.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import { useData } from '../../hooks/useData.js';
import { useToast } from '../../hooks/useToast.js';
import { getPeople, getProject, areaHierarchy } from '../../data/service.js';
import { createTransferPlan, fetchKnowledgeArea, fetchTransferPlans } from '../../api/knowledge.js';
import SparkleIcon from '../../components/ui/SparkleIcon.jsx';
import { useAiTerms } from '../../hooks/useAiTerms.js';
import { coverageStatus, getRiskLevel } from '../../config/riskLabels.js';
import { paths } from '../../config/paths.js';
import { formatRelative } from '../../config/dates.js';

const LEVEL_LABEL = { primary: 'Primary', capable: 'Capable', learning: 'Learning', unverified: 'Unverified' };
const LEVEL_COLOR = { primary: 'var(--primary)', capable: 'var(--teal)', learning: 'var(--amber)', unverified: 'var(--text-muted)' };

const SOURCE_LABEL = { github: 'GitHub', jira: 'Jira', docs: 'Docs', incident: 'Incident', pagerduty: 'PagerDuty' };

const SOURCE_BASIS = {
  github: 'GitHub ownership patterns',
  incident: 'Incident history',
  docs: 'Documentation freshness',
  jira: 'Jira activity',
  pagerduty: 'PagerDuty on-call history',
};

const BASIS_ORDER = ['github', 'incident', 'docs', 'jira', 'pagerduty'];

const KnowledgeDetail = () => {
  const { systemId } = useParams();
  const { data: area, loading, error, retry } = useData(() => fetchKnowledgeArea(systemId), [systemId]);
  const { data: plans = [], retry: retryPlans } = useData(fetchTransferPlans, []);
  const toast = useToast();
  const { t } = useAiTerms();
  const [planOpen, setPlanOpen] = useState(false);
  const [planForm, setPlanForm] = useState({ backupOwnerId: '', sessions: 2, dueDate: '' });
  const [planSubmitting, setPlanSubmitting] = useState(false);

  // Normalize height + vertical padding across select and date inputs so all
  // three plan fields render at an identical medium size.
  const uniformInputSx = { height: '3.4em', paddingTop: '16.5px', paddingBottom: '16.5px' };

  if (loading) return <LoadingState variant="card" />;
  if (error) return <ErrorState onRetry={retry} />;
  if (!area) return <Typography>System not found.</Typography>;

  const people = getPeople();
  const projects = area.linkedProjectIds.map((id) => getProject(id)).filter(Boolean);
  const groups = { primary: [], capable: [], learning: [], unverified: [] };
  (area.expertise ?? []).forEach((x) => (groups[x.level] ?? groups.learning).push(x));
  const transferPlan = plans?.find((p) => p.areaId === area.id) ?? null;
  const chain = areaHierarchy(area.id);

  const submitPlan = async () => {
    if (planSubmitting) return;
    setPlanSubmitting(true);
    try {
      await createTransferPlan({ areaId: area.id, backupOwnerId: planForm.backupOwnerId, dueDate: planForm.dueDate });
      setPlanOpen(false);
      retryPlans();
      toast('Transfer plan started', { severity: 'success' });
    } catch (err) {
      toast(err?.message ?? 'Could not start the transfer plan', { severity: 'error' });
    } finally {
      setPlanSubmitting(false);
    }
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
        <Typography sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', fontSize: 13, color: 'text.secondary' }}>
          <SparkleIcon sx={{ fontSize: 15, color: 'var(--ai)', flexShrink: 0 }} />
          <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>{t('confidence')} 87%</Box>
          <Box component="span" sx={{ opacity: 0.55 }}>·</Box>
          <Box component="span" sx={{ fontWeight: 600 }}>Based on</Box>
          {BASIS_ORDER
            .map((k) => (area.evidence ?? []).some((ev) => ev.source === k) ? SOURCE_BASIS[k] : null)
            .filter(Boolean)
            .map((label) => (
              <Box key={label} component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4 }}>
                <Check sx={{ fontSize: 13, color: 'var(--primary)' }} />
                {label}
              </Box>
            ))}
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
        <Typography sx={{ color: 'text.secondary', mb: 0.75 }}>Scoring inputs and the evidence timeline behind this assessment.</Typography>
        {(() => {
          const sources = [...new Set((area.evidence ?? []).map((ev) => SOURCE_LABEL[ev.source] ?? ev.source).filter(Boolean))];
          return (
            <Typography sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, fontSize: 13, color: 'text.secondary', mb: 1.5 }}>
              <SparkleIcon sx={{ fontSize: 15, color: 'var(--ai)', flexShrink: 0 }} />
              {t('detectedConcentration')}{' '}
              <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {sources.length ? sources.join(' · ') : 'recorded engineering signals'}
              </Box>
            </Typography>
          );
        })()}
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
      <Dialog
        open={planOpen}
        onClose={() => setPlanOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { width: 760, maxWidth: '100%', borderRadius: 'var(--radius-card)' } }}
      >
        <DialogTitle sx={{ px: 4, pt: 3.5, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 'var(--radius-control)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'var(--primary-lighter)',
                color: 'var(--primary)',
                flexShrink: 0,
              }}
            >
              <HelpOutlineOutlined sx={{ fontSize: 24 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 20, fontWeight: 700, lineHeight: 1.25 }}>Start transfer plan</Typography>
              <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.25, lineHeight: 1.4 }}>
                Create a knowledge-transfer plan for {area.name}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 4, pt: 0, pb: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 'var(--radius-control)',
                bgcolor: 'var(--surface-subtle)',
                outline: '1px solid',
                outlineColor: 'divider',
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' },
                gap: 2,
              }}
            >
              <Box>
                <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}>
                  Current coverage
                </Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 700, mt: 0.25 }}>{area.coverage}%</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}>
                  Target coverage
                </Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 700, mt: 0.25, color: 'var(--primary)' }}>
                  {Math.min(90, area.coverage + 27)}%
                </Typography>
              </Box>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}>
                  Risk level
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <StatusBadge config={getRiskLevel(area.riskLevel)} />
                </Box>
              </Box>
            </Box>

            <TextField
              select
              fullWidth
              size="medium"
              label="Backup owner"
              value={planForm.backupOwnerId}
              onChange={(e) => setPlanForm({ ...planForm, backupOwnerId: e.target.value })}
              slotProps={{ input: { sx: uniformInputSx } }}
            >
              <MenuItem value="">Select a person</MenuItem>
              {people.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
            </TextField>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <TextField
                select
                fullWidth
                size="medium"
                label="Transfer sessions"
                value={planForm.sessions}
                onChange={(e) => setPlanForm({ ...planForm, sessions: Number(e.target.value) })}
                slotProps={{ input: { sx: uniformInputSx } }}
              >
                {[2, 3, 4].map((n) => <MenuItem key={n} value={n}>{n} sessions</MenuItem>)}
              </TextField>
              <TextField
                fullWidth
                size="medium"
                label="Target date"
                type="date"
                value={planForm.dueDate}
                onChange={(e) => setPlanForm({ ...planForm, dueDate: e.target.value })}
                slotProps={{ inputLabel: { shrink: true }, input: { sx: uniformInputSx } }}
              />
            </Box>
            <Box
              sx={{
                p: 2,
                borderRadius: 'var(--radius-control)',
                outline: '1px solid',
                outlineColor: 'divider',
                bgcolor: 'background.paper',
                display: 'inline-flex',
                alignItems: 'flex-start',
                gap: 1.5,
              }}
            >
              <InfoOutlined sx={{ fontSize: 18, color: 'var(--primary)', mt: 0.15, flexShrink: 0 }} />
              <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.5 }}>
                Pick one accountable backup owner and define support expectations before starting. The plan is saved immediately with the selected owner and target date, then shown in the mitigation plan section.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 3.5, pt: 1.5, gap: 1.5 }}>
          <Button size="large" onClick={() => setPlanOpen(false)} disabled={planSubmitting}>Cancel</Button>
          <Button
            size="large"
            variant="contained"
            disabled={!planForm.backupOwnerId || !planForm.dueDate || planSubmitting}
            onClick={submitPlan}
            sx={{ px: 3 }}
          >
            {planSubmitting ? 'Starting…' : 'Start plan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KnowledgeDetail;
