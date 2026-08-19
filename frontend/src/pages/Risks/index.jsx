import { useState } from 'react';
import { Box, Grid, MenuItem, TextField, Typography } from '@mui/material';
import PageHeader from '../../components/common/PageHeader.jsx';
import AISubtitle from '../../components/ui/AISubtitle.jsx';
import { useAiTerms } from '../../hooks/useAiTerms.js';
import MetricCard from '../../components/common/MetricCard.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import FilterBar from '../../components/ui/FilterBar.jsx';
import EvidenceDrawer from '../../components/ui/EvidenceDrawer.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import { fetchRisks } from '../../api/risks.js';
import { getSeverity, getRiskStatus } from '../../config/riskLabels.js';
import { RISK_CATEGORIES, RISK_CATEGORY_LABELS, RISK_STATUS } from '../../config/constants.js';
import { useData } from '../../hooks/useData.js';
import { useUrlFilters } from '../../hooks/useUrlFilters.js';

/**
 * Risks — cross-project register with filters and an evidence drawer.
 *
 * REMAINING (extend later):
 *  - trend column with directional arrow (trendConfig)
 *  - "Assign / Mitigate" workflow actions inside the drawer + undo toast
 *  - evidence drawer opens with the selected risk's signals highlighted
 */
const Risks = () => {
  const { values, set, clear } = useUrlFilters(['severity', 'category', 'status']);
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: risks = [], loading, error, retry } = useData(fetchRisks);
  const { t } = useAiTerms();

  if (loading) return <LoadingState variant="table" />;
  if (error) return <ErrorState onRetry={retry} />;

  const today = new Date().toISOString().slice(0, 10);
  const filtered = risks.filter((r) => {
    if (values.severity && r.severity !== values.severity) return false;
    if (values.category && r.category !== values.category) return false;
    if (values.status && r.status !== values.status) return false;
    return true;
  });

  const activeFilters = [
    values.severity ? { key: 'severity', label: `Severity: ${values.severity}`, onRemove: () => set('severity', '') } : null,
    values.category ? { key: 'category', label: `Category: ${RISK_CATEGORY_LABELS[values.category]}`, onRemove: () => set('category', '') } : null,
    values.status ? { key: 'status', label: `Status: ${RISK_STATUS[values.status]}`, onRemove: () => set('status', '') } : null,
  ].filter(Boolean);

  const openRisk = (risk) => {
    setSelectedRisk(risk);
    setDrawerOpen(true);
  };

  const kpis = [
    { label: 'Critical', value: risks.filter((r) => r.severity === 'critical').length },
    { label: 'High', value: risks.filter((r) => r.severity === 'high').length },
    { label: 'Rising', value: risks.filter((r) => r.trend === 'rising').length },
    { label: 'Overdue actions', value: risks.reduce((n, r) => n + (r.actions ?? []).filter((a) => a.dueDate && a.dueDate < today).length, 0) },
  ];

  return (
    <Box>
      <PageHeader title="Risks" subtitle={<AISubtitle>{t('subtitleRisks')}</AISubtitle>} />

      <Grid container spacing={3} sx={{ mt: 3 }}>
        {kpis.map((k) => (
          <Grid item key={k.label} xs={6} sm={3}><MetricCard {...k} /></Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 3 }}>
        <FilterBar filters={activeFilters} onClear={clear}>
          <TextField select size="small" label="Severity" value={values.severity ?? ''} onChange={(e) => set('severity', e.target.value)} sx={{ width: 140 }}>
            <MenuItem value="">All</MenuItem>
            {['critical', 'high', 'medium', 'low'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Category" value={values.category ?? ''} onChange={(e) => set('category', e.target.value)} sx={{ width: 150 }}>
            <MenuItem value="">All</MenuItem>
            {RISK_CATEGORIES.map((c) => <MenuItem key={c.key} value={c.key}>{c.label}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Status" value={values.status ?? ''} onChange={(e) => set('status', e.target.value)} sx={{ width: 140 }}>
            <MenuItem value="">All</MenuItem>
            {Object.entries(RISK_STATUS).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
          </TextField>
        </FilterBar>
      </Box>

      <Box sx={{ mt: 2 }}>
        <DataTable
          columns={[
            { key: 'title', label: 'Risk', sortable: true, render: (r) => <Typography sx={{ fontWeight: 600 }}>{r.title}</Typography> },
            { key: 'severity', label: 'Severity', render: (r) => <StatusBadge config={getSeverity(r.severity)} pulse={r.severity === 'critical'} /> },
            { key: 'category', label: 'Category', render: (r) => RISK_CATEGORY_LABELS[r.category] },
            { key: 'confidence', label: 'Confidence', sortable: true, render: (r) => `${r.confidence}%` },
            { key: 'trend', label: 'Trend' },
            { key: 'status', label: 'Status', render: (r) => <StatusBadge config={getRiskStatus(r.status)} /> },
          ]}
          rows={filtered}
          onRowClick={openRisk}
          emptyTitle="No risks match"
          emptyDescription="Try adjusting your filters."
        />
      </Box>

      <EvidenceDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} risk={selectedRisk} />
    </Box>
  );
};

export default Risks;
