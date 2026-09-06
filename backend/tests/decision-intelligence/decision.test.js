// Decision Impact Simulator tests against a freshly seeded database.
// The engine is fully deterministic: with the canonical seed the same inputs
// always produce the same scores, the same winner, and the same recommendation.
// The tests recompute the winner as an argmax over the deterministic scores
// (never asserting a hardcoded option), so a change in seed data that flips the
// math is detected instead of covered up.

import test from 'node:test';
import assert from 'node:assert/strict';
import { seed } from '../../src/database/seed/seed.js';
import { DECISION_WEIGHTS } from '../../src/modules/decision-intelligence/decision.config.js';
import {
  getProjectContext,
  getOptions,
  simulateDecision,
  compareDecisions,
  listScenarios,
  listAssumptions,
  updateAssumption,
} from '../../src/modules/decision-intelligence/decision.service.js';

seed();

function argmaxWinner(options) {
  return options.reduce((leading, challenger) => {
    if (challenger.score > leading.score) return challenger;
    if (challenger.score === leading.score) {
      return (challenger.org?.netOrgImpact ?? 0) > (leading.org?.netOrgImpact ?? 0) ? challenger : leading;
    }
    return leading;
  }, options[0]);
}

test('pr-07 Payment Service 3.0 exposes high delivery risk in every signal', async () => {
  const ctx = await getProjectContext('pr-07');
  assert.equal(ctx.project.id, 'pr-07');
  assert.equal(ctx.project.name, 'Payments 3.0');
  assert.equal(ctx.demoToday, '2026-08-16');

  const s = ctx.currentSignals;
  assert.equal(s.risk.score, 69);
  assert.equal(s.risk.severity, 'high');
  assert.equal(s.capacity.pressure, 116);
  assert.equal(s.capacity.teamId, 't-01');
  assert.equal(s.coverage.score, 38, 'coverage signal is the critical area coverage');
  assert.equal(s.coverage.requirementScore, 96);
  assert.equal(s.knowledge.areaId, 'k-01');
  assert.equal(s.knowledge.concentration, 81);
  assert.equal(s.knowledge.singleOwner, true);
  assert.equal(s.knowledge.coverage, 38);
  assert.equal(s.exposure.score, 68);
  assert.equal(s.exposure.label, 'high');
  assert.equal(s.exposure.remainingDays, 23);
});

test('four deterministic options, ordered with continue first', async () => {
  const cmp = await compareDecisions('pr-07');
  assert.deepEqual(
    cmp.options.map((option) => option.option),
    ['continue', 'staffing', 'reallocate', 'knowledge_transfer'],
  );
  assert.equal(cmp.options.length, 4);
  assert.equal(cmp.deterministic, true);
  assert.equal(cmp.currentSignals.risk.score, 69);
});

test('option scores equal the weighted recomputation of their dimensions', async () => {
  const cmp = await compareDecisions('pr-07');
  const weights = DECISION_WEIGHTS;
  for (const option of cmp.options) {
    const { riskReduction, deliveryImprovement, financial, resourceEfficiency, organizationalImpact } = option.scoreBreakdown;
    const recomputed = Math.round(
      weights.riskReduction * riskReduction
      + weights.deliveryImprovement * deliveryImprovement
      + weights.financial * financial
      + weights.resourceEfficiency * resourceEfficiency
      + weights.organizationalImpact * organizationalImpact,
    );
    assert.equal(option.score, recomputed, `${option.option} score must match its breakdown`);
  }
});

test('the recommended option is the argmax of the deterministic scores, never hardcoded', async () => {
  const cmp = await compareDecisions('pr-07');
  const winner = argmaxWinner(cmp.options);
  assert.equal(cmp.recommended.option, winner.option);
  assert.equal(cmp.recommended.label, winner.label);
  assert.equal(cmp.recommended.score, winner.score);
  assert.equal(cmp.recommended.scoreBreakdown.financial, winner.scoreBreakdown.financial);
  assert.ok(cmp.recommended.reasons.length > 0);
  assert.ok(cmp.recommended.tradeOffs.length > 0);
});

test('compare is a deterministic identity: two runs produce the same JSON', async () => {
  const first = await compareDecisions('pr-07');
  const second = await compareDecisions('pr-07');
  assert.deepEqual(second, first);
});

test('payments decision signs a specific, data-grounded reallocation', async () => {
  const cmp = await compareDecisions('pr-07');
  const reallocate = cmp.options.find((option) => option.option === 'reallocate');

  assert.equal(reallocate.sourceImpact.personName, 'Priya Iyer', 'named k-01 backup in training');
  assert.equal(reallocate.sourceImpact.teamName, 'Cloud & Infrastructure');
  assert.equal(reallocate.sourceImpact.fte, 0.5);
  assert.equal(reallocate.action.summary, 'Reallocate Priya Iyer (Engineering Manager) from Cloud & Infrastructure at 0.5 FTE');

  assert.equal(reallocate.after.risk.score, 50);
  assert.equal(reallocate.after.capacity.pressure, 101);
  assert.equal(reallocate.after.coverage.score, 50);
  assert.equal(reallocate.after.knowledge.concentration, 69);
  assert.equal(reallocate.after.knowledge.singleOwner, false);
  assert.equal(reallocate.after.exposure.score, 45);

  assert.equal(reallocate.financial.avoidedExposure, 32822);
  assert.equal(reallocate.financial.staffingCost, 0);
  assert.equal(reallocate.financial.netPlanningImpact, 32822);
  assert.ok(reallocate.financial.currency === 'INR');
  assert.ok(reallocate.financial.disclaimer.includes('not actual financial records'));
});

test('continue option keeps every signal and books zero financial impact', async () => {
  const cmp = await compareDecisions('pr-07');
  const first = cmp.options.find((option) => option.option === 'continue');
  assert.equal(first.after.exposure.score, cmp.currentSignals.exposure.score);
  assert.equal(first.after.risk.score, cmp.currentSignals.risk.score);
  assert.equal(first.financial.baselineExposure, 97039);
  assert.equal(first.financial.avoidedExposure, 0);
  assert.equal(first.financial.staffingCost, 0);
  assert.equal(first.financial.netPlanningImpact, 0);
  assert.equal(first.org.sourceImpact, null);
  assert.equal(first.resource.fteDelta, 0);
});

test('staffing option books the prorated window cost and zero net', async () => {
  const cmp = await compareDecisions('pr-07');
  const staffing = cmp.options.find((option) => option.option === 'staffing');
  assert.equal(staffing.after.exposure.score, 55);
  assert.equal(staffing.financial.avoidedExposure, 18551);
  assert.equal(staffing.financial.staffingCost, 284625);
  assert.equal(staffing.financial.netPlanningImpact, 0, 'prorated cost exceeds avoided exposure');
  assert.equal(staffing.sourceImpact.personName, 'Vikram Singh');
  assert.ok(staffing.action.summary.startsWith('Apply Balanced Payments team'));
});

test('knowledge transfer option reduces the single-owner bus-factor risk', async () => {
  const cmp = await compareDecisions('pr-07');
  const transfer = cmp.options.find((option) => option.option === 'knowledge_transfer');
  assert.equal(transfer.action.summary, 'Execute Payment Service knowledge transfer plan (tp-01)');
  assert.equal(transfer.after.risk.score, 43);
  assert.equal(transfer.after.knowledge.singleOwner, false);
  assert.equal(transfer.after.knowledge.coverage, 65);
  assert.equal(transfer.after.exposure.score, 51);
  assert.equal(transfer.financial.netPlanningImpact, 24260);
  assert.equal(transfer.org.sourceImpact, null);
});

test('reallocation avoids exposure and keeps the target under sustainable load', async () => {
  const cmp = await compareDecisions('pr-07');
  const option = cmp.options.find((entry) => entry.option === 'reallocate');
  assert.ok(option.deltas.exposureReduction > 0);
  assert.ok(option.deltas.knowledgeConcentrationDelta > 0);
  assert.ok(option.resource.fteDelta > 0);
  assert.ok(option.org.targetGain > 0);
});

test('single option simulation returns the same shape as compare', async () => {
  const single = await simulateDecision('pr-07', 'reallocate');
  assert.equal(single.project.id, 'pr-07');
  assert.equal(single.demoToday, '2026-08-16');
  assert.equal(single.option.option, 'reallocate');
  const cmp = await compareDecisions('pr-07');
  const fromCompare = cmp.options.find((option) => option.option === 'reallocate');
  assert.equal(single.option.financial.netPlanningImpact, fromCompare.financial.netPlanningImpact);
  assert.equal(single.option.after.exposure.score, fromCompare.after.exposure.score);
});

test('scenario ranking puts Payments 3.0 first and Search Relevance last', async () => {
  const scenarios = await listScenarios();
  assert.equal(scenarios.length, 10);
  assert.equal(scenarios[0].project.id, 'pr-07');
  assert.equal(scenarios[0].signals.exposure.score, 68);
  assert.equal(scenarios[0].signals.exposure.label, 'high');
  assert.equal(scenarios[9].project.id, 'pr-08');
  const pr09 = scenarios.find((scenario) => scenario.project.id === 'pr-09');
  assert.equal(pr09.signals.exposure.label, 'high');
  const pr02 = scenarios.find((scenario) => scenario.project.id === 'pr-02');
  assert.equal(pr02.signals.exposure.label, 'medium');
});

test('option descriptors expose only the four supported options', () => {
  const descriptors = getOptions('pr-07');
  assert.deepEqual(
    descriptors.map((descriptor) => descriptor.key),
    ['continue', 'staffing', 'reallocate', 'knowledge_transfer'],
  );
});

test('editable assumptions are surfaced and live-edits shift the estimate', async () => {
  const assumptions = listAssumptions();
  const role = assumptions.find((entry) => entry.role === 'default');
  assert.ok(role);
  assert.equal(role.billing_target_per_fte, 3_900_000);
  assert.equal(role.annual_cost_per_fte, 2_500_000);
  assert.equal(role.working_days_per_year, 220);
  assert.equal(role.recovery_rate, 0.35);

  const before = await compareDecisions('pr-07');
  const baselineBefore = before.options.find((option) => option.option === 'continue').financial.baselineExposure;

  const updated = updateAssumption(role.id, { billing_target_per_fte: 4_000_000 });
  assert.equal(updated.role, 'default');
  assert.equal(updated.billing_target_per_fte, 4_000_000);

  const after = await compareDecisions('pr-07');
  const baselineAfter = after.options.find((option) => option.option === 'continue').financial.baselineExposure;
  assert.ok(baselineAfter > baselineBefore, 'a higher billing target raises the baseline exposure estimate');

  updateAssumption(role.id, { billing_target_per_fte: 3_900_000 });
  const restored = await compareDecisions('pr-07');
  const baselineRestored = restored.options.find((option) => option.option === 'continue').financial.baselineExposure;
  assert.equal(baselineRestored, baselineBefore);
});