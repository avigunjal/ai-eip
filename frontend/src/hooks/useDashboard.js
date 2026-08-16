import { useMemo } from 'react';
import { useData } from './useData.js';
import { fetchDashboardOverview, fetchDashboardInsights } from '../api/dashboard.js';
import { mapDashboardOverview } from '../api/dashboard.adapter.js';
import { mapInsightToViewModel } from '../api/insights.adapter.js';

/**
 * Overview dashboard data: reuses `useData` for loading/error/retry and maps
 * the backend DTO to the UI view model via the adapter.
 */
export function useDashboard() {
  const query = useData(fetchDashboardOverview);
  const data = useMemo(
    () => (query.data ? mapDashboardOverview(query.data) : null),
    [query.data],
  );
  return { ...query, data };
}

/**
 * Overview AI insights: mapped to the InsightCard contract.
 */
export function useDashboardInsights() {
  const query = useData(fetchDashboardInsights);
  const data = useMemo(
    () => (query.data ? query.data.map(mapInsightToViewModel) : null),
    [query.data],
  );
  return { ...query, data };
}