// AI orchestration: retrieve evidence -> build context -> call LLM -> format.
// Main entry point for AI-generated insights.

import { generateInsight } from './llm.js';
import { retrieveEvidence } from './retrieval.js';

export async function runPipeline(question, filters) {
  const evidence = await retrieveEvidence(filters);
  const prompt = buildPrompt(question, evidence);
  const llmOutput = await generateInsight(prompt);
  return { evidence, llmOutput };
}

function buildPrompt(question, evidence) {
  // TODO: select prompt template by domain (project-risk, knowledge, ...)
  return { question, evidence };
}
