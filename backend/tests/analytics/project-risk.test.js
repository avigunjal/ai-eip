// Analytics tests (Node's built-in test runner).

import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreProjectRisk } from '../../src/analytics/project-risk/risk-engine.js';

test('scoreProjectRisk returns a baseline shape', () => {
  const result = scoreProjectRisk({ id: 'p1' }, []);
  assert.equal(typeof result.score, 'number');
  assert.ok(Array.isArray(result.drivers));
});
