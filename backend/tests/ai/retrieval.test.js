// AI layer tests.

import test from 'node:test';
import assert from 'node:assert/strict';
import { retrieveEvidence } from '../../src/ai/retrieval.js';

test('retrieveEvidence returns an array', async () => {
  const result = await retrieveEvidence({});
  assert.ok(Array.isArray(result));
});
