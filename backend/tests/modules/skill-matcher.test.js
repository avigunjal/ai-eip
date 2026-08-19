// Module layer tests.

import test from 'node:test';
import assert from 'node:assert/strict';
import { matchCapabilities } from '../../src/modules/team-composer/skill-matcher.service.js';

test('matchCapabilities returns a weighted fit score and per-skill coverage', () => {
  const requirements = [
    { capability_id: 'cap-node', name: 'Node.js', weight: 1 },
    { capability_id: 'cap-react', name: 'React', weight: 1 },
    { capability_id: 'cap-sql', name: 'SQL', weight: 1 },
  ];
  const result = matchCapabilities(
    [{ capability_id: 'cap-node', level: 'primary' }, { capability_id: 'cap-react', level: 'primary' }],
    requirements,
  );
  assert.equal(result.score, 67);
  assert.deepEqual(result.coverage, { 'Node.js': true, React: true, SQL: false });
  assert.deepEqual(result.missingSkills, ['SQL']);
});

test('matchCapabilities rewards stronger levels', () => {
  const requirements = [{ capability_id: 'cap-node', name: 'Node.js', weight: 1 }];
  const primary = matchCapabilities([{ capability_id: 'cap-node', level: 'primary' }], requirements);
  const learning = matchCapabilities([{ capability_id: 'cap-node', level: 'learning' }], requirements);
  assert.ok(primary.score > learning.score, 'primary level should score higher than learning');
});