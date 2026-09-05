import { useMemo } from 'react';
import { useData } from '../../../hooks/useData.js';
import { fetchGovernanceQueue } from '../../../api/recognition.js';

/**
 * Governance queue data hook: loads the pending human-review queue and the
 * live pending count for the tab badge. Recommended items are evaluated
 * server-side with deterministic awards + confidence; the frontend only
 * renders them.
 */
export function useGovernanceData() {
  const { data, loading, error, retry } = useData(fetchGovernanceQueue);
  const items = useMemo(() => data?.items ?? [], [data]);
  return { items, total: items.length, loading, error, retry };
}