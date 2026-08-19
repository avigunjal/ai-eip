import { useState } from 'react';
import { useData } from './useData.js';
import { explainInsight, regenerateInsightExplanation, fetchAiSettings, fetchInsightExplanations } from '../api/ai.js';
import { withRetry } from '../api/client.js';
import { useToast } from './useToast.js';

/**
 * Shared per-card AI explanation state for InsightCard lists (Insights page +
 * Overview sidebar) so "Explain with AI" behaves identically everywhere.
 *
 * Cached explanations (cache-only GET) surface on every visit; live per-card
 * results from this session always win.
 */
export function useInsightAi() {
  const { data: cachedList = [] } = useData(fetchInsightExplanations, []);
  const { data: aiSettings } = useData(fetchAiSettings, []);
  const [explanations, setExplanations] = useState(() => new Map());
  const [explainingId, setExplainingId] = useState(null);
  const [regeneratingId, setRegeneratingId] = useState(null);
  const toast = useToast();

  const effectiveExplanations = new Map(
    cachedList
      .filter((item) => item.explanation)
      .map((item) => [item.insightId, { explanation: item.explanation, explanationMeta: item.explanationMeta }]),
  );
  explanations.forEach((value, key) => effectiveExplanations.set(key, value));

  const handleExplain = async (insightId) => {
    setExplainingId(insightId);
    try {
      // "Explain with AI" only sends the clicked insight to the LLM (a small
      // call, never the whole page); repeat clicks hit the per-insight cache.
      const updated = await withRetry(() => explainInsight(insightId));
      setExplanations((map) => {
        const next = new Map(map);
        next.set(insightId, { explanation: updated.explanation, explanationMeta: updated.explanationMeta });
        return next;
      });
    } catch (err) {
      toast(err?.message ?? "Couldn't explain this insight", { severity: 'error' });
    } finally {
      setExplainingId(null);
    }
  };

  const handleRegenerate = async (insightId) => {
    setRegeneratingId(insightId);
    try {
      // A 502 from the backend means "provider failed, previous explanation
      // kept" — retrying would just burn tokens, so do not auto-retry that.
      const updated = await withRetry(() => regenerateInsightExplanation(insightId), {
        retryable: (err) =>
          err.isNetworkError ||
          err.status === 429 ||
          err.status === 500 ||
          err.status === 503 ||
          err.status === 504,
      });
      setExplanations((map) => {
        const next = new Map(map);
        next.set(insightId, { explanation: updated.explanation, explanationMeta: updated.explanationMeta });
        return next;
      });
      toast('Explanation regenerated');
    } catch (err) {
      toast(err?.message ?? "Couldn't regenerate the explanation", { severity: 'error' });
    } finally {
      setRegeneratingId(null);
    }
  };

  return {
    aiEnabled: aiSettings?.enabled ?? true,
    explanations: effectiveExplanations,
    explainingId,
    regeneratingId,
    handleExplain,
    handleRegenerate,
  };
}