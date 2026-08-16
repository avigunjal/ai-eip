// Shared row → DTO mappers. Keeping conversions in one place avoids drift
// between modules that all render evidence and action records.

import { severityFor } from '../shared/constants/index.js';

const SOURCE_LABELS = {
  github: 'Pull request',
  docs: 'Runbook ownership',
  jira: 'Blocked ticket',
  incident: 'Incident resolution',
  planning: 'Planning review',
  pagerduty: 'On-call page',
  datadog: 'Elevated error rate',
};

export function signalLabel(source) {
  return SOURCE_LABELS[source] ?? source;
}

// Evidence rows → frontend "signal" shape.
export function toSignals(rows) {
  return (rows ?? []).map((row) => ({
    id: row.id,
    label: signalLabel(row.source),
    source: row.source,
    occurredAt: row.occurred_at,
    url: row.source_url ?? undefined,
  }));
}

// Evidence rows → knowledge-area evidence shape.
export function toEvidence(rows) {
  return (rows ?? []).map((row) => ({
    id: row.id,
    source: row.source,
    statement: row.statement,
    occurredAt: row.occurred_at,
    url: row.source_url ?? undefined,
  }));
}

// Prevention-action rows → action shape.
export function toActions(rows) {
  return (rows ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    ownerId: row.owner_person_id ?? null,
    dueDate: row.due_date,
    status: row.status,
    expectedOutcome: row.expected_outcome ?? row.expected_coverage_delta,
  }));
}

// The latest evidence date for a risk (used as `lastSignalAt`).
export function lastSignalAt(rows) {
  return (rows ?? []).reduce((latest, row) => (row.occurred_at > latest ? row.occurred_at : latest), null);
}

export function toSeverity(score) {
  return severityFor(score);
}

export { severityFor };