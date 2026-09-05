// Structured output schemas shared by the AI providers. The xAI Responses API
// enforces these with strict JSON Schema; OpenRouter uses them as best-effort
// json_object guidance, so every response is also validated/coerced in the
// AI service before it reaches a client.

const STRING_ARRAY = { type: 'array', items: { type: 'string' } };

const EVIDENCE_ITEM = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'type', 'summary'],
  properties: {
    id: { type: 'string' },
    type: { type: 'string' },
    summary: { type: 'string' },
  },
};

export const PROJECT_ANALYSIS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['summary', 'findings', 'recommendedActions'],
  properties: {
    summary: { type: 'string' },
    findings: STRING_ARRAY,
    recommendedActions: STRING_ARRAY,
    confidence: { type: 'number' },
    evidence: { type: 'array', items: EVIDENCE_ITEM },
  },
};

export const INSIGHT_EXPLANATION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['explanations'],
  properties: {
    explanations: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['insightId', 'explanation'],
        properties: {
          insightId: { type: 'string' },
          explanation: {
            type: 'object',
            additionalProperties: false,
            required: ['reasoning', 'impact'],
            properties: {
              reasoning: { type: 'string' },
              impact: { type: 'string' },
            },
          },
        },
      },
    },
  },
};

export const COMPOSITION_EXPLANATION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['explanation'],
  properties: {
    explanation: {
      type: 'object',
      additionalProperties: false,
      required: ['whyThisTeam', 'tradeOffs', 'expectedImpact'],
      properties: {
        whyThisTeam: { type: 'string' },
        tradeOffs: { type: 'string' },
        expectedImpact: { type: 'string' },
        confidence: { type: 'number' },
      },
    },
  },
};

export const RECOGNITION_EXPLANATION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['narrative'],
  properties: {
    narrative: { type: 'string' },
  },
};