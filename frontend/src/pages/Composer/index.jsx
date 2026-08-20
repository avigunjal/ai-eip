import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
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
import Groups from '@mui/icons-material/Groups';
import Verified from '@mui/icons-material/Verified';
import WarningAmber from '@mui/icons-material/WarningAmber';
import LockPerson from '@mui/icons-material/LockPerson';
import CheckCircle from '@mui/icons-material/CheckCircle';
import TrendingDown from '@mui/icons-material/TrendingDown';
import ArrowForward from '@mui/icons-material/ArrowForward';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import Refresh from '@mui/icons-material/Refresh';
import SaveAlt from '@mui/icons-material/SaveAlt';
import PageHeader from '../../components/common/PageHeader.jsx';
import AiDisclaimer from '../../components/common/AiDisclaimer.jsx';
import Surface from '../../components/styled/Surface.jsx';
import MetricCard from '../../components/common/MetricCard.jsx';
import AvatarGroup from '../../components/common/AvatarGroup.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import SparkleIcon from '../../components/ui/SparkleIcon.jsx';
import { fadeSlideIn } from '../../config/animations.js';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import { fetchProjects, fetchProjectRisks } from '../../api/projects.js';
import { fetchPeople } from '../../api/people.js';
import { fetchKnowledgeAreas } from '../../api/knowledge.js';
import { fetchComposerTeams, fetchRecommendations, createScenario } from '../../api/teamComposer.js';
import { explainComposition, getCompositionAssessment, regenerateCompositionExplanation } from '../../api/ai.js';
import { withRetry } from '../../api/client.js';
import { useData } from '../../hooks/useData.js';
import { useToast } from '../../hooks/useToast.js';
import { useAiTerms } from '../../hooks/useAiTerms.js';
import { useAiEnabled } from '../../store/aiStore.js';
import { modelLabel } from '../../config/modelLabel.js';
import { formatRelative } from '../../config/dates.js';
import { paths } from '../../config/paths.js';
import { SUSTAINABLE_CAPACITY } from '../../config/constants.js';

/**
 * AI Composer — composes an engineering team for a selected project using the
 * full engineering relationship graph: Projects → Teams → People → Skills →
 * Knowledge → Risk. Every recommendation comes from the backend composer
 * (deterministic capability matching) and is explainable ("Why this team?").
 *
 * The "Why this team?" panel follows the single-card AI pattern: the
 * deterministic engineering signals are always shown, "Explain with AI" runs
 * the LLM once (cached per project), and the header flips between
 * "View AI Assessment" / "Regenerate with AI" / "View Engineering Signals".
 *
 * REMAINING (extend later):
 *  - drag/drop people between draft / confirmed slots
 *  - generative "compose for a new goal" free-text entry
 */
const Composer = () => {
  const [projectId, setProjectId] = useState(null);
  const [aiState, setAiState] = useState({ status: 'idle', view: 'deterministic', explanation: null, meta: null });
  const [creatingScenario, setCreatingScenario] = useState(false);
  const toast = useToast();
  // Global AI settings come from the shared store (loaded once at shell mount),
  // not a per-page fetch — avoids a duplicate /api/ai/settings request.
  const aiEnabled = useAiEnabled();
  const { t } = useAiTerms();

  const projectsQuery = useData(fetchProjects);
  const teamsQuery = useData(fetchComposerTeams);
  const areasQuery = useData(fetchKnowledgeAreas);
  const peopleQuery = useData(fetchPeople);
  const projects = projectsQuery.data ?? [];

  const defaultProject = projects.find((p) => p.status !== 'paused' && p.status !== 'complete') ?? projects[0];
  const activeProjectId = projectId ?? defaultProject?.id ?? null;

  useEffect(() => {
    let cancelled = false;
    setAiState({ status: 'idle', view: 'deterministic', explanation: null, meta: null });
    if (!activeProjectId) return undefined;
    getCompositionAssessment(activeProjectId)
      .then((assessment) => {
        if (cancelled || !assessment?.ai) return;
        setAiState({
          status: 'idle',
          view: 'deterministic',
          explanation: assessment.ai.explanation,
          meta: {
            source: assessment.ai.source,
            provider: assessment.ai.provider,
            model: assessment.ai.model,
            generatedAt: assessment.ai.generatedAt,
          },
        });
      })
      .catch(() => {
        // Cached AI is optional — the deterministic signals are always shown.
      });
    return () => { cancelled = true; };
  }, [activeProjectId]);

  const handleExplain = async () => {
    setAiState((state) => ({ ...state, status: 'loading' }));
    try {
      const result = await withRetry(() => explainComposition(activeProjectId));
      const isLlm = result.source === 'llm';
      setAiState({
        status: 'success',
        view: isLlm ? 'ai' : 'deterministic',
        explanation: isLlm ? result.explanation : null,
        meta: isLlm
          ? { source: result.source, provider: result.provider, model: result.model, generatedAt: result.generatedAt }
          : null,
      });
    } catch (err) {
      setAiState((state) => ({ ...state, status: 'idle' }));
      toast(err?.message ?? "Couldn't explain the recommendation", { severity: 'error' });
    }
  };

  const handleRegenerate = async () => {
    setAiState((state) => ({ ...state, status: 'loading' }));
    try {
      // A 502 means "provider failed, previous explanation kept" — do not retry.
      const result = await withRetry(() => regenerateCompositionExplanation(activeProjectId), {
        retryable: (err) =>
          err.isNetworkError ||
          err.status === 429 ||
          err.status === 500 ||
          err.status === 503 ||
          err.status === 504,
      });
      setAiState({
        status: 'success',
        view: 'ai',
        explanation: result.explanation,
        meta: { source: result.source, provider: result.provider, model: result.model, generatedAt: result.generatedAt },
      });
      toast('Explanation regenerated');
    } catch (err) {
      setAiState((state) => ({ ...state, status: 'idle' }));
      toast(err?.message ?? "Couldn't regenerate the explanation", { severity: 'error' });
    }
  };

  const handleCreateProposal = async () => {
    setCreatingScenario(true);
    try {
      const result = await withRetry(() => createScenario(activeProjectId));
      toast(`AI team recommendation saved · ${result.scenarioId}`);
    } catch (err) {
      toast(err?.message ?? "Couldn't save the AI team recommendation", { severity: 'error' });
    } finally {
      setCreatingScenario(false);
    }
  };

  const recommendationQuery = useData(
    () => (activeProjectId ? fetchRecommendations(activeProjectId) : Promise.resolve(null)),
    [activeProjectId],
  );
  const risksQuery = useData(
    () => (activeProjectId ? fetchProjectRisks(activeProjectId) : Promise.resolve([])),
    [activeProjectId],
  );

  const queries = [projectsQuery, teamsQuery, areasQuery, peopleQuery, recommendationQuery, risksQuery];
  const loading = queries.some((query) => query.loading);
  const error = queries.find((query) => query.error)?.error ?? null;

  if (loading) return <LoadingState />;
  if (error) {
    return <ErrorState onRetry={() => queries.forEach((query) => query.retry())} />;
  }

  const project = projects.find((p) => p.id === activeProjectId) ?? projects[0];
  const recommendation = recommendationQuery.data;
  const teams = teamsQuery.data ?? [];
  const areas = areasQuery.data ?? [];
  const risks = risksQuery.data ?? [];
  const peopleById = new Map((peopleQuery.data ?? []).map((person) => [person.id, person]));

  const team = teams.find((t) => t.id === project.teamIds[0]) ?? null;
  const projectAreas = areas.filter((area) => (area.linkedProjectIds ?? []).includes(project.id));
  const singleOwnerAreas = projectAreas.filter((area) => (area.expertIds ?? []).length <= 1);
  const riskExposure = risks.filter((risk) => risk.severity === 'critical' || risk.severity === 'high').length;
  const coverage = recommendation?.assessment?.coverageScore ?? 0;

  const composition = (recommendation?.recommendedTeam ?? []).map((person) => {
    const detail = peopleById.get(person.id) ?? {};
    return {
      ...person,
      initials: detail.initials ?? initialsOf(person.name),
      avatarColor: detail.avatarColor,
    };
  });

  // Projected capacity once the recommended team is added: sustainable FTE
  // grows by the available FTE they bring, so pressure = committed / (sustainable + delta).
  const fteDelta = composition.reduce((sum, person) => sum + (person.availabilityFte ?? 0), 0);
  const sustainableFte = team?.sustainableCapacityFte;
  const committedFte = (team?.committedFte ?? 0) + (team?.unplannedFte ?? 0);
  const afterCapacity =
    sustainableFte && sustainableFte + fteDelta > 0
      ? Math.round((committedFte / (sustainableFte + fteDelta)) * 100)
      : null;
  const capacityImprovement = team && afterCapacity != null ? team.capacityPct - afterCapacity : null;

  // Recommendation summary — the value story before the names.
  const matchedCount = recommendation?.assessment?.matchedSkills?.length ?? 0;
  const requiredCount = recommendation?.requiredSkills?.length ?? 0;
  const fullCoverage = requiredCount > 0 && matchedCount >= requiredCount;
  const summaryChecks = [
    {
      key: 'skills',
      ok: fullCoverage,
      label: fullCoverage
        ? `Covers all ${requiredCount} critical skills`
        : `Covers ${matchedCount}/${requiredCount} critical skills`,
    },
    {
      key: 'capacity',
      ok: true,
      label: `Adds +${fteDelta.toFixed(1)} FTE of delivery capacity`,
    },
    {
      key: 'knowledge',
      ok: singleOwnerAreas.length === 0,
      label:
        singleOwnerAreas.length === 0
          ? 'No single-owner dependency at bus-factor risk'
          : `${singleOwnerAreas.length} single-owner system${singleOwnerAreas.length > 1 ? 's' : ''} at bus-factor risk`,
    },
    {
      key: 'risk',
      ok: riskExposure === 0,
      label:
        riskExposure === 0
          ? 'No open high/critical project risks'
          : `${riskExposure} open high/critical risk${riskExposure > 1 ? 's' : ''} in scope`,
    },
  ];

  // Decision impact — projected before → after of acting on the recommendation.
  const afterRisk = fullCoverage ? 0 : riskExposure;
  const afterSingleOwner = fullCoverage ? 0 : singleOwnerAreas.length;
  const decisionImpact = [
    {
      label: 'Capacity',
      before: team ? `${team.capacityPct}%` : '–',
      after: afterCapacity != null ? `${afterCapacity}%` : '–',
      improved: afterCapacity != null && team != null && afterCapacity < team.capacityPct,
    },
    {
      label: 'Single-owner systems',
      before: String(singleOwnerAreas.length),
      after: String(afterSingleOwner),
      improved: afterSingleOwner < singleOwnerAreas.length,
    },
    {
      label: 'Open high/critical risks',
      before: String(riskExposure),
      after: String(afterRisk),
      improved: afterRisk < riskExposure,
    },
  ];

  const rejected = (recommendation?.rejectedCandidates ?? []).map((person) => {
    const detail = peopleById.get(person.id) ?? {};
    return {
      ...person,
      initials: detail.initials ?? initialsOf(person.name),
      avatarColor: detail.avatarColor,
    };
  });

  const rationale = [
    coverage >= 70
      ? `Covers ${coverage}% of the project's primary skill areas.`
      : `Only ${coverage}% of primary skill areas have an expert on the team.`,
    singleOwnerAreas.length
      ? `${singleOwnerAreas.length} single-owner system${singleOwnerAreas.length > 1 ? 's' : ''} increase bus-factor risk.`
      : null,
    riskExposure ? `${riskExposure} open critical/high risk${riskExposure > 1 ? 's' : ''} affect this project.` : null,
    recommendation?.tradeOff,
  ].filter(Boolean);

  const aiAssessment =
    riskExposure === 0 && coverage >= 70
      ? 'Well-positioned'
      : coverage < 50 || riskExposure >= 3
        ? 'High Risk'
        : 'Needs attention';

  const assessmentConfig =
    aiAssessment === 'Well-positioned'
      ? { label: 'Well-positioned', color: 'var(--teal)', bg: 'var(--teal-lighter)' }
      : aiAssessment === 'High Risk'
        ? { label: 'High Risk', color: 'var(--red)', bg: 'var(--red-lighter)' }
        : { label: 'Needs attention', color: 'var(--amber)', bg: 'var(--amber-lighter)' };

  const hasAi = !!aiState.explanation && aiState.meta?.source === 'llm';
  const aiView = aiState.view === 'ai' && hasAi;
  const busy = aiState.status === 'loading';
  const recommendationConfidence =
    aiView
      ? aiState.explanation.confidence ?? recommendation?.assessment?.confidence
      : recommendation?.assessment?.confidence;

  return (
    <Box>
      <PageHeader
        title="AI Composer"
        subtitle={t('subtitleComposer')}
      />

      <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Action workspace header */}
        <Surface sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Find the right engineering team for {project.name}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 0.75 }}>
                <SparkleIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                  {t('analyzedCount')} {peopleQuery.data?.length ?? 0} engineers · {areas.length} skill areas · {risks.length} risks
                  {recommendation?.assessment?.confidence != null && ` · Confidence ${recommendation.assessment.confidence}%`}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <TextField
                select
                label="Project"
                value={project.id}
                onChange={(e) => setProjectId(e.target.value)}
                size="small"
                sx={{ minWidth: 240 }}
              >
                {projects.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                ))}
              </TextField>
              <Button
                variant="contained"
                startIcon={creatingScenario ? <CircularProgress size={16} /> : <SaveAlt />}
                disabled={!activeProjectId || creatingScenario}
                onClick={handleCreateProposal}
                sx={{ textTransform: 'none', height: 40 }}
              >
                {creatingScenario ? 'Saving…' : t('generateTeam')}
              </Button>
            </Box>
          </Box>
        </Surface>

        {/* KPI strip — explained, not just displayed */}
        <Grid container spacing={3}>
          <Grid item xs={6} sm={3}>
            <MetricCard
              label="Team capacity"
              value={
                team && afterCapacity != null
                  ? `${team.capacityPct}% → ${afterCapacity}%`
                  : `${team?.capacityPct ?? '–'}%`
              }
              icon={<Groups color="info" />}
              detail={
                team && afterCapacity != null ? (
                  capacityImprovement != null && capacityImprovement > 0 ? (
                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: 12, fontWeight: 600, color: 'var(--teal)' }}>
                      <TrendingDown sx={{ fontSize: 14 }} /> {capacityImprovement}% overload reduction
                    </Box>
                  ) : (
                    `Projected utilization ${afterCapacity}% after recommendation`
                  )
                ) : team ? (
                  team.capacityPct > SUSTAINABLE_CAPACITY
                    ? `⚠ Slightly overloaded · ${team.capacityPct - SUSTAINABLE_CAPACITY}% over sustainable`
                    : '✓ Within sustainable load'
                ) : undefined
              }
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricCard
              label="Skill coverage"
              value={`${coverage}%`}
              icon={<Verified color="secondary" />}
              detail={
                coverage >= 70
                  ? '✓ All critical skills covered'
                  : coverage >= 50
                    ? '⚠ Some critical skills missing'
                    : '✕ Critical skills not covered'
              }
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricCard
              label="Open risk"
              value={riskExposure}
              icon={<WarningAmber color="warning" />}
              detail={
                riskExposure === 0
                  ? '✓ No open high/critical risks'
                  : `⚠ ${riskExposure} open high/critical risk${riskExposure > 1 ? 's' : ''}`
              }
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricCard
              label="Single-owner"
              value={singleOwnerAreas.length}
              icon={<LockPerson color="primary" />}
              detail={
                singleOwnerAreas.length === 0
                  ? '✓ All areas have backups'
                  : `⚠ ${singleOwnerAreas.length} area${singleOwnerAreas.length > 1 ? 's' : ''} at bus-factor risk`
              }
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
        {/* Recommended composition */}
        <Grid item size={{ xs: 12, lg: 3.6 }}>
          <Surface sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Typography sx={{ fontWeight: 600 }}>Recommended team</Typography>
              <Chip size="small" label={`${team?.name ?? 'Team'} · ${composition.length} people`} variant="outlined" />
            </Box>

            {/* Recommendation summary — value before names */}
            <Box
              sx={{
                mb: 2,
                p: 1.5,
                borderRadius: 'var(--radius-control)',
                border: '1px solid color-mix(in srgb, var(--primary) 30%, transparent)',
                bgcolor: 'var(--primary-lighter)',
                animation: `${fadeSlideIn} 300ms ease`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <SparkleIcon sx={{ fontSize: 15, color: 'var(--ai)' }} />
                <Typography sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)' }}>
                  {t('recommendation')}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 14, fontWeight: 700, mt: 0.75 }}>Recommended staffing plan for {project.name}</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.75 }}>
                {summaryChecks.map((check) => (
                  <Box key={check.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    {check.ok ? (
                      <CheckCircle sx={{ fontSize: 15, color: 'var(--teal)' }} />
                    ) : (
                      <WarningAmber sx={{ fontSize: 15, color: 'var(--amber)' }} />
                    )}
                    <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{check.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box key={activeProjectId} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {composition.map((person, index) => {
                const matchCount = person.matchedSkills?.length ?? 0;
                return (
                  <Box
                    key={person.id}
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1.5,
                      outline: '1px solid',
                      outlineColor: 'divider',
                      borderRadius: 'var(--radius-control)',
                      animation: `${fadeSlideIn} 300ms ease both`,
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <AvatarGroup people={[person]} max={1} size={32} />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Link to={paths.person(person.id)} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                          {person.name}
                        </Link>
                        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{person.role}</Typography>
                        {person.reason && (
                          <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.25 }}>{person.reason}</Typography>
                        )}
                      </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', flexShrink: 0, flexBasis: { xs: '100%', xl: 'auto' }, justifyContent: { xs: 'flex-start', xl: 'flex-end' }, pl: { xs: 5.5, xl: 0 } }}>
                      <Tooltip title={`${matchCount} matching skill${matchCount === 1 ? '' : 's'} for this project`}>
                        <Chip
                          size="small"
                          label={`${matchCount} skills`}
                          sx={{
                            height: 18,
                            fontSize: 10,
                            fontWeight: 600,
                            borderRadius: 999,
                            bgcolor: 'var(--ai-lighter)',
                            color: 'var(--ai)',
                            border: '1px solid color-mix(in srgb, var(--ai) 30%, transparent)',
                            '& .MuiChip-label': { px: 0.75 },
                          }}
                        />
                      </Tooltip>
                      {typeof person.availabilityFte === 'number' && (
                        <Chip
                          size="small"
                          label={`${person.availabilityFte.toFixed(1)} FTE`}
                          sx={{
                            height: 18,
                            fontSize: 10,
                            fontWeight: 600,
                            borderRadius: 999,
                            bgcolor: 'var(--info-lighter)',
                            color: 'var(--info)',
                            border: '1px solid color-mix(in srgb, var(--info) 30%, transparent)',
                            '& .MuiChip-label': { px: 0.75 },
                          }}
                        />
                      )}
                      {typeof person.fitScore === 'number' && (
                        <Chip
                          size="small"
                          label={`fit ${person.fitScore}%`}
                          sx={{
                            height: 18,
                            fontSize: 10,
                            fontWeight: 600,
                            borderRadius: 999,
                            bgcolor: person.fitScore >= 80 ? 'var(--teal-lighter)' : 'var(--amber-lighter)',
                            color: person.fitScore >= 80 ? 'var(--teal)' : 'var(--amber)',
                            border: `1px solid color-mix(in srgb, ${person.fitScore >= 80 ? 'var(--teal)' : 'var(--amber)'} 30%, transparent)`,
                            '& .MuiChip-label': { px: 0.75 },
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {rejected.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary' }}>
                  Why not selected?
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                  {rejected.map((person) => (
                    <Box
                      key={person.id}
                      sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-control)' }}
                    >
                      <AvatarGroup people={[person]} max={1} size={28} />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{person.name}</Typography>
                        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{person.rejectionReason}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </Surface>
        </Grid>

        {/* Rationale */}
        <Grid item size={{ xs: 12, lg: 8.4 }}>
          <Surface sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <AutoAwesome color="secondary" />
                <Typography sx={{ fontWeight: 600 }}>{t('whyRecommended')}</Typography>
                <Chip
                  size="small"
                  variant="outlined"
                  color={aiView ? 'primary' : 'default'}
                  label={aiView ? `✦ AI · ${modelLabel(aiState.meta.model)}` : 'Deterministic · Engineering signals'}
                />
              </Box>
              {busy ? (
                <Button size="small" disabled startIcon={<CircularProgress size={14} />} sx={{ textTransform: 'none' }}>
                  Analyzing…
                </Button>
              ) : aiView ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Refresh sx={{ fontSize: 15 }} />}
                    onClick={handleRegenerate}
                    sx={{ textTransform: 'none' }}
                  >
                    Regenerate with AI
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setAiState((state) => ({ ...state, view: 'deterministic' }))}
                    sx={{ textTransform: 'none' }}
                  >
                    View Engineering Signals
                  </Button>
                </Box>
              ) : hasAi ? (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<SparkleIcon />}
                  onClick={() => setAiState((state) => ({ ...state, view: 'ai' }))}
                  sx={{ textTransform: 'none' }}
                >
                  {t('viewAssessment')}
                </Button>
              ) : (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<SparkleIcon />}
                  disabled={!aiEnabled}
                  onClick={handleExplain}
                  sx={{ textTransform: 'none' }}
                >
                  {t('explain')}
                </Button>
              )}
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
              Why this team
            </Typography>
            {aiView ? (
              <Box component="ol" sx={{ m: 0, mt: 0.5, pl: 2.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {[
                  aiState.explanation.whyThisTeam,
                  aiState.explanation.tradeOffs && `Trade-off considered: ${aiState.explanation.tradeOffs}`,
                ]
                  .filter(Boolean)
                  .map((point, i) => (
                    <Typography component="li" key={i} sx={{ fontSize: 13, color: 'text.secondary' }}>
                      {point}
                    </Typography>
                  ))}
              </Box>
            ) : (
              <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5 }}>
                {recommendation?.rationale ??
                  'People are matched to the project by capability coverage; teams inherit the capacity, skills, and risk of the engineers and systems they touch.'}
              </Typography>
            )}

            <Typography sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary', mt: 1.5 }}>
              Impact
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5 }}>
              {aiView
                ? aiState.explanation.expectedImpact ??
                  recommendation?.impact ??
                  `${projectAreas.length} systems in scope, ${singleOwnerAreas.length} with a single owner, ${riskExposure} open high/critical risk.`
                : recommendation?.impact ??
                  `${projectAreas.length} systems in scope, ${singleOwnerAreas.length} with a single owner, ${riskExposure} open high/critical risk. Missing coverage means slower delivery and higher bus-factor.`}
            </Typography>

            {aiView && (
              <Box
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: '1px solid',
                  borderTopColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  flexWrap: 'wrap',
                  animation: `${fadeSlideIn} 300ms ease`,
                }}
              >
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
                  {aiState.explanation.confidence != null && aiState.explanation.confidence > 0
                    ? `${t('confidence')} ${aiState.explanation.confidence}%`
                    : t('generatedAnalysis')}
                </Typography>
                <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>
                  Powered by {modelLabel(aiState.meta.model)} · Generated {formatRelative(aiState.meta.generatedAt)}
                </Typography>
              </Box>
            )}

            {/* Decision impact — projected before → after */}
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderTopColor: 'divider' }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary' }}>
                Decision impact
              </Typography>
              <Typography sx={{ fontSize: 12, color: 'text.disabled', mt: 0.25 }}>
                Projected after the recommended team
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mt: 1 }}>
                {decisionImpact.map((row) => (
                  <Box key={row.label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{row.label}</Typography>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>{row.before}</Typography>
                      <ArrowForward sx={{ fontSize: 13, color: 'text.disabled' }} />
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: row.improved ? 'var(--teal)' : 'text.secondary' }}>
                        {row.after}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box sx={{ mt: 'auto', pt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {recommendationConfidence != null && (
                <Box sx={{ p: 1.5, borderRadius: 'var(--radius-control)', border: '1px solid', borderColor: 'divider', bgcolor: 'var(--surface-subtle)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary' }}>
                      Recommendation confidence
                    </Typography>
                    <Typography sx={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)' }}>{recommendationConfidence}%</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 12, color: 'text.disabled', mt: 0.75 }}>Based on</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                    {['Skills coverage', 'Capacity', 'Risk coverage', 'Historical patterns'].map((basis) => (
                      <Box key={basis} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <CheckCircle sx={{ fontSize: 15, color: 'var(--teal)' }} />
                        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{basis}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary' }}>
                  {t('assessment')}
                </Typography>
                <StatusBadge config={assessmentConfig} />
              </Box>
              <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>
                {recommendation?.requiredSkills?.length ?? 0} required skills
              </Typography>
              <AiDisclaimer sx={{ mt: 0 }} />
            </Box>
          </Surface>
        </Grid>
      </Grid>
      </Box>
    </Box>
  );
};

/** Derive 2-letter initials from a full name (fallback when no person record). */
function initialsOf(name) {
  return (name ?? '')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default Composer;
