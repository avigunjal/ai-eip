// Shared API contract types (JSDoc style, since the backend is JS).
// Single source of truth for the DTO shapes returned by the API. These mirror
// the frontend fixture contracts (frontend/src/data/contracts.jsdoc.js).

/**
 * @typedef {'critical'|'high'|'medium'|'low'} Severity
 * @typedef {'schedule'|'dependency'|'knowledge'|'capacity'|'quality'} RiskCategory
 * @typedef {'rising'|'stable'|'improving'} RiskTrend
 * @typedef {'open'|'monitoring'|'mitigated'} RiskState
 * @typedef {'on_track'|'at_risk'|'paused'|'complete'} ProjectStatus
 * @typedef {'primary'|'capable'|'learning'|'unverified'} ExpertiseLevel
 * @typedef {'reliability'|'mentorship'|'delivery'|'knowledge_sharing'} ContributionType
 */

/**
 * @typedef {{ id: string; label: string; source: string; occurredAt: string; url?: string }} Signal
 * @typedef {{ id: string; title: string; ownerId: string|null; dueDate: string; status: string; expectedOutcome: string|number }} Action
 */

/**
 * @typedef {{
 *   id: string; name: string; initials: string; role: string; yearsOfExperience: number;
 *   teamId: string|null;
 *   availabilityFte: number; avatarColor: string;
 *   expertise: { knowledgeAreaId: string; level: ExpertiseLevel; lastContributionAt: string }[];
 *   capabilities: { capabilityId: string; name: string; criticality: number; level: ExpertiseLevel; lastUsedAt: string|null }[];
 * }} Person
 */

/**
 * @typedef {{
 *   id: string; name: string; managerId: string|null; sustainableCapacityFte: number;
 *   committedFte: number; unplannedFte: number; capacityPct: number; deliveryPressure: number;
 *   healthScore: number; memberIds: string[]; projectIds: string[];
 * }} Team
 */

/**
 * @typedef {{
 *   id: string; name: string; criticality: number; coverageScore: number;
 *   teamCoverage: { teamId: string; teamName: string; coverageScore: number }[];
 * }} Capability
 */

/**
 * @typedef {{
 *   id: string; name: string; description: string;
 *   type: 'new_feature'|'migration'|'modernization'|'platform'|'maintenance'|'client_delivery'|'research';
 *   phase: 'planning'|'design'|'implementation'|'testing'|'release'|'maintenance'|'complete';
 *   clientId: string|null; clientName: string|null;
 *   status: ProjectStatus; healthScore: number; healthDelta: number; deliveryConfidence: number;
 *   targetDate: string; teamIds: string[]; teamSize: number; ownerIds: string[];
 *   teams: { id: string; name: string }[]; owners: { id: string; name: string }[];
 *   knowledgeAreas: { id: string; name: string }[];
 *   topDriver: string|null; trend: { date: string; score: number }[];
 *   risk: { score: number; severity: Severity; confidence: number; drivers: { riskId: string; title: string; category: RiskCategory; severity: Severity; score: number; evidence: string[] }[] };
 *   aiMetadata: { lastAnalyzedAt: string; confidence: number; signalsUsed: string[] };
 * }} Project
 */

/**
 * @typedef {{
 *   id: string; title: string; projectId: string; projectName: string|null;
 *   severity: Severity; category: RiskCategory; confidence: number; probability: number;
 *   impact: number; urgency: number; score: number; trend: RiskTrend; status: RiskState;
 *   ownerId: string|null; lastSignalAt: string|null; signals: Signal[]; actions: Action[];
 * }} Risk
 */

/**
 * @typedef {{
 *   id: string; name: string; type: string; criticality: number; criticalityScore: number;
 *   coverage: number; documentationFreshnessDays: number; documentationCompleteness: number;
 *   riskScore: number; riskLevel: Severity; dominantExpertShare: number; expertIds: string[];
 *   expertise: { personId: string; name: string; role: string; level: ExpertiseLevel; share: number; lastContributionAt: string; backupOwner: boolean }[];
 *   evidence: { id: string; source: string; statement: string; occurredAt: string; url?: string }[];
 *   transferPlanId: string|null; linkedProjectIds: string[];
 * }} KnowledgeArea
 */

/**
 * @typedef {{
 *   id: string; title: string; areaId: string; riskLevel: Severity; ownerId: string|null;
 *   backupOwnerId: string|null; nextSessionAt: string|null; dueDate: string; status: string;
 *   progress: number; fromCoverage: number; targetCoverage: number; actions: Action[];
 * }} TransferPlan
 */

/**
 * @typedef {{
 *   id: string; personId: string; person: { id: string; name: string };
 *   project: { id: string; name: string }|null; knowledgeArea: { id: string; name: string }|null;
 *   type: ContributionType; summary: string; occurredAt: string;
 *   visibility: 'public'|'private'; evidenceIds: string[];
 * }} Recognition
 */

/**
 * @typedef {{
 *   id?: string; name: string; project: { id: string; name: string };
 *   requiredSkills: string[]; recommendedTeam: { id: string; name: string; role: string|null; teamId: string|null; availabilityFte: number; fitScore: number; coverage: Record<string, boolean> }[];
 *   assessment: { coverageScore: number; missingSkills: string[]; confidence: number };
 *   rationale: string; tradeOff: string; impact: string;
 *   alternatives: { name: string; project: { id: string; name: string }; recommendedTeam: unknown[]; assessment: unknown; tradeOff: string }[];
 * }} TeamRecommendation
 */

/**
 * @typedef {{
 *   id: string; level: Severity; score: number; summary: string; confidence: number;
 *   evidence: string[]; drivers: string[]; recommendedActions: string[]; assumptions: string[];
 * }} Insight
 */

export {};