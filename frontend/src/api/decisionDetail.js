import { DECISIONS } from '../pages/DecisionIntelligence/data/decisions.js';
import { DECISION_DETAILS } from '../pages/DecisionDetail/data/decisionDetails.js';

/**
 * Decision Workspace (Screen 2) detail fetcher.
 *
 * Merges the Screen 1 decision envelope (type, severity, context, question,
 * signals, potential value) with the Screen 2 detail content (problem,
 * evidence, options, outcome rows). Returns null for unknown ids so the
 * workspace can render a proper "decision not found" state — never a thrown
 * error that would trigger a retry loop.
 *
 * This module is the seam a future live endpoint (`GET /api/decisions/:id`)
 * replaces without touching the page — components only see the merged shape.
 */

const SIMULATED_LATENCY_MS = 400;

const delayed = (value) => new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_LATENCY_MS));

export async function fetchDecisionDetail(decisionId) {
  const base = DECISIONS.find((d) => d.id === decisionId);
  const detail = DECISION_DETAILS[decisionId];
  if (!base || !detail) return delayed(null);
  return delayed({ ...base, ...detail });
}

/** Breadcrumb label for a decision route (falls back gracefully for unknown ids). */
export function decisionCrumbLabel(decisionId) {
  const base = DECISIONS.find((d) => d.id === decisionId);
  return base ? base.context : 'Decision workspace';
}