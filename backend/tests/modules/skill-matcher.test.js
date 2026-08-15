// Module layer tests.

import test from 'node:test';
import assert from 'node:assert/strict';
import { matchSkills } from '../../src/modules/team-composer/skill-matcher.js';

test('matchSkills returns a fit score', () => {
  const result = matchSkills(['node', 'react'], ['node', 'react', 'sql']);
  assert.equal(typeof result.score, 'number');
});
