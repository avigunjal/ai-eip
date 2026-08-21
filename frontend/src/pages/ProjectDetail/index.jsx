import { useParams } from 'react-router';
import { Box, Button, Chip, Grid, Tab, Tabs, Typography } from '@mui/material';
import StarBorder from '@mui/icons-material/StarBorder';
import Star from '@mui/icons-material/Star';
import BarChart from '@mui/icons-material/BarChart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import MetricCard from '../../components/common/MetricCard.jsx';
import AvatarGroup from '../../components/common/AvatarGroup.jsx';
import SparkleIcon from '../../components/ui/SparkleIcon.jsx';
import ChartCard from '../../components/ui/ChartCard.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import ProjectAssessmentCard from '../../components/ui/ProjectAssessmentCard.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EvidenceDrawer from '../../components/ui/EvidenceDrawer.jsx';
import { useData } from '../../hooks/useData.js';
import { useToast } from '../../hooks/useToast.js';
import { useAiTerms } from '../../hooks/useAiTerms.js';
import { useActionStore } from '../../store/actionStore.js';
import { useAiEnabled } from '../../store/aiStore.js';
import { fetchProject, fetchProjectRisks } from '../../api/projects.js';
import { getProjectAssessment, explainProjectAnalysis, regenerateProjectAnalysis } from '../../api/ai.js';
import { withRetry } from '../../api/client.js';
import { mapProjectOwners } from '../../api/projects.adapter.js';
import { getProjectStatus, getSeverity } from '../../config/riskLabels.js';
import { paths } from '../../config/paths.js';
import { formatDate } from '../../config/dates.js';
import { useState } from 'react';

/**
 * ProjectDetail — header with status/owners/watch, KPI row, and tabs.
 *
 * One Project Assessment card renders either the deterministic view or the AI
 * view; the AI action lives in the header next to Watch. The cached AI result
 * is never deleted — switching views never calls the API again.
 *
 * REMAINING (extend later):
 *  - annotated health trend with milestone markers
 *  - tabs: Overview / Risks / Dependencies / Team / Activity
 *  - milestone timeline + prevention checklist
 *  - risk drivers list
 */
const ProjectDetail = () => {
  const { projectId } = useParams();
  const { data: project, loading, error, retry } = useData(() => fetchProject(projectId), [projectId]);
  const { data: risks = [], loading: risksLoading, error: risksError } = useData(() => fetchProjectRisks(projectId), [projectId]);
  const { data: assessment } = useData(() => getProjectAssessment(projectId), [projectId]);
  const [tab, setTab] = useState(0);
  const [aiState, setAiState] = useState({ status: 'idle', analysis: null, regenerating: false });
  const [view, setView] = useState('deterministic');
  const { isWatched, toggleWatch } = useActionStore();
  const toast = useToast();

  const [selectedRisk, setSelectedRisk] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // The cached AI analysis (from the page-load GET) is surfaced without any
  // LLM call; the header offers "View AI Assessment" instead of "Explain with AI".
  const aiAnalysis = aiState.analysis ?? assessment?.ai ?? null;
  const aiStatus = aiState.status === 'idle' && aiAnalysis ? 'success' : aiState.status;
  // Global AI settings come from the shared store (loaded once at shell mount),
  // not a per-page fetch — avoids a duplicate /api/ai/settings request.
  const aiEnabled = useAiEnabled();
  const { t } = useAiTerms();
  const hasAi = Boolean(aiAnalysis);
  const busy = aiStatus === 'loading' || aiState.regenerating;

  const handleExplain = async () => {
    setAiState({ status: 'loading', analysis: null, regenerating: false });
    try {
      const analysis = await withRetry(() => explainProjectAnalysis(projectId));
      if (!analysis) {
        setAiState({ status: 'error', analysis: null, regenerating: false });
        toast("Couldn't run the AI analysis.", { severity: 'error' });
        return;
      }
      setAiState({ status: 'success', analysis, regenerating: false });
      setView('ai');
    } catch {
      setAiState({ status: 'error', analysis: null, regenerating: false });
      toast("Couldn't run the AI analysis.", { severity: 'error' });
    }
  };

  const handleRegenerate = async () => {
    if (!hasAi) return;
    setAiState((state) => ({ ...state, regenerating: true }));
    try {
      // A 502 from the backend means "provider failed, previous analysis
      // kept" — retrying would just burn tokens, so do not auto-retry that.
      const analysis = await withRetry(() => regenerateProjectAnalysis(projectId), {
        retryable: (err) =>
          err.isNetworkError ||
          err.status === 429 ||
          err.status === 500 ||
          err.status === 503 ||
          err.status === 504,
      });
      setAiState({ status: 'success', analysis, regenerating: false });
      setView('ai');
      toast('AI analysis regenerated');
    } catch (err) {
      setAiState((state) => ({ ...state, regenerating: false }));
      toast(err?.message ?? "Couldn't regenerate the AI analysis", { severity: 'error' });
    }
  };

  const headerAction = () => {
    if (view === 'ai') {
      return { label: 'View Engineering Signals', icon: <BarChart />, onClick: () => setView('deterministic') };
    }
    if (hasAi) {
      return { label: t('viewAssessment'), icon: <SparkleIcon />, onClick: () => setView('ai') };
    }
    return {
      label: t('explain'),
      icon: <SparkleIcon />,
      disabled: !aiEnabled,
      onClick: handleExplain,
    };
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={retry} />;
  if (!project) return <Typography>Project not found.</Typography>;

  const team = project.teams?.[0];
  const people = mapProjectOwners(project.owners ?? []);
  const action = headerAction();

  return (
    <Box>
      <PageHeader
        title={project.name}
        subtitle={`${team?.name ?? 'No team'} · Target ${formatDate(project.targetDate)}`}
        actions={
          <>
            <StatusBadge config={getProjectStatus(project.status)} size="medium" />
            <Button
              variant="contained"
              color="primary"
              startIcon={busy ? undefined : action.icon}
              disabled={busy || action.disabled}
              onClick={action.onClick}
            >
              {aiStatus === 'loading' ? 'Analyzing…' : aiState.regenerating ? 'Regenerating…' : action.label}
            </Button>
            <Button
              variant="outlined"
              startIcon={isWatched(project.id) ? <Star /> : <StarBorder />}
              onClick={() => {
                toggleWatch(project.id);
                toast(isWatched(project.id) ? 'Project unwatched' : 'Project watched', {
                  actionLabel: 'Undo',
                  action: () => toggleWatch(project.id),
                });
              }}
            >
              {isWatched(project.id) ? 'Watching' : 'Watch'}
            </Button>
          </>
        }
      />

      {/* KPI row */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={6} md={3}><MetricCard label="Health" value={project.healthScore} /></Grid>
        <Grid item xs={6} md={3}><MetricCard label="Delivery confidence" value={`${project.deliveryConfidence}%`} /></Grid>
        <Grid item xs={6} md={3}><MetricCard label="Open risks" value={risks?.length ?? 0} /></Grid>
        <Grid item xs={6} md={3}>
          <Box sx={{ height: '100%', outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-card)', p: 3, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>Owners</Typography>
            <Box sx={{ mt: 1.5 }}><AvatarGroup people={people} max={4} /></Box>
          </Box>
        </Grid>
      </Grid>

      {assessment?.deterministic && (
        <ProjectAssessmentCard
          deterministic={assessment.deterministic}
          ai={aiAnalysis}
          view={view}
          aiStatus={aiStatus}
          regenerating={aiState.regenerating}
          onRegenerate={handleRegenerate}
          onViewSignals={() => setView('deterministic')}
        />
      )}

      {/* Tabs */}
      <Box sx={{ mt: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Overview" />
          <Tab label="Risks" />
          <Tab label="Activity" />
        </Tabs>

        <Box sx={{ mt: 2 }}>
          {tab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <ChartCard
                title="Health trend"
                data={project.trend}
                dataColumns={[{ key: 'date', label: 'Week' }, { key: 'score', label: 'Score' }]}
              >
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={project.trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" fontSize={12} stroke="var(--text-muted)" />
                    <YAxis fontSize={12} stroke="var(--text-muted)" domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <Box sx={{ p: 3, outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-card)', bgcolor: 'background.paper' }}>
                <Typography sx={{ fontWeight: 600 }}>Top driver</Typography>
                <Typography sx={{ color: 'text.secondary', mt: 0.5 }}>{project.topDriver}</Typography>
              </Box>
            </Box>
          )}

          {tab === 1 && (
            risksLoading ? (
              <LoadingState variant="table" />
            ) : risksError ? (
              <Typography sx={{ color: 'var(--red)' }}>Couldn't load risks.</Typography>
            ) : (
              <>
                <DataTable
                  columns={[
                    { key: 'title', label: 'Risk', render: (r) => r.title },
                    { key: 'severity', label: 'Severity', render: (r) => <StatusBadge config={getSeverity(r.severity)} /> },
                    { key: 'confidence', label: 'Confidence', sortable: true },
                    { key: 'trend', label: 'Trend' },
                  ]}
                  rows={risks}
                  emptyTitle="No open risks"
                  emptyDescription="This project has no tracked risks."
                  onRowClick={(risk) => {
                    setSelectedRisk(risk);
                    setDrawerOpen(true);
                  }}
                />
                <EvidenceDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} risk={selectedRisk} />
              </>
            )
          )}

          {tab === 2 && (
            <Typography sx={{ color: 'text.secondary' }}>
              Activity timeline coming here. {/* REMAINING: recent commits/PRs/deploys feed */}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Related areas */}
      <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Linked systems:</Typography>
        {project.knowledgeAreas.map((a) => (
          <Chip key={a.id} component="a" href={paths.system(a.id)} label={a.name} variant="outlined" size="small" clickable />
        ))}
      </Box>
    </Box>
  );
};

export default ProjectDetail;
