// Award eligibility engine. Awards are DERIVED, not AI-decided: deterministic
// conditions described in plain language. Levels are mutually exclusive and
// evaluated highest → lowest, so a League-qualified person never also appears
// as Eminence/Quarterly/Monthly. Higher levels require stronger conditions,
// never merely a higher score.

import { hasMetric, intelligenceFor } from './recognition-intelligence.service.js';

const LEVELS = ['league', 'eminence', 'quarterly', 'monthly'];

const WINDOW_DAYS = 90;

// Thresholds (kept together so the intent and the numbers are reviewable).
const THRESHOLDS = {
  quarterlyMinContributions: 2,
  quarterlyMinImpact: 45,
  eminenceMinEvidence: 65,
  leagueMinContributions: 3,
  leagueMinBreadth: 3,
  leagueMinMonths: 2,
};

// Public, has at least one primary person-attributed evidence. `statuses`
// scopes which approval states count: 'approved' for the public feed, and
// 'approved' + 'recommended' for governance evaluation (recommended items are
// evaluated but never surface in the public feed).
function isVerified(item, statuses = ['approved']) {
  return (
    item.visibility === 'public' &&
    statuses.includes(item.approvalStatus) &&
    (item.evidence ?? []).some((evidence) => evidence.role === 'primary' && evidence.entityType === 'person')
  );
}

function withinWindow(item, anchor) {
  return item.occurredAt <= anchor && daysBetween(item.occurredAt, anchor) <= WINDOW_DAYS;
}

function daysBetween(fromDate, toDate) {
  return Math.round((new Date(`${toDate}T00:00:00Z`) - new Date(`${fromDate}T00:00:00Z`)) / 86400000);
}

function qualifiesMonthly(items, anchor) {
  return items.some((item) => isVerified(item) && withinWindow(item, anchor));
}

function qualifiesQuarterly(items, anchor, intelligence) {
  return qualifiesMonthly(items, anchor) &&
    intelligence.contributions >= THRESHOLDS.quarterlyMinContributions &&
    intelligence.impact >= THRESHOLDS.quarterlyMinImpact;
}

function hasQuantifiedImprovement(items) {
  return items.some((item) =>
    hasMetric(item.summary) || hasMetric((item.impact ?? []).join(' ')),
  );
}

function qualifiesEminence(items, anchor, intelligence) {
  return qualifiesQuarterly(items, anchor, intelligence) &&
    intelligence.evidenceStrength >= THRESHOLDS.eminenceMinEvidence &&
    hasQuantifiedImprovement(items);
}

function qualifiesLeague(items, _anchor, intelligence) {
  return qualifiesEminence(items, _anchor, intelligence) &&
    intelligence.contributions >= THRESHOLDS.leagueMinContributions &&
    intelligence.monthsSpan >= THRESHOLDS.leagueMinMonths &&
    intelligence.breadth >= THRESHOLDS.leagueMinBreadth;
}

const BASIS = {
  monthly: 'Consistent verified contribution with primary person evidence within the period.',
  quarterly: 'Multiple verified contributions within the quarter with measurable impact.',
  eminence: 'Exceptional measurable improvement backed by strong evidence.',
  league: 'Sustained verified contributions spanning multiple months, projects and knowledge areas.',
};

// Returns { highestQualifiedLevel, qualifiedLevels, basis } for one person.
export function evaluateAwards(personItems, anchor, options = {}) {
  const statuses = options.statuses ?? ['approved'];
  const items = personItems.filter((item) => isVerified(item, statuses));
  const intelligence = intelligenceFor(items, anchor);

  const qualified = LEVELS.filter((level) => {
    switch (level) {
      case 'league': return qualifiesLeague(items, anchor, intelligence);
      case 'eminence': return qualifiesEminence(items, anchor, intelligence);
      case 'quarterly': return qualifiesQuarterly(items, anchor, intelligence);
      default: return qualifiesMonthly(items, anchor);
    }
  });
  const highest = qualified[0] ?? null; // LEVELS is ordered highest → lowest

  return {
    highestQualifiedLevel: highest,
    qualifiedLevels: qualified,
    intelligence,
    basis: highest ? [BASIS[highest]] : [],
  };
}