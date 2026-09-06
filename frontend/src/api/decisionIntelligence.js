import { DECISIONS } from '../pages/DecisionIntelligence/data/decisions.js';

/**
 * Decision Intelligence inbox fetcher.
 *
 * Screen 1 is fed by centralized, data-driven mock data. This module is the
 * seam where a future live endpoint replaces the in-memory dataset without
 * touching the page — `useData(fetchDecisions)` only needs this contract to
 * keep returning a Promise of Decision[].
 *
 * @returns {Promise<Decision[]>}
 */
export async function fetchDecisions() {
  return Promise.resolve(DECISIONS);
}