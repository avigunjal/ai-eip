import { Box, Chip, Typography } from '@mui/material';
import Bookmark from '@mui/icons-material/Bookmark';
import Block from '@mui/icons-material/Block';
import PageHeader from '../../components/common/PageHeader.jsx';
import InsightCard from '../../components/ui/InsightCard.jsx';
import AiStatusCard from '../../components/ui/AiStatusCard.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import { useData } from '../../hooks/useData.js';
import { useInsightAi } from '../../hooks/useInsightAi.js';
import { useAiTerms } from '../../hooks/useAiTerms.js';
import { fetchInsights } from '../../api/insights.js';
import { mapInsightToViewModel, collectSources } from '../../api/insights.adapter.js';
import { useActionStore } from '../../store/actionStore.js';
import { useToast } from '../../hooks/useToast.js';

/**
 * Insights — AI observations grouped into Needs review / Saved / Dismissed,
 * with "Why am I seeing this?" disclosures. Explanations are generated
 * explicitly per card (never on page load), cached per insight, and can be
 * regenerated per card. Each card carries a deterministic result chip until a
 * card is AI-explained.
 *
 * REMAINING (extend later):
 *  - "restore" from Dismissed / "unsave" from Saved (undo within group)
 *  - empty-state descriptions per group
 */
const Insights = () => {
  const { data: raw, loading, error, retry } = useData(fetchInsights, []);
  const { isSaved, dismissedInsightIds, saveInsight, unsaveInsight, dismissInsight, restoreInsight } = useActionStore();
  const { aiEnabled, explanations: effectiveExplanations, explainingId, regeneratingId, handleExplain, handleRegenerate } = useInsightAi();
  const toast = useToast();
  const { t } = useAiTerms();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={retry} />;

  const insights = (raw ?? []).map(mapInsightToViewModel);
  const needsReview = insights.filter((i) => !isSaved(i.id) && !dismissedInsightIds.includes(i.id));
  const saved = insights.filter((i) => isSaved(i.id));
  const dismissed = insights.filter((i) => dismissedInsightIds.includes(i.id));

  // AI Analysis Engine status: signals + source coverage derived from the
  // evidence actually shown on this page.
  const signalCount = insights.reduce((n, ins) => n + ins.why.evidence.length, 0);
  const sourceCoverage = collectSources(insights);
  const firstInsightId = insights[0]?.id;

  const handleSave = (id) => { saveInsight(id); toast('Insight saved', { actionLabel: 'Undo', action: () => unsaveInsight(id) }); };
  const handleDismiss = (id) => { dismissInsight(id); toast('Insight dismissed', { actionLabel: 'Undo', action: () => restoreInsight(id) }); };

  const Group = ({ title, icon, items, showDismiss = true, emptyTitle = 'Nothing here', emptyDescription }) => (
    <Box sx={{ p: 3, outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-card)', bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        {icon}
        <Typography sx={{ fontWeight: 600 }}>{title}</Typography>
        <Chip size="small" label={`${items.length} ${items.length === 1 ? t('insight') : t('insights')}`} variant="outlined" />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.length === 0 && (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            sx={{ py: 3 }}
          />
        )}
        {items.map((ins) => (
          <InsightCard
            key={ins.id}
            insight={ins}
            saved={isSaved(ins.id)}
            onSave={() => handleSave(ins.id)}
            onDismiss={() => (showDismiss ? handleDismiss(ins.id) : undefined)}
            onExplain={() => handleExplain(ins.id)}
            onRegenerate={() => handleRegenerate(ins.id)}
            explaining={explainingId === ins.id}
            regenerating={regeneratingId === ins.id}
            aiEnabled={aiEnabled}
            aiExplanation={effectiveExplanations.get(ins.id)?.explanation ?? null}
            aiMeta={effectiveExplanations.get(ins.id)?.explanationMeta ?? null}
            showAiLabel={ins.id === firstInsightId}
            defaultOpen={ins.id === firstInsightId}
          />
        ))}
      </Box>
    </Box>
  );

  return (
    <Box>
      <PageHeader title="Insights" subtitle="AI-generated, evidence-backed insights." />

      <AiStatusCard signals={signalCount} sources={sourceCoverage} sx={{ mt: 3 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
        <Group title="Needs review" items={needsReview} />
        <Group
          title="Saved"
          icon={<Bookmark color="primary" />}
          items={saved}
          showDismiss={false}
          emptyTitle="Nothing saved yet"
          emptyDescription="Save important insights for later review."
        />
        <Group
          title="Dismissed"
          icon={<Block color="disabled" />}
          items={dismissed}
          showDismiss={false}
          emptyTitle="Nothing dismissed"
          emptyDescription="Dismissed signals you don't need right now."
        />
      </Box>
    </Box>
  );
};

export default Insights;
