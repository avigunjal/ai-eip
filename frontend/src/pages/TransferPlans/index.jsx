import { Link } from 'react-router';
import { Box, Grid, LinearProgress, Typography } from '@mui/material';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import MetricCard from '../../components/common/MetricCard.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import AssignmentTurnedIn from '@mui/icons-material/AssignmentTurnedIn';
import { useData } from '../../hooks/useData.js';
import { getPeople } from '../../data/service.js';
import { fetchTransferPlans } from '../../api/knowledge.js';
import { getRiskLevel } from '../../config/riskLabels.js';
import { paths } from '../../config/paths.js';

const PLAN_STATUS_LABEL = { todo: 'To do', scheduled: 'Scheduled', in_progress: 'In progress', complete: 'Complete' };

const TransferPlans = () => {
  const { data: plans, loading, error, retry } = useData(fetchTransferPlans, []);
  const people = getPeople();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={retry} />;

  const active = (plans ?? []).filter((p) => p.status !== 'complete');
  const kpis = [
    { label: 'Active plans', value: active.length },
    { label: 'Critical plans', value: active.filter((p) => p.riskLevel === 'critical').length },
    { label: 'Avg progress', value: `${active.length ? Math.round(active.reduce((s, p) => s + p.progress, 0) / active.length) : 0}%` },
    { label: 'Avg target coverage', value: `${active.length ? Math.round(active.reduce((s, p) => s + (p.targetCoverage - p.fromCoverage), 0) / active.length) : 0} pts` },
  ];

  return (
    <Box>
      <PageHeader title="Transfer plans" subtitle="Time-bound actions to improve knowledge coverage for critical areas." />

      <Grid container spacing={3} sx={{ mt: 3 }}>
        {kpis.map((k) => (
          <Grid item key={k.label} xs={6} sm={3}><MetricCard {...k} /></Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 3 }}>
        {(plans ?? []).length === 0 ? (
          <EmptyState icon={AssignmentTurnedIn} title="No transfer plans" description="Plans you create will appear here." />
        ) : (
          <DataTable
            initialSort={{ key: 'riskLevel', dir: 'desc' }}
            columns={[
              { key: 'title', label: 'Plan', sortable: true, render: (r) => (
                <Link to={paths.system(r.areaId)} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>{r.title}</Link>
              )},
              { key: 'riskLevel', label: 'Risk', sortable: true, render: (r) => <StatusBadge config={getRiskLevel(r.riskLevel)} /> },
              { key: 'owner', label: 'Owner', render: (r) => {
                const owner = people.find((p) => p.id === r.ownerId);
                return owner ? owner.name : '—';
              }},
              { key: 'backup', label: 'Backup', render: (r) => {
                const b = people.find((p) => p.id === r.backupOwnerId);
                return b ? b.name : '—';
              }},
              { key: 'progress', label: 'Progress', sortable: true, render: (r) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
                  <LinearProgress variant="determinate" value={r.progress} sx={{ flex: 1, height: 6, borderRadius: 4, bgcolor: 'action.hover' }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{r.progress}%</Typography>
                </Box>
              )},
              { key: 'coverage', label: 'Coverage', render: (r) => `${r.fromCoverage}% → ${r.targetCoverage}%` },
              { key: 'status', label: 'Status', sortable: true, render: (r) => PLAN_STATUS_LABEL[r.status] },
            ]}
            rows={(plans ?? []).map((p) => ({ ...p, id: p.id }))}
            emptyTitle="No plans match"
            emptyDescription="Try adjusting your filters."
          />
        )}
      </Box>
    </Box>
  );
};

export default TransferPlans;
