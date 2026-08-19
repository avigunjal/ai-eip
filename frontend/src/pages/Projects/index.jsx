import { Link } from 'react-router';
import { Box, Grid, MenuItem, TextField } from '@mui/material';
import PageHeader from '../../components/common/PageHeader.jsx';
import AISubtitle from '../../components/ui/AISubtitle.jsx';
import { useAiTerms } from '../../hooks/useAiTerms.js';
import MetricCard from '../../components/common/MetricCard.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import FilterBar from '../../components/ui/FilterBar.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import { useData } from '../../hooks/useData.js';
import { fetchProjects } from '../../api/projects.js';
import { getProjectStatus } from '../../config/riskLabels.js';
import { PROJECT_STATUS } from '../../config/constants.js';
import { paths } from '../../config/paths.js';
import { formatShortDate } from '../../config/dates.js';
import { useUrlFilters } from '../../hooks/useUrlFilters.js';

/**
 * Projects — portfolio table with filters (search + status), plus health-by-team
 * and delivery-confidence aggregates.
 *
 * REMAINING (extend later):
 *  - KPI strip (counts per status) above the toolbar
 *  - health-by-team bars (healthByTeam) and delivery-confidence donut
 *    (deliveryConfidenceDistribution) rendered as Recharts in ChartCards
 *  - trend sparkline column using project.trend
 *  - status select driven by a "clear" that respects the URL
 */
const Projects = () => {
  const { values, set, clear } = useUrlFilters(['search', 'status']);
  const { data: projects = [], loading, error, retry } = useData(fetchProjects);
  const { t } = useAiTerms();

  if (loading) return <LoadingState variant="grid" sx={{ mt: 3 }} />;
  if (error) return <ErrorState onRetry={retry} />;

  const q = (values.search ?? '').toLowerCase();
  const filtered = projects.filter((p) => {
    const matchSearch = !q || p.name.toLowerCase().includes(q);
    const matchStatus = !values.status || p.status === values.status;
    return matchSearch && matchStatus;
  });

  const activeFilters = [
    values.search ? { key: 'search', label: `Search: ${values.search}`, onRemove: () => set('search', '') } : null,
    values.status ? { key: 'status', label: `Status: ${PROJECT_STATUS[values.status]}`, onRemove: () => set('status', '') } : null,
  ].filter(Boolean);

  // Aggregate KPI strip
  const byStatus = (s) => projects.filter((p) => p.status === s).length;
  const kpis = [
    { label: 'Total projects', value: projects.length },
    { label: 'At risk', value: byStatus('at_risk') },
    { label: 'On track', value: byStatus('on_track') },
    { label: 'Paused', value: byStatus('paused') },
  ];

  return (
    <Box>
      <PageHeader title="Projects" subtitle={<AISubtitle>{t('subtitleProjects')}</AISubtitle>} />

      {/* KPI strip */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        {kpis.map((k) => (
          <Grid item key={k.label} xs={6} sm={3}>
            <MetricCard {...k} />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 3 }}>
        <FilterBar filters={activeFilters} onClear={clear}>
          <TextField
            size="small"
            placeholder="Search projects…"
            value={values.search ?? ''}
            onChange={(e) => set('search', e.target.value)}
            sx={{ width: 220 }}
          />
          <TextField
            select
            size="small"
            label="Status"
            value={values.status ?? ''}
            onChange={(e) => set('status', e.target.value)}
            sx={{ width: 160 }}
          >
            <MenuItem value="">All</MenuItem>
            {Object.entries(PROJECT_STATUS).map(([k, v]) => (
              <MenuItem key={k} value={k}>{v}</MenuItem>
            ))}
          </TextField>
        </FilterBar>
      </Box>

      <Box sx={{ mt: 2 }}>
        <DataTable
          columns={[
            { key: 'name', label: 'Project', sortable: true, render: (r) => <Link to={paths.project(r.id)} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>{r.name}</Link> },
            { key: 'status', label: 'Status', render: (r) => <StatusBadge config={getProjectStatus(r.status)} /> },
            { key: 'healthScore', label: 'Health', sortable: true },
            { key: 'deliveryConfidence', label: 'Confidence', sortable: true },
            { key: 'targetDate', label: 'Target', sortable: true, render: (r) => formatShortDate(r.targetDate) },
            { key: 'topDriver', label: 'Driver' },
          ]}
          rows={filtered}
          onRowClick={(r) => (window.location.href = paths.project(r.id))}
          emptyTitle="No projects match"
          emptyDescription="Try clearing your filters."
        />
      </Box>
    </Box>
  );
};

export default Projects;
