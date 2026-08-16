// Analytics tests (Node's built-in test runner).

import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreProjectRisk } from '../../src/modules/analytics/project-risk/project-risk.service.js';
import { concentrationScore } from '../../src/modules/analytics/knowledge-risk/knowledge-risk.service.js';

test('scoreProjectRisk returns explainable aggregate risk', () => {
  const result = scoreProjectRisk({ id: 'p1' }, [
    { id: 'r1', title: 'Blocked contract', category: 'dependency', severity: 'high', score: 80, confidence: 90, status: 'open' },
    { id: 'r2', title: 'Stale docs', category: 'knowledge', severity: 'medium', score: 40, confidence: 70, status: 'monitoring' },
  ]);
  assert.equal(result.score, 60);
  assert.equal(result.confidence, 80);
  assert.equal(result.drivers[0].riskId, 'r1');
});

test('scoreProjectRisk ignores mitigated signals', () => {
  const result = scoreProjectRisk({ id: 'p1' }, [
    { id: 'r1', title: 'Resolved', category: 'dependency', severity: 'low', score: 90, confidence: 95, status: 'mitigated' },
  ]);
  assert.equal(result.score, 0);
  assert.deepEqual(result.drivers, []);
});

test('concentrationScore flags the Payment Service as a single-owner system', () => {
  const result = concentrationScore({
    id: 'k-01',
    criticality: 92,
    coverage_score: 38,
    documentation_completeness: 42,
    expertise: [
      { person_id: 'p-01', level: 'primary', share_pct: 85, is_backup: 0 },
      { person_id: 'p-05', level: 'learning', share_pct: 10, is_backup: 0 },
      { person_id: 'p-09', level: 'unverified', share_pct: 5, is_backup: 0 },
    ],
  });
  assert.equal(result.dominantShare, 85);
  assert.equal(result.hasBackup, false);
  assert.equal(result.singleOwner, true);
  assert.ok(result.concentration >= 80, 'expected a critical concentration score');
});

test('concentrationScore does not flag systems with a capable backup', () => {
  const result = concentrationScore({
    id: 'k-02',
    criticality: 92,
    coverage_score: 82,
    documentation_completeness: 82,
    expertise: [
      { person_id: 'p-08', level: 'primary', share_pct: 45, is_backup: 0 },
      { person_id: 'p-14', level: 'capable', share_pct: 35, is_backup: 1 },
    ],
  });
  assert.equal(result.hasBackup, true);
  assert.equal(result.singleOwner, false);
  assert.ok(result.concentration < 60, 'expected a non-critical concentration score');
});