import { Link } from 'react-router';
import { Box, Chip, Grid, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import HealthAndSafety from '@mui/icons-material/HealthAndSafety';
import WarningAmber from '@mui/icons-material/WarningAmber';
import WorkspacePremium from '@mui/icons-material/WorkspacePremium';
import Speed from '@mui/icons-material/Speed';
import EmojiEvents from '@mui/icons-material/EmojiEvents';
import PageHeader from '../../components/common/PageHeader.jsx';
import MetricCard from '../../components/common/MetricCard.jsx';
import ChartCard from '../../components/ui/ChartCard.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import InsightCard from '../../components/ui/InsightCard.jsx';
import { coverageTrend } from '../../data/service.js';
import { getProjectStatus } from '../../config/riskLabels.js';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { paths } from '../../config/paths.js';
import { formatShortDate } from '../../config/dates.js';
import { useActionStore } from '../../store/actionStore.js';
import { useToast } from '../../hooks/useToast.js';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import LightbulbOutlined from '@mui/icons-material/LightbulbOutlined';
import { useDashboard, useDashboardInsights } from '../../hooks/useDashboard.js';

/**
 * Overview — the four MVP pillars (health, risk, knowledge, capacity) plus
 * recognized impact, all without excessive scroll.
 *
 * REMAINING (extend later):
 *  - 5 metric cards with inline sparkline trends (MetricCard `trend` slot)
 *  - stacked risk-by-severity/category bars (riskBySeverityAndCategory)
 *  - "Export" action + date range already in TopBar
 *  - grid slot for a second chart (7/5 layout)
 */
const Overview = () => {
  const { data: dashboard, loading, error, retry } = useDashboard();
  const { data: insights = [], loading: insightsLoading, error: insightsError } = useDashboardInsights();
  const { isSaved, saveInsight, unsaveInsight, dismissInsight, restoreInsight } = useActionStore();
  const toast = useToast();

  if (loading) return <LoadingState variant="grid" sx={{ mt: 3 }} />;
  if (error) return <ErrorState onRetry={retry} />;

  const kpis = dashboard.kpis;
  const trend = coverageTrend();
  const attention = dashboard.attention;
  const singleOwners = dashboard.knowledgeRisks;
  const chain = dashboard.chain;
  const handleSave = (id) => {
    const undo = () => unsaveInsight(id);
    saveInsight(id);
    toast('Insight saved', { actionLabel: 'Undo', action: undo });
  };
  const handleDismiss = (id) => {
    const undo = () => restoreInsight(id);
    dismissInsight(id);
    toast('Insight dismissed', { actionLabel: 'Undo', action: undo });
  };

  const kpiCards = [
    { label: 'Engineering health', value: kpis.health.value, delta: kpis.health.delta, icon: <HealthAndSafety color="success" /> },
    { label: 'Projects at risk', value: kpis.projectsAtRisk.value, detail: kpis.projectsAtRisk.detail, icon: <WarningAmber color="warning" /> },
    {
      label: 'Knowledge concentration',
      value: kpis.knowledgeConcentration.value,
      detail: kpis.knowledgeConcentration.detail,
      icon: <WorkspacePremium color="secondary" />,
      chain: singleOwners.map((a) => (
        <Chip key={a.id} size="small" component={Link} to={paths.system(a.id)} clickable label={a.name} variant="outlined" />
      )),
    },
    { label: 'Team capacity', value: kpis.teamCapacity.value, detail: kpis.teamCapacity.detail, icon: <Speed color="info" /> },
    {
      label: 'Recognized impact',
      value: kpis.recognizedImpact.value,
      delta: kpis.recognizedImpact.delta,
      icon: <EmojiEvents color="primary" />,
      help: 'Recognized impact represents meaningful engineering contribution beyond conventional metrics such as story points — for example mentoring, reliability saves, and knowledge sharing backed by evidence.',
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Engineering overview"
        subtitle="A clear view of delivery health, expertise, and impact."
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
        {/* KPI strip — deliberate 5-across on desktop (flex, lg = 1 row) */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {kpiCards.map((k) => (
            <Box key={k.label} sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 30%', lg: '1 1 0' }, minWidth: 0 }}>
              <MetricCard {...k} />
            </Box>
          ))}
        </Box>

        {/* Relationship chain — Projects → Teams → People → Skills → Knowledge → Risk */}
        {chain && (
          <ChartCard title="Engineering relationships" subtitle={`How ${chain.project.name} connects teams, people, skills, knowledge, and risk.`}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', py: 1 }}>
              <ChainNode label={chain.project.name} to={paths.project(chain.project.id)} tone="primary" />
              <ChainArrow />
              <ChainGroup label={`${chain.teams.length} team${chain.teams.length === 1 ? '' : 's'}`} items={chain.teams.map((t) => ({ id: t.id, name: t.name, to: paths.team(t.id) }))} />
              <ChainArrow />
              <ChainGroup label={`${chain.people.length} people`} items={chain.people.slice(0, 5).map((p) => ({ id: p.id, name: p.name, to: paths.person(p.id) }))} />
              <ChainArrow />
              <ChainGroup label={`${chain.skills.length} skills`} items={chain.skills.map((a) => ({ id: a.id, name: a.name, to: paths.system(a.id) }))} />
              <ChainArrow />
              <ChainGroup label={`${chain.areas.length} systems`} items={chain.areas.map((a) => ({ id: a.id, name: a.name, to: paths.system(a.id) }))} />
              <ChainArrow />
              <ChainGroup label={`${chain.risks.length} risks`} items={chain.risks.slice(0, 4).map((r) => ({ id: r.id, name: r.title }))} tone="error" />
            </Box>
          </ChartCard>
        )}

        {/* Health trend + insights */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={7}>
            <ChartCard
              title="Engineering health trend"
              subtitle="Average project health, last 12 weeks"
              legend={[{ name: 'Health', color: 'var(--primary)' }]}
              data={trend}
              dataColumns={[{ key: 'date', label: 'Week' }, { key: 'coverage', label: 'Health' }]}
            >
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" fontSize={12} stroke="var(--text-muted)" />
                  <YAxis fontSize={12} stroke="var(--text-muted)" />
                  <Tooltip />
                  <Line type="monotone" dataKey="coverage" stroke="var(--primary)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography sx={{ fontWeight: 600 }}>AI insights</Typography>
              {insightsLoading ? (
                <LoadingState sx={{ p: 2.5 }} />
              ) : insightsError ? (
                <Typography sx={{ fontSize: 13, color: 'var(--red)' }}>Couldn't load insights.</Typography>
              ) : insights.length ? (
                insights.map((ins) => (
                  <InsightCard
                    key={ins.id}
                    insight={ins}
                    saved={isSaved(ins.id)}
                    onSave={() => handleSave(ins.id)}
                    onDismiss={() => handleDismiss(ins.id)}
                  />
                ))
              ) : (
                <EmptyState
                  icon={LightbulbOutlined}
                  title="No AI insights yet"
                  description="Insights will appear here as signals are analyzed."
                  sx={{ py: 4 }}
                />
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Projects needing attention */}
        <ChartCard
          title="Projects needing attention"
          subtitle="Sorted by lowest engineering health"
        >
          <DataTable
            dense
            columns={[
              { key: 'name', label: 'Project', sortable: true, render: (r) => <Link to={paths.project(r.id)} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>{r.name}</Link> },
              { key: 'status', label: 'Status', render: (r) => <StatusBadge config={getProjectStatus(r.status)} /> },
              { key: 'healthScore', label: 'Health', sortable: true },
              { key: 'deliveryConfidence', label: 'Confidence', sortable: true },
              { key: 'targetDate', label: 'Target', render: (r) => formatShortDate(r.targetDate) },
              { key: 'topDriver', label: 'Driver' },
            ]}
            rows={attention}
            initialSort={{ key: 'healthScore', dir: 'asc' }}
          />
        </ChartCard>
      </Box>
    </Box>
  );
};

function ChainArrow() {
  return <Typography sx={{ color: 'text.disabled', fontWeight: 700 }}>→</Typography>;
}

function ChainGroup({ label, items, tone }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
      <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary' }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {items.map((it) => (
          <Chip
            key={it.id}
            size="small"
            component={it.to ? Link : undefined}
            to={it.to}
            clickable
            label={it.name}
            variant="outlined"
            sx={tone === 'error' ? { color: 'var(--red)', borderColor: 'var(--red-lighter)', bgcolor: 'var(--red-lighter)' } : undefined}
          />
        ))}
      </Box>
    </Box>
  );
}

function ChainNode({ label, to }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
      <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary' }}>
        Project
      </Typography>
      <Chip size="small" component={Link} to={to} clickable label={label} sx={{ bgcolor: 'var(--primary-lighter)', color: 'var(--primary)', border: 'none', fontWeight: 600 }} />
    </Box>
  );
}

export default Overview;
