import { Link, useNavigate } from 'react-router';
import { Box, Button, Chip, Grid, Typography } from '@mui/material';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { Zap } from 'lucide-react';
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
import AiStatusCard from '../../components/ui/AiStatusCard.jsx';
import { useDashboard, useDashboardInsights } from '../../hooks/useDashboard.js';
import { useInsightAi } from '../../hooks/useInsightAi.js';
import { useAiTerms } from '../../hooks/useAiTerms.js';
import { collectSources } from '../../api/insights.adapter.js';
import { aiGlowSoft } from '../../config/animations.js';
import EngineeringRelationshipGraph from '../../components/ui/EngineeringRelationshipGraph.jsx';
import SparkleIcon from '../../components/ui/SparkleIcon.jsx';
import DecisionIntelligencePreview from './components/DecisionIntelligencePreview.jsx';
import KeyInsightsCard from './components/KeyInsightsCard.jsx';
import { fetchPerson } from '../../api/people.js';

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

/**
 * Demo — Decisions Required summary (Task 2). Curated to the Payment Service
 * narrative: 3 decisions need attention right now (1 critical · 2 high).
 * Presentation-only; the Decision Intelligence inbox remains the source of
 * truth and the full dataset lives there.
 */
const DECISIONS_REQUIRED = { total: 3, critical: 1, high: 2 };

const Overview = () => {
  const { data: dashboard, loading, error, retry } = useDashboard();
  const { data: insights = [], loading: insightsLoading, error: insightsError } = useDashboardInsights();
  const { t } = useAiTerms();
  const { isSaved, saveInsight, unsaveInsight, dismissInsight, restoreInsight } = useActionStore();
  const { aiEnabled, explanations, explainingId, regeneratingId, handleExplain, handleRegenerate } = useInsightAi();
  const toast = useToast();
  const navigate = useNavigate();

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
      icon: <WorkspacePremium color="primary" />,
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
    {
      label: 'Decisions required',
      value: DECISIONS_REQUIRED.total,
      detail: (
        <Typography component="span" sx={{ fontSize: 13 }}>
          <Box component="span" sx={{ color: 'var(--red)', fontWeight: 700 }}>
            {DECISIONS_REQUIRED.critical} critical
          </Box>
          <Box component="span" sx={{ color: 'text.disabled' }}> · </Box>
          <Box component="span" sx={{ color: 'var(--orange)', fontWeight: 700 }}>
            {DECISIONS_REQUIRED.high} high
          </Box>
        </Typography>
      ),
      icon: <Zap size={19} strokeWidth={2.4} color="var(--violet)" />,
      onClick: () => navigate(paths.decisionIntelligence),
      sx: {
        bgcolor: 'color-mix(in srgb, var(--violet-lighter) 70%, background.paper)',
        outlineColor: 'color-mix(in srgb, var(--violet) 40%, transparent)',
        boxShadow: '0 0 0 1px color-mix(in srgb, var(--violet) 18%, transparent), var(--shadow-card)',
        animation: `${aiGlowSoft} 5s ease-in-out infinite`,
        '& .metric-label': { color: 'var(--violet)' },
      },
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Engineering overview"
        subtitle="A clear view of delivery health, expertise, and impact."
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
        {/* KPI strip — 6-across on desktop (flex, lg = 1 row) */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {kpiCards.map((k) => (
            <Box
              key={k.label}
              tabIndex={k.onClick ? 0 : undefined}
              role={k.onClick ? 'link' : undefined}
              aria-label={k.onClick ? `Open ${k.label} in Decision Intelligence` : undefined}
              onKeyDown={
                k.onClick
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        k.onClick();
                      }
                    }
                  : undefined
              }
              sx={{
                flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 30%', lg: '1 1 0' },
                minWidth: 0,
                ...(k.onClick && {
                  borderRadius: 'var(--radius-card)',
                  cursor: 'pointer',
                  '&:focus-visible': { outline: 'var(--focus-ring)', outlineOffset: '2px' },
                }),
              }}
            >
              <MetricCard compact {...k} />
            </Box>
          ))}
        </Box>

        {/* Engineering relationships — interactive relationship graph + AI key insights */}
        {chain && (
          <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) minmax(280px, 320px)' },
              gap: { xs: 2, lg: 2.5 },
              alignItems: 'stretch',
            }}
          >
          <ChartCard
            title="Engineering relationships"
            subtitle={`How ${chain.project.name} connects teams, people, skills, systems, and risk.`}
            data={relationshipRows(chain)}
            dataColumns={[{ key: 'type', label: 'Type' }, { key: 'name', label: 'Name' }]}
          >
            <EngineeringRelationshipGraph data={chain} paths={paths} fetchPerson={fetchPerson} />
          </ChartCard>
          <KeyInsightsCard />
          </Box>

          {/* Open decision entry point — Dashboard → Decision Intelligence */}
          <Box
            component={Link}
            to={paths.decision('payment-backup')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap',
              p: 2.5,
              borderRadius: 'var(--radius-card)',
              bgcolor: 'var(--primary-lighter)',
              outline: '1px solid',
              outlineColor: 'color-mix(in srgb, var(--primary) 35%, transparent)',
              boxShadow: 'var(--shadow-card)',
              textDecoration: 'none',
              transition: 'outline-color var(--transition), box-shadow var(--transition)',
              '&:hover': {
                outlineColor: 'var(--primary)',
                boxShadow: 'var(--shadow-float)',
                textDecoration: 'none',
              },
              '&:focus-visible': { outline: 'var(--focus-ring)', outlineOffset: '2px' },
            }}
          >
            <SparkleIcon sx={{ fontSize: 24, color: 'var(--primary)', flexShrink: 0 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--primary)' }}
              >
                Open decision
              </Typography>
              <Typography sx={{ fontSize: { xs: 15, sm: 16 }, fontWeight: 700, mt: 0.25, color: 'text.primary' }}>
                This project has an open decision
              </Typography>
              <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.25, lineHeight: 1.5 }}>
                Who should be the backup owner for Payment Service?
              </Typography>
            </Box>
            <Button
              variant="contained"
              endIcon={<ArrowForward />}
              sx={{ textTransform: 'none', fontWeight: 600, width: { xs: '100%', sm: 'auto' } }}
            >
              View decision
            </Button>
          </Box>
          </>
        )}

        {/* Decision Intelligence preview — what leadership should decide next */}
        <DecisionIntelligencePreview />

        {/* Health trend + insights */}
        <Grid container spacing={3}>
          <Grid item size={{ xs: 12, lg: 3.6 }}>
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

          <Grid item size={{ xs: 12, lg: 8.4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {!insightsLoading && !insightsError && (
                <AiStatusCard
                  signals={insights.reduce((n, ins) => n + ins.why.evidence.length, 0)}
                  sources={collectSources(insights)}
                />
              )}
              {insightsLoading ? (
                <LoadingState sx={{ p: 2.5 }} />
              ) : insightsError ? (
                <Typography sx={{ fontSize: 13, color: 'var(--red)' }}>Couldn't load insights.</Typography>
              ) : insights.length ? (
                <>
                  {insights.slice(0, 2).map((ins) => (
                    <InsightCard
                      key={ins.id}
                      insight={ins}
                      saved={isSaved(ins.id)}
                      onSave={() => handleSave(ins.id)}
                      onDismiss={() => handleDismiss(ins.id)}
                      onExplain={() => handleExplain(ins.id)}
                      onRegenerate={() => handleRegenerate(ins.id)}
                      explaining={explainingId === ins.id}
                      regenerating={regeneratingId === ins.id}
                      aiEnabled={aiEnabled}
                      aiExplanation={explanations.get(ins.id)?.explanation ?? null}
                      aiMeta={explanations.get(ins.id)?.explanationMeta ?? null}
                      showAiLabel={ins.id === insights[0]?.id}
                      defaultOpen={ins.id === insights[0]?.id}
                    />
                  ))}
                  {insights.length > 2 && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <Button variant="outlined" size="large" component={Link} to={paths.insights}>
                        View all {insights.length} insights
                      </Button>
                    </Box>
                  )}
                </>
              ) : (
                <EmptyState
                  icon={LightbulbOutlined}
                  title="No insights yet"
                  description="Insights will appear here as signals are analyzed."
                  sx={{ py: 4 }}
                />
              )}
            </Box>
          </Grid>
        </Grid>

        {/* AI-prioritized projects */}
        <ChartCard
          title={t('prioritized')}
          subtitle="Ranked by engineering health risk"
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

function relationshipRows(chain) {
  return [
    { type: 'Project', name: chain.project.name },
    ...chain.teams.map((t) => ({ type: 'Team', name: t.name })),
    ...chain.people.map((p) => ({ type: 'Engineer', name: p.name })),
    ...chain.skills.map((s) => ({ type: 'Skill', name: s.name })),
    ...chain.systems.map((s) => ({ type: 'System', name: s.name })),
    ...chain.risks.map((r) => ({ type: 'Risk', name: r.title })),
  ];
}

export default Overview;
