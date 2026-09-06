import { useEffect, useMemo, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router';
import { Box, Button, Typography } from '@mui/material';
import Check from '@mui/icons-material/Check';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import { fetchDecisionDetail } from '../../api/decisionDetail.js';
import { recommendationService } from '../../api/decisionRecommendation.js';
import { useData } from '../../hooks/useData.js';
import { useToast } from '../../hooks/useToast.js';
import { useDecisionRecord, useDecisionStore } from '../../store/decisionStore.js';
import { paths } from '../../config/paths.js';
import { fadeSlideIn } from '../../config/animations.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import DecisionDetailSkeleton from './components/DecisionDetailSkeleton.jsx';
import DecisionDetailNotFound from './components/DecisionDetailNotFound.jsx';
import DecisionHeader from './components/DecisionHeader.jsx';
import DecisionSection from './components/DecisionSection.jsx';
import DecisionProblem from './components/DecisionProblem.jsx';
import DecisionEvidence from './components/DecisionEvidence.jsx';
import DecisionOptions from './components/DecisionOptions.jsx';
import ScenarioComparison from './components/ScenarioComparison.jsx';
import AIRecommendation from './components/AIRecommendation.jsx';
import RecommendationReasoning from './components/RecommendationReasoning.jsx';
import BusinessImpact from './components/BusinessImpact.jsx';
import DecisionActionPanel from './components/DecisionActionPanel.jsx';
import DecisionConfirmDialog from './components/DecisionConfirmDialog.jsx';

/**
 * Decision Workspace (Screen 2, spec §6–§21).
 *
 * The page owns only orchestration: fetching the decision, deriving the
 * evidence-driven recommendation, and tracking the user's selected option and
 * confirmation.
 *
 * Action model: AI recommends; the human decides. `selectedId` starts null
 * (nothing is auto-confirmed). `Take action` is a navigation CTA — it only
 * commits nothing; the single commitment point is the final "Record decision"
 * button, guarded by a confirmation dialog.
 */
const DecisionDetail = () => {
  const { decisionId } = useParams();
  const { data, loading, error, retry } = useData(() => fetchDecisionDetail(decisionId), [decisionId]);
  const recorded = useDecisionRecord(decisionId);
  const toast = useToast();

  const explanation = useMemo(() => (data ? recommendationService.explain(data) : null), [data]);
  const recommendedId = explanation?.recommendedOptionId ?? null;

  const [selectedId, setSelectedId] = useState(null);
  const [focusId, setFocusId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);

  const options = useMemo(() => data?.options ?? [], [data]);
  const selected = selectedId ? (options.find((o) => o.id === selectedId) ?? null) : null;

  // Reset transient state when navigating between decisions from the breadcrumb.
  useEffect(() => {
    setSelectedId(null);
    setFocusId(null);
    setShowGuidance(false);
    setConfirmOpen(false);
  }, [decisionId]);

  // Keep the selection valid for the current decision; never auto-select — the
  // human decides. Nulling resets to "no path selected".
  useEffect(() => {
    if (data) {
      setSelectedId((current) => (data.options.some((o) => o.id === current) ? current : null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id]);

  // A choice dismisses the "select a path" hint; otherwise it fades out on its own.
  useEffect(() => {
    if (selectedId) setShowGuidance(false);
  }, [selectedId]);
  useEffect(() => {
    if (!showGuidance) return undefined;
    const timer = setTimeout(() => setShowGuidance(false), 6000);
    return () => clearTimeout(timer);
  }, [showGuidance]);

  // "View simulation" highlight decays after a moment.
  useEffect(() => {
    if (!focusId) return undefined;
    const timer = setTimeout(() => setFocusId(null), 4200);
    return () => clearTimeout(timer);
  }, [focusId]);

  if (loading) return <DecisionDetailSkeleton />;
  if (error) {
    return (
      <ErrorState
        onRetry={retry}
        actions={
          <Button component={RouterLink} to={paths.decisionIntelligence} variant="outlined" sx={{ textTransform: 'none', fontWeight: 600 }}>
            Back to decisions
          </Button>
        }
      />
    );
  }
  if (!data) return <DecisionDetailNotFound />;

  const smoothScroll = (id, block = 'start') => {
    const element = document.getElementById(id);
    if (!element) return;
    const reduced = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    element.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block });
  };

  const handleSelect = (optionId) => setSelectedId(optionId);
  const handleSimulate = (optionId) => {
    setSelectedId(optionId);
    setFocusId(optionId);
    smoothScroll('comparison-section', 'start');
  };
  const handleTakeAction = () => {
    if (selected) {
      smoothScroll('decision-section', 'center');
    } else {
      setShowGuidance(true);
      smoothScroll('options-section', 'start');
    }
  };
  const handleRecord = () => {
    if (!selected) return;
    useDecisionStore.getState().record(data.id, selected);
    setConfirmOpen(false);
    setShowGuidance(false);
    toast('Decision recorded successfully.');
  };

  return (
    <Box sx={{ maxWidth: 1140, width: '100%', minWidth: 0, mx: 'auto' }}>
      <DecisionHeader
        detail={data}
        recorded={Boolean(recorded)}
        onSimulate={() => smoothScroll('options-section', 'start')}
        onTakeAction={handleTakeAction}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 3 }}>
        <DecisionSection
          step="01"
          kicker="Problem"
          title="What's at stake"
          copy="The decision on the table and the signals currently behind it."
        >
          <DecisionProblem problem={data.problem} />
        </DecisionSection>

        <DecisionSection
          step="02"
          kicker="Evidence"
          title="What AI-EIP sees"
          copy="The recorded engineering signals this decision is grounded in."
        >
          <DecisionEvidence evidence={data.evidence} />
        </DecisionSection>

        <DecisionSection
          id="options-section"
          step="03"
          kicker="Options"
          title="Possible paths forward"
          copy="Three feasible paths were evaluated — including staying with the current plan."
        >
          {showGuidance && (
            <Box
              sx={{
                mb: 1.5,
                p: 1,
                pr: 1.5,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                borderRadius: 'var(--radius-control)',
                bgcolor: 'var(--surface-subtle)',
                outline: '1px solid',
                outlineColor: 'divider',
                animation: `${fadeSlideIn} 200ms ease both`,
              }}
            >
              <InfoOutlined sx={{ fontSize: 16, color: 'var(--primary)' }} />
              <Typography component="span" sx={{ fontSize: 13, color: 'text.secondary' }}>
                Select a path before recording your decision.
              </Typography>
            </Box>
          )}
          <DecisionOptions
            options={data.options}
            selectedId={selectedId}
            recommendedId={recommendedId}
            onSelect={handleSelect}
            onSimulate={handleSimulate}
          />
        </DecisionSection>

        <DecisionSection
          id="comparison-section"
          step="04"
          kicker="Simulate"
          title="Compare expected outcomes"
          copy="Simulated outcomes for each path based on the recorded signals and option deltas."
        >
          {focusId && selected && (
            <Box
              sx={{
                mb: 1.5,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                p: 1,
                pr: 1.5,
                borderRadius: 'var(--radius-control)',
                bgcolor: 'var(--primary-lighter)',
                outline: '1px solid',
                outlineColor: 'color-mix(in srgb, var(--primary) 35%, transparent)',
                animation: `${fadeSlideIn} 200ms ease both`,
              }}
            >
              <Check sx={{ fontSize: 16, color: 'var(--primary)' }} />
              <Typography component="span" sx={{ fontSize: 13, fontWeight: 600 }}>
                Option {selected.id} selected for comparison
              </Typography>
            </Box>
          )}
          <ScenarioComparison
            outcomeRows={data.outcomeRows}
            options={data.options}
            scores={explanation.optionScores}
            selectedId={selectedId}
            recommendedId={recommendedId}
            focusId={focusId}
          />
        </DecisionSection>

        <DecisionSection
          step="05"
          kicker="Recommendation"
          title="AI recommendation"
          copy="The ranked recommendation, the reasons behind it, and the trade-offs to weigh."
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <AIRecommendation explanation={explanation} options={data.options} selectedId={selectedId} />
            <RecommendationReasoning explanation={explanation} />
          </Box>
        </DecisionSection>

        <DecisionSection step="06" kicker="Impact" title="Impact if we act">
          <BusinessImpact explanation={explanation} />
        </DecisionSection>
      </Box>

      <DecisionActionPanel
        selected={selected}
        recommendedId={recommendedId}
        recorded={recorded}
        onRecord={() => setConfirmOpen(true)}
        onUpdate={() => setConfirmOpen(true)}
      />

      <DecisionConfirmDialog
        open={confirmOpen && Boolean(selected)}
        decision={data}
        selected={selected}
        recorded={Boolean(recorded)}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleRecord}
      />
    </Box>
  );
};

export default DecisionDetail;