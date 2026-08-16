import { useState } from 'react';
import { Link, NavLink } from 'react-router';
import { Box, Chip, Grid, LinearProgress, Tab, Tabs, Typography } from '@mui/material';
import PageHeader from '../../components/common/PageHeader.jsx';
import MetricCard from '../../components/common/MetricCard.jsx';
import AvatarGroup from '../../components/common/AvatarGroup.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import { getPeople, transferOpportunities, areaHierarchy } from '../../data/service.js';
import { fetchKnowledgeAreas } from '../../api/knowledge.js';
import { useData } from '../../hooks/useData.js';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import { coverageStatus, getRiskLevel } from '../../config/riskLabels.js';
import { paths } from '../../config/paths.js';

/**
 * Knowledge — knowledge concentration + knowledge-risk module.
 * Tab 1 = "Knowledge areas" (all systems with their risk signals),
 * tab 2 = "Risks" (priority risk table + transfer opportunities).
 * The Transfer plans tab links to the dedicated page.
 */
const Knowledge = () => {
  const [view, setView] = useState('areas');
  const { data: areas = [], loading, error, retry } = useData(fetchKnowledgeAreas);
  const people = getPeople();
  const opportunities = transferOpportunities();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={retry} />;

  const sortedAreas = [...areas].sort((a, b) => a.coverage - b.coverage);
  const priorityRisks = [...areas].sort((a, b) => b.riskScore - a.riskScore);

  const summary = {
    criticalRisks: areas.filter((a) => a.riskLevel === 'critical' || a.riskLevel === 'high').length,
    singleOwner: areas.filter((a) => {
      const expertise = a.expertise ?? [];
      return expertise.length <= 1 || !expertise.some((x) => x.level === 'capable');
    }).length,
    docsFresh: `${Math.round((areas.filter((a) => a.documentationFreshnessDays <= 30).length / Math.max(areas.length, 1)) * 100)}%`,
    coverageTrend: '+8%',
  };

  const kpis = [
    { label: 'Critical knowledge risks', value: summary.criticalRisks },
    { label: 'Single-owner areas', value: summary.singleOwner },
    { label: 'Current documentation', value: summary.docsFresh },
    { label: 'Coverage trend', value: summary.coverageTrend },
  ];

  const expertNames = (area) =>
    area.expertIds.map((id) => people.find((p) => p.id === id)).filter(Boolean);

  const headerActions = (
    <Tabs value={view} onChange={(_, v) => setView(v)} aria-label="Knowledge module sections">
      <Tab label="Knowledge areas" value="areas" />
      <Tab label="Risks" value="risks" />
      <Tab component={NavLink} to={paths.transferPlans} label="Transfer plans" value="plans" />
    </Tabs>
  );

  if (view === 'risks') {
    return (
      <Box>
        <PageHeader title="Knowledge" subtitle="Find critical systems that depend on too few people." actions={headerActions} />

        <Grid container spacing={3} sx={{ mt: 3 }}>
          {kpis.map((k) => (
            <Grid item key={k.label} xs={6} sm={3}><MetricCard {...k} /></Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Priority knowledge risks</Typography>
          <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>High-impact areas with fragile coverage, ranked by risk.</Typography>
          <DataTable
            initialSort={{ key: 'riskScore', dir: 'desc' }}
            columns={[
              { key: 'name', label: 'Knowledge area', sortable: true, render: (r) => (
                <Link to={paths.system(r.id)} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>{r.name}</Link>
              )},
              { key: 'context', label: 'Client / Project / Module', render: (r) => {
                const chain = areaHierarchy(r.id);
                return chain.length ? (
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                    <Typography component="span" sx={{ fontWeight: 600 }}>{chain[0].clientName}</Typography>
                    {' / '}
                    <Link to={paths.project(chain[0].projectId)} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{chain[0].projectName}</Link>
                    {' / '}
                    {chain[0].areaName}
                  </Typography>
                ) : '—';
              }},
              { key: 'criticalityScore', label: 'Criticality', sortable: true, render: (r) => `${r.criticalityScore}/100` },
              { key: 'coverage', label: 'Coverage', sortable: true, render: (r) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
                  <LinearProgress variant="determinate" value={r.coverage} sx={{ flex: 1, height: 6, borderRadius: 4, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: coverageStatus(r.coverage).color } }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{r.coverage}%</Typography>
                </Box>
              )},
              { key: 'dominantExpertShare', label: 'Dominant expert', sortable: true, render: (r) => `${r.dominantExpertShare}%` },
              { key: 'backup', label: 'Backup', render: (r) => {
                const hasBackup = (r.expertise ?? []).some((x) => x.level === 'capable');
                return hasBackup ? 'Yes' : 'None';
              }},
              { key: 'riskScore', label: 'Risk', sortable: true, render: (r) => <StatusBadge config={getRiskLevel(r.riskLevel)} /> },
              { key: 'fresh', label: 'Docs freshness', render: (r) => `${r.documentationFreshnessDays}d` },
            ]}
            rows={priorityRisks.map((r) => ({ ...r, id: r.id }))}
            emptyTitle="No knowledge areas"
            emptyDescription="Areas mapped to systems appear here."
          />
        </Box>

        <Box sx={{ mt: 4, p: 3, outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-card)', bgcolor: 'background.paper' }}>
          <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Knowledge-transfer opportunities</Typography>
          <Typography sx={{ color: 'text.secondary', mb: 2 }}>Suggested pairings to improve coverage on critical areas.</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {opportunities.map((o) => {
              const chain = areaHierarchy(o.areaId);
              return (
                <Box key={o.areaId} sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, p: 1.5, outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-control)' }}>
                  <Link to={paths.system(o.areaId)} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>{o.areaName}</Link>
                  {chain.length > 0 && (
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                      {chain[0].clientName} / {chain[0].projectName}
                    </Typography>
                  )}
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Pair {o.primaryName} → {o.learnerName}</Typography>
                  <Chip size="small" variant="outlined" label={`Gain ~${o.expectedGain}`} />
                  <Chip size="small" variant="outlined" label={`Effort: ${o.effort}`} />
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title="Knowledge" subtitle="Find critical systems that depend on too few people." actions={headerActions} />

      <Grid container spacing={3} sx={{ mt: 3 }}>
        {kpis.map((k) => (
          <Grid item key={k.label} xs={6} sm={3}><MetricCard {...k} /></Grid>
        ))}
      </Grid>

      {/* Knowledge areas — knowledge concentration across all systems */}
      <Box sx={{ mt: 4 }}>
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Knowledge concentration</Typography>
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>
          Where knowledge lives per system. Lower coverage and fewer confirmed backups mean the area depends on fewer people.
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {sortedAreas.map((a) => {
            const primary = (a.expertise ?? []).filter((x) => x.level === 'primary');
            const capable = (a.expertise ?? []).filter((x) => x.level === 'capable');
            const learning = (a.expertise ?? []).filter((x) => x.level === 'learning' || x.level === 'unverified');
            const experts = expertNames(a);
            return (
              <Box
                key={a.id}
                sx={{ p: 2, outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-card)', bgcolor: 'background.paper' }}
              >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                  <Box>
                    <Link to={paths.system(a.id)} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>{a.name}</Link>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary', textTransform: 'capitalize' }}>
                      {(() => {
                        const chain = areaHierarchy(a.id);
                        if (!chain.length) return `${a.type} · Docs ${a.documentationFreshnessDays}d old`;
                        return (
                          <>
                            <Typography component="span" sx={{ fontWeight: 600 }}>{chain[0].clientName}</Typography>
                            {' / '}
                            <Link to={paths.project(chain[0].projectId)} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{chain[0].projectName}</Link>
                            {' · Docs '}{a.documentationFreshnessDays}d old
                          </>
                        );
                      })()}
                    </Typography>
                  </Box>
                  <StatusBadge config={coverageStatus(a.coverage)} />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.25 }}>
                  <LinearProgress variant="determinate" value={a.coverage} sx={{ flex: 1, height: 6, borderRadius: 4, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: coverageStatus(a.coverage).color } }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{a.coverage}%</Typography>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mt: 1.25 }}>
                  {experts.length > 0 && <AvatarGroup people={experts} max={4} size={24} />}
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {primary.length} primary · {capable.length} capable · {learning.length} learning
                    {experts.length > 0 ? ` · ${experts.map((p) => p.name).join(', ')}` : ''}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default Knowledge;
