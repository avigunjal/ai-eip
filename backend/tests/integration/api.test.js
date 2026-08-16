// End-to-end service tests against a freshly seeded database.
// Runs the canonical seed first so every assertion is deterministic.

import test from 'node:test';
import assert from 'node:assert/strict';
import { seed } from '../../src/database/seed/seed.js';
import { listAreas, getAreaById } from '../../src/modules/knowledge/knowledge.service.js';
import { listPeople } from '../../src/modules/person/person.service.js';
import { composeForProject } from '../../src/modules/team-composer/team-composer.service.js';
import { getProjectById } from '../../src/modules/project/project.service.js';
import { listInsights } from '../../src/modules/insight/insight.service.js';
import { getFeed } from '../../src/modules/recognition/recognition.service.js';

seed();

test('seeded data matches the demo narrative counts', () => {
  const counts = seed();
  assert.equal(counts.risks, 18);
  assert.equal(counts.knowledgeAreas, 16);
  assert.equal(counts.capabilities, 12);
  assert.equal(counts.projects, 10);
  assert.equal(counts.allocations, 28 * 12);
});

test('Payment Service (k-01) is a critical single-owner system', async () => {
  const area = await getAreaById('k-01');
  assert.equal(area.name, 'Payment Service');
  assert.equal(area.riskLevel, 'critical');
  assert.ok(area.riskScore >= 80);
  assert.equal(area.dominantExpertShare, 85);
  assert.equal(area.coverage, 38);
  assert.ok(area.linkedProjectIds.includes('pr-07'));
  assert.ok(area.transferPlanId === 'tp-01');
  assert.ok(area.evidence.length >= 2);
});

test('knowledge list exposes risk levels for every area', async () => {
  const areas = await listAreas();
  assert.equal(areas.length, 16);
  for (const area of areas) {
    assert.ok(['critical', 'high', 'medium', 'low'].includes(area.riskLevel));
    assert.ok(Number.isFinite(area.riskScore));
  }
});

test('project detail includes joined teams, owners, areas, and enriched risks', async () => {
  const project = await getProjectById('pr-07');
  assert.equal(project.name, 'Payments 3.0');
  assert.equal(project.type, 'migration');
  assert.equal(project.phase, 'implementation');
  assert.ok(project.description.length > 0, 'project needs a description');
  assert.ok(project.teamIds.includes('t-06'));
  assert.equal(project.teamSize, 4, 'teamSize counts people across linked teams');
  assert.ok(project.ownerIds.length >= 1);
  assert.ok(project.knowledgeAreas.some((area) => area.id === 'k-01'));
  assert.ok(project.aiMetadata.lastAnalyzedAt, 'AI metadata needs a lastAnalyzedAt');
  assert.ok(project.aiMetadata.signalsUsed.length >= 1, 'AI metadata needs signalsUsed');
  assert.ok(project.risks.length >= 2);
  const risk = project.risks.find((item) => item.id === 'r-02');
  assert.equal(risk.title, 'Single SME owns Payment Service knowledge');
  assert.ok(risk.signals.length >= 2, 'critical risks need supporting evidence');
  assert.ok(risk.actions.length >= 1, 'critical risks need a next action');
  const driver = project.risk.drivers.find((item) => item.riskId === 'r-02');
  assert.ok(driver, 'risk drivers are keyed by risk id');
  assert.ok(driver.evidence.length >= 1, 'risk drivers carry cited evidence');
});

test('composer recommends a coverage-matching team for pr-07', async () => {
  const recommendation = await composeForProject('pr-07');
  assert.equal(recommendation.project.id, 'pr-07');
  assert.ok(recommendation.recommendedTeam.length > 0);
  assert.ok(recommendation.assessment.coverageScore >= 50);
  assert.ok(recommendation.rationale.length > 0);
  assert.ok(recommendation.tradeOff.length > 0);
  assert.ok(Array.isArray(recommendation.alternatives));
});

test('composer persists a scenario with changes when asked', async () => {
  const recommendation = await composeForProject('pr-07', { persist: true });
  assert.ok(recommendation.scenarioId, 'a persisted scenario should have an id');
  const { getScenarioById } = await import('../../src/modules/team-composer/team-composer.service.js');
  const scenario = await getScenarioById(recommendation.scenarioId);
  assert.equal(scenario.project.id, 'pr-07');
  assert.ok(scenario.recommendedTeam.length > 0);
});

test('insights are grounded, templated, and cover the flagship narrative', async () => {
  const insights = await listInsights();
  assert.ok(insights.some((insight) => insight.id === 'knowledge-k-01'));
  const knowledge = insights.find((insight) => insight.id === 'knowledge-k-01');
  assert.match(knowledge.summary, /Payment Service/);
  assert.ok(knowledge.drivers.length >= 1);
  assert.ok(knowledge.recommendedActions.length >= 1);
  assert.ok(knowledge.evidence.length >= 1);
});

test('recognition feed returns only seeded contribution context', async () => {
  const feed = await getFeed();
  assert.ok(feed.length >= 15);
  const first = feed[0];
  assert.ok(first.person.name.length > 0);
  assert.ok(['public', 'private'].includes(first.visibility));
});

test('people expose career, competency, and capacity detail', async () => {
  const people = await listPeople();
  assert.equal(people.length, 28);
  assert.ok(people.every((person) => Number.isInteger(person.yearsOfExperience) && person.yearsOfExperience > 0));
  const david = people.find((person) => person.id === 'p-12');
  assert.equal(david.yearsOfExperience, 9);
  assert.equal(david.role, 'Senior Engineer');
  assert.ok(david.capabilities.every((capability) => capability.name.length > 0 && capability.level.length > 0));
  assert.ok(david.capabilities.some((capability) => capability.name === 'Payments & Billing' && capability.level === 'primary'));
  assert.ok(david.expertise.length > 0);
  assert.ok(david.availabilityFte > 0 && david.availabilityFte <= 1);
});