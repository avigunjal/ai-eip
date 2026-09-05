import { useState } from 'react';
import { Box, Button } from '@mui/material';
import Add from '@mui/icons-material/Add';
import PageHeader from '../../components/common/PageHeader.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import RecognitionTabs from './components/RecognitionTabs.jsx';
import RecognitionOverview from './RecognitionOverview.jsx';
import RecognitionAwardsView from './RecognitionAwardsView.jsx';
import RecognitionComposer from './components/RecognitionComposer.jsx';
import RecognitionDetailPanel from './components/RecognitionDetailPanel.jsx';
import { useRecognitionData } from './hooks/useRecognitionData.js';

/**
 * Recognition — premium, evidence-driven milestone experience. Navigation tabs
 * lead to the Overview dashboard or an award-filtered view; the composer keeps
 * the existing backend contract (personId + type + summary).
 */
const Recognition = () => {
  const { derived, loading, error, retry } = useRecognitionData();
  const [tab, setTab] = useState('overview');
  const [composerOpen, setComposerOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  if (loading) return <LoadingState variant="grid" sx={{ mt: 3 }} />;
  if (error) return <ErrorState onRetry={retry} />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <PageHeader
        title="Recognition"
        subtitle="Celebrating real impact. Powered by engineering signals, verified with evidence."
        actions={
          <Button variant="contained" startIcon={<Add />} onClick={() => setComposerOpen(true)}>
            Nominate / Create Recognition
          </Button>
        }
      />

      <RecognitionTabs value={tab} onChange={setTab} />

      {tab === 'overview' ? (
        <RecognitionOverview derived={derived} onNavigate={setTab} onApproved={retry} onOpenDetail={setDetailItem} />
      ) : (
        <RecognitionAwardsView levelKey={tab} items={derived.items} onApproved={retry} onOpenDetail={setDetailItem} />
      )}

      <RecognitionComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onSubmitted={retry}
      />

      <RecognitionDetailPanel
        key={detailItem?.id ?? 'none'}
        item={detailItem}
        onClose={() => setDetailItem(null)}
        onApproved={retry}
      />
    </Box>
  );
};

export default Recognition;
