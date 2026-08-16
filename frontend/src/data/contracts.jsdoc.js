/**
 * AI-EIP mock data contracts (documented with JSDoc since the app is JS).
 *
 * These shapes mirror the spec's TypeScript contract and are used by the
 * deterministic fixtures in fixtures.js and the selectors in service.js.
 */

/**
 * @typedef {'critical'|'high'|'medium'|'low'} Severity
 */

/**
 * @typedef {'schedule'|'dependency'|'knowledge'|'capacity'|'quality'} RiskCategory
 */

/**
 * @typedef {'rising'|'stable'|'improving'} RiskTrend
 */

/**
 * @typedef {'open'|'monitoring'|'mitigated'} RiskState
 */

/**
 * @typedef {'on_track'|'at_risk'|'paused'|'complete'} ProjectStatus
 */

/**
 * @typedef {'reliability'|'mentorship'|'delivery'|'knowledge_sharing'} ContributionType
 */

/**
 * @typedef {'primary'|'capable'|'learning'} ExpertiseLevel
 */

/**
 * @typedef {{ id: string; label: string; source: string; occurredAt: string; url?: string }} RiskSignal
 */

/**
 * @typedef {{
 *   id: string;
 *   name: string;
 *   initials: string;
 *   role: string;
 *   yearsOfExperience: number;
 *   teamId: string;
 *   avatarColor: string;
 *   availabilityFte: number;
 *   capabilities: { capabilityId: string; name: string; criticality: number; level: ExpertiseLevel; lastUsedAt: string|null }[];
 *   expertise: { knowledgeAreaId: string; level: ExpertiseLevel; lastContributionAt: string }[];
 * }} Person
 */

/**
 * @typedef {{
 *   id: string;
 *   name: string;
 *   managerId: string;
 *   capacityPct: number;
 *   healthScore: number;
 *   memberIds: string[];
 * }} Team
 */

/**
 * @typedef {{
 *   id: string;
 *   name: string;
 *   criticality: number;
 *   coverage: number;
 *   documentationFreshnessDays: number;
 *   expertIds: string[];
 *   linkedProjectIds: string[];
 * }} KnowledgeArea
 */

/**
 * @typedef {{
 *   id: string;
 *   name: string;
 *   description: string;
 *   type: 'new_feature'|'migration'|'modernization'|'platform'|'maintenance'|'client_delivery'|'research';
 *   phase: 'planning'|'design'|'implementation'|'testing'|'release'|'maintenance'|'complete';
 *   status: ProjectStatus;
 *   healthScore: number;
 *   healthDelta: number;
 *   deliveryConfidence: number;
 *   targetDate: string;
 *   teamIds: string[];
 *   teamSize: number;
 *   ownerIds: string[];
 *   teams: { id: string; name: string }[];
 *   owners: { id: string; name: string }[];
 *   knowledgeAreas: { id: string; name: string }[];
 *   topDriver: string;
 *   trend: { date: string; score: number }[];
 *   risk: { score: number; severity: Severity; confidence: number; drivers: { riskId: string; title: string; category: RiskCategory; severity: Severity; score: number; evidence: string[] }[] };
 *   aiMetadata: { lastAnalyzedAt: string; confidence: number; signalsUsed: string[] };
 * }} Project
 */

/**
 * @typedef {{
 *   id: string;
 *   title: string;
 *   projectId: string;
 *   severity: Severity;
 *   category: RiskCategory;
 *   confidence: number;
 *   probability: number;
 *   impact: number;
 *   trend: RiskTrend;
 *   status: RiskState;
 *   ownerId: string;
 *   lastSignalAt: string;
 *   signals: RiskSignal[];
 * }} Risk
 */

/**
 * @typedef {{
 *   id: string;
 *   personId: string;
 *   type: ContributionType;
 *   summary: string;
 *   evidenceIds: string[];
 *   occurredAt: string;
 *   visibility: 'public' | 'private';
 * }} Recognition
 */

export {};
