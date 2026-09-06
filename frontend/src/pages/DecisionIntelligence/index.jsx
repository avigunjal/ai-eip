import { useState } from 'react';
import { Box, Button, Skeleton } from '@mui/material';
import Add from '@mui/icons-material/Add';
import PageHeader from '../../components/common/PageHeader.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import DecisionSummaryCards from './components/DecisionSummaryCards.jsx';
import DecisionIntelligenceBanner from './components/DecisionIntelligenceBanner.jsx';
import DecisionFilters from './components/DecisionFilters.jsx';
import DecisionInbox from './components/DecisionInbox.jsx';
import DecisionOutcomes from './components/DecisionOutcomes.jsx';
import { fetchDecisions } from '../../api/decisionIntelligence.js';
import { useData } from '../../hooks/useData.js';
import { useToast } from '../../hooks/useToast.js';

/**
 * Decision Intelligence — Screen 1: Decision Inbox.
 *
 * From engineering signals to decisions that need attention: KPI summary,
 * intelligence banner, category filters, and a data-driven inbox of decisions.
 * The filtered list is derived from the source dataset (single source of
 * truth, no duplicated arrays). Screen 2 (Decision Workspace) is explicitly
 * out of scope and only has a placeholder route.
 */
const DecisionIntelligence = () => {
  const { data: decisions, loading, error, retry } = useData(fetchDecisions, []);
  const [category, setCategory] = useState('all');
  const toast = useToast();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <PageHeader
          title="Decision Intelligence"
          subtitle="From engineering signals to confident decisions. Explore, simulate, and take action."
          actions={
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => toast('Decision creation is coming soon.')}
            >
              New decision
            </Button>
          }
        />
        <LoadingState variant="grid" />
        <Box sx={{ px: 2, py: 1.5 }}>
          <Skeleton variant="rounded" height={64} sx={{ borderRadius: 'var(--radius-control)' }} />
        </Box>
        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ px: 2, py: 1.5 }}>
            <Skeleton variant="text" width={380} />
          </Box>
        </Box>
        <DecisionInbox decisions={[]} loading />
      </Box>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load decision intelligence"
        message="We couldn't retrieve the latest decision data."
        onRetry={retry}
      />
    );
  }

  const all = decisions ?? [];
  const visible = category === 'all' ? all : all.filter((d) => d.type === category);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <PageHeader
        title="Decision Intelligence"
        subtitle="From engineering signals to confident decisions. Explore, simulate, and take action."
        actions={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => toast('Decision creation is coming soon.')}
          >
            New decision
          </Button>
        }
      />

      <DecisionSummaryCards decisions={all} />

      <DecisionIntelligenceBanner onLearnMore={() => toast('The Decision Intelligence guide is coming soon')} />

      <DecisionFilters value={category} onChange={setCategory} decisions={all} />

      <DecisionInbox decisions={visible} />

      <DecisionOutcomes />
    </Box>
  );
};

export default DecisionIntelligence;