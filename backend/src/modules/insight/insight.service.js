// Deterministic insight generation. Converts seeded evidence and calculated
// scores into concise, explainable findings. Runs fully offline with no LLM;
// every insight cites its drivers, evidence, and assumptions.

import { listAreas } from '../knowledge/knowledge.service.js';
import { listRisks } from '../risk/risk.service.js';
import { listProjects } from '../project/project.service.js';

const WATCH_SEVERITIES = new Set(['critical', 'high']);

function knowledgeInsight(area) {
  const hasBackup = area.expertise.some((person) => person.backupOwner);
  const drivers = [
    hasBackup
      ? `${area.dominantExpertShare}% held by a single primary expert`
      : `No capable backup recorded (${area.dominantExpertShare}% concentrated)`,
    `Coverage is ${area.coverage}% against a criticality of ${area.criticalityScore}`,
    `Documentation last meaningfully updated ${area.documentationFreshnessDays} days ago`,
  ];
  return {
    id: `knowledge-${area.id}`,
    level: area.riskLevel,
    score: area.riskScore,
    summary: hasBackup
      ? `${area.name} still depends heavily on one expert: ${area.dominantExpertShare}% of recent expertise is held by a single primary.`
      : `${area.name} has fragile coverage: ${area.dominantExpertShare}% is held by one expert and no capable backup is recorded.`,
    confidence: 87,
    evidence: area.evidence.slice(0, 3).map((item) => item.statement),
    drivers,
    recommendedActions: area.transferPlanId
      ? ['Assign a backup', 'Pair on the next release', 'Update the runbook']
      : ['Schedule a knowledge transfer session', 'Pair on real work', 'Document current procedures'],
    assumptions: [
      'Shares reflect the last 90 days of recorded contribution',
      `Criticality ${area.criticalityScore} is set by the owning team`,
    ],
  };
}

function riskInsight(risk) {
  const drivers = [`${risk.category} risk, trend ${risk.trend}`, `Score ${risk.score}/100 (${risk.severity})`];
  return {
    id: `risk-${risk.id}`,
    level: risk.severity,
    score: risk.score,
    summary: `${risk.title}${risk.projectName ? ` on ${risk.projectName}` : ''} is currently ${risk.severity}.`,
    confidence: Math.round(risk.confidence),
    evidence: risk.signals.slice(0, 3).map((signal) => `${signal.label}: ${signal.source}`),
    drivers,
    recommendedActions: risk.actions.length ? risk.actions.map((action) => action.title) : ['Assign an owner and define a mitigation plan'],
    assumptions: [
      'Probability and impact are based on the latest seeded signals',
      'Risk is monitored locally; source systems are not connected yet',
    ],
  };
}

function portfolioInsight(projects) {
  const atRisk = projects.filter((project) => project.status === 'at_risk');
  if (!atRisk.length) return null;
  const averageHealth = Math.round(atRisk.reduce((sum, project) => sum + project.healthScore, 0) / atRisk.length);
  return {
    id: 'portfolio-delivery-pressure',
    level: atRisk.length >= 3 ? 'high' : 'medium',
    score: averageHealth,
    summary: `${atRisk.length} projects are at risk with an average health score of ${averageHealth}.`,
    confidence: 80,
    evidence: atRisk.slice(0, 3).map((project) => `${project.name}: health ${project.healthScore}, confidence ${project.deliveryConfidence}%`),
    drivers: atRisk.slice(0, 3).map((project) => project.topDriver).filter(Boolean),
    recommendedActions: ['Review delivery confidence for the at-risk projects', 'Reconfirm owners and target dates'],
    assumptions: ['Health scores are recalculated from seeded risk state'],
  };
}

export async function listInsights() {
  const [areas, risks, projects] = await Promise.all([listAreas(), listRisks(), listProjects()]);
  const insights = [];
  const portfolio = portfolioInsight(projects);
  if (portfolio) insights.push(portfolio);
  for (const area of areas) {
    if (WATCH_SEVERITIES.has(area.riskLevel)) insights.push(knowledgeInsight(area));
  }
  for (const risk of risks) {
    if (WATCH_SEVERITIES.has(risk.severity)) insights.push(riskInsight(risk));
  }
  return insights.slice(0, 8);
}