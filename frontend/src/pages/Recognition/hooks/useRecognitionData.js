import { useMemo } from 'react';
import { useData } from '../../../hooks/useData.js';
import { fetchRecognitionFeed } from '../../../api/recognition.js';
import { getPeople } from '../../../data/service.js';
import { buildRecognitionInsights } from '../data/recognitionAdapter.js';

/**
 * Recognition data hook: loads the live feed and derives all UI aggregates
 * (KPIs, award levels, trends, top contributors) through the temporary
 * recognitionAdapter.
 */
export function useRecognitionData() {
  const { data: raw = [], loading, error, retry } = useData(fetchRecognitionFeed);
  const people = useMemo(() => getPeople(), []);
  const feed = useMemo(() => raw ?? [], [raw]);
  const derived = useMemo(() => buildRecognitionInsights(feed, people), [feed, people]);
  return { feed, derived, loading, error, retry };
}