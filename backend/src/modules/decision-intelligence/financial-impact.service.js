// Financial planning impact — approximated from editable planning assumptions.
//
// There is no financial data in the platform, so every figure here is derived
// from the seeded `financial_assumptions` table and is presented as a planning
// estimate, never as an actual salary, billing, margin, or revenue record.
//
// Model (every value in INR):
//
//   dailyValue          = billing_target_per_fte / working_days_per_year
//   windowDays          = remaining days to the target date
//   baselineExposure    = exposureBefore/100 · windowDays · dailyValue · recoveryRate
//   optionExposure      = exposureAfter/100  · windowDays · dailyValue · recoveryRate
//   avoidedExposure     = baselineExposure − optionExposure
//   staffingCost        = fteDelta · annual_cost_per_fte · (windowDays / working_days)  — internal reallocations cost ₹0
//   netPlanningImpact   = avoidedExposure − staffingCost
//
// "Continue" and "knowledge transfer" add no capacity, so their staffing cost is
// ₹0. "Reallocate" moves an internal engineer, so it adds no payroll either;
// only "Add staffing scenario" books a prorated cost for the additional FTE.

import { findAssumptionByRole } from './decision.repository.js';

function assumptionRow(ctx, role) {
  if (role) {
    const row = findAssumptionByRole(role);
    if (row) return row;
  }
  const fallback = findAssumptionByRole('default') ?? ctx?.assumptions?.default ?? null;
  return fallback ?? { billing_target_per_fte: 3_900_000, annual_cost_per_fte: 2_500_000, working_days_per_year: 220, recovery_rate: 0.35, role: 'default' };
}

export function financialImpact(ctx, { option, beforeExposureScore, afterExposureScore, fteDelta = 0, role, annualCostPerFte }) {
  const windowDays = ctx.currentSignals.exposure.remainingDays;
  const valuation = assumptionRow(ctx);
  const workingDays = Number(valuation.working_days_per_year) || 220;
  const recoveryRate = Number(valuation.recovery_rate) || 0.35;
  const dailyValue = Number(valuation.billing_target_per_fte) / workingDays;

  const scale = (windowDays * dailyValue * recoveryRate) / 100;
  const baselineExposure = Math.round(beforeExposureScore * scale);
  const optionExposure = Math.round(afterExposureScore * scale);
  const avoidedExposure = Math.round(Math.max(0, baselineExposure - optionExposure));

  const costRole = annualCostPerFte ? null : assumptionRow(ctx, role);
  const annualCost = annualCostPerFte ?? (Number(costRole?.annual_cost_per_fte) || 0);
  const staffingCost = option === 'staffing' && fteDelta > 0
    ? Math.round(fteDelta * annualCost * (windowDays / workingDays))
    : 0;

  const netPlanningImpact = Math.round(Math.max(0, avoidedExposure - staffingCost));

  return {
    currency: 'INR',
    dailyValue,
    windowDays,
    remainingDays: windowDays,
    baselineExposure,
    optionExposure,
    avoidedExposure,
    staffingCost,
    netPlanningImpact,
    valuationRole: costRole?.role ?? 'default',
    recoveryRate,
    disclaimer: 'Estimated planning impact based on configurable assumptions — not actual financial records, salary, or revenue.',
  };
}