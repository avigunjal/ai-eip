// Knowledge concentration engine.
// TODO: detect single-owner systems and fragile expertise.

export function concentrationScore(area) {
  const expertise = area.expertise || [];
  const dominantShare = expertise.reduce((highest, person) => Math.max(highest, Number(person.sharePct || person.share_pct || 0)), 0);
  const hasBackup = expertise.some((person) => Boolean(person.isBackup ?? person.is_backup) && ['capable', 'primary'].includes(person.level));
  const coverageGap = 100 - Number(area.coverageScore ?? area.coverage_score ?? 0);
  const documentationGap = 100 - Number(area.documentationCompleteness ?? area.documentation_completeness ?? 0);
  const availabilityExposure = hasBackup ? 20 : 100;
  const score = Math.round((Number(area.criticality) * 0.35) + (dominantShare * 0.3) + (coverageGap * 0.2) + (documentationGap * 0.1) + (availabilityExposure * 0.05));
  return { concentration: Math.min(100, score), dominantShare, hasBackup, singleOwner: dominantShare >= 70 && !hasBackup };
}
