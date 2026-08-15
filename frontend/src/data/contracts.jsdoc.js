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
 *   teamId: string;
 *   avatarColor: string;
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
 *   status: ProjectStatus;
 *   healthScore: number;
 *   healthDelta: number;
 *   deliveryConfidence: number;
 *   targetDate: string;
 *   teamIds: string[];
 *   ownerIds: string[];
 *   topDriver: string;
 *   trend: { date: string; score: number }[];
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
