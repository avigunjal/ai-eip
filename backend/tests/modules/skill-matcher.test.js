// Module layer tests.

import test from 'node:test';
import assert from 'node:assert/strict';
import { matchCapabilities } from '../../src/modules/team-composer/skill-matcher.service.js';

test('matchCapabilities returns a weighted fit score and per-skill coverage', () => {
  const requirements = [
    { capability_id: 'cap-node', name: 'Node.js Services', weight: 1 },
    { capability_id: 'cap-react', name: 'React Frontend', weight: 1 },
    { capability_id: 'cap-sql', name: 'SQL & PostgreSQL', weight: 1 },
  ];
  const result = matchCapabilities(
    [{ capability_id: 'cap-node', level: 'primary' }, { capability_id: 'cap-react', level: 'primary' }],
    requirements,
  );
  assert.equal(result.score, 67);
  assert.deepEqual(result.coverage, { 'Node.js Services': true, 'React Frontend': true, 'SQL & PostgreSQL': false });
  assert.deepEqual(result.missingSkills, ['SQL & PostgreSQL']);
});

test('matchCapabilities rewards stronger levels', () => {
  const requirements = [{ capability_id: 'cap-node', name: 'Node.js Services', weight: 1 }];
  const primary = matchCapabilities([{ capability_id: 'cap-node', level: 'primary' }], requirements);
  const learning = matchCapabilities([{ capability_id: 'cap-node', level: 'learning' }], requirements);
  assert.ok(primary.score > learning.score, 'primary level should score higher than learning');
});