// Prompt templates, one per AI domain.
// Keep guidance explicit: require confidence + evidence, avoid overclaiming.

export const PROJECT_RISK_PROMPT = `
You are analyzing engineering delivery risk for the AI-EIP platform.
Given evidence, produce findings with: severity, confidence, and evidence references.
Never claim certainty beyond the provided evidence.
`;

export const KNOWLEDGE_PROMPT = `
You analyze knowledge concentration.
For each system, flag single-owner or fragile expertise with confidence.
Propose transfer opportunities.
`;
