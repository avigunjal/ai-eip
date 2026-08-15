import { Box, Chip, Typography } from '@mui/material';
import Bookmark from '@mui/icons-material/Bookmark';
import Block from '@mui/icons-material/Block';
import PageHeader from '../../components/common/PageHeader.jsx';
import InsightCard from '../../components/ui/InsightCard.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { insights } from '../../data/insights.js';
import { useActionStore } from '../../store/actionStore.js';
import { useToast } from '../../hooks/useToast.js';

/**
 * Insights — AI observations grouped into Needs review / Saved / Dismissed,
 * with "Why am I seeing this?" disclosures.
 *
 * REMAINING (extend later):
 *  - add `severity` to each insight for the InsightCard badge
 *  - "restore" from Dismissed / "unsave" from Saved (undo within group)
 *  - empty-state descriptions per group
 */
const Insights = () => {
  const { isSaved, dismissedInsightIds, saveInsight, unsaveInsight, dismissInsight, restoreInsight } = useActionStore();
  const toast = useToast();

  const needsReview = insights.filter((i) => !isSaved(i.id) && !dismissedInsightIds.includes(i.id));
  const saved = insights.filter((i) => isSaved(i.id));
  const dismissed = insights.filter((i) => dismissedInsightIds.includes(i.id));

  const handleSave = (id) => { saveInsight(id); toast('Insight saved', { actionLabel: 'Undo', action: () => unsaveInsight(id) }); };
  const handleDismiss = (id) => { dismissInsight(id); toast('Insight dismissed', { actionLabel: 'Undo', action: () => restoreInsight(id) }); };

  const Group = ({ title, icon, items, showDismiss = true }) => (
    <Box sx={{ p: 3, outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-card)', bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        {icon}
        <Typography sx={{ fontWeight: 600 }}>{title}</Typography>
        <Chip size="small" label={items.length} variant="outlined" />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.length === 0 && <EmptyState title="Nothing here" />}
        {items.map((ins) => (
          <InsightCard
            key={ins.id}
            insight={ins}
            saved={isSaved(ins.id)}
            onSave={() => handleSave(ins.id)}
            onDismiss={() => (showDismiss ? handleDismiss(ins.id) : undefined)}
          />
        ))}
      </Box>
    </Box>
  );

  return (
    <Box>
      <PageHeader title="Insights" subtitle="AI-generated, evidence-backed observations." />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
        <Group title="Needs review" items={needsReview} />
        <Group title="Saved" icon={<Bookmark color="primary" />} items={saved} showDismiss={false} />
        <Group title="Dismissed" icon={<Block color="disabled" />} items={dismissed} showDismiss={false} />
      </Box>
    </Box>
  );
};

export default Insights;
