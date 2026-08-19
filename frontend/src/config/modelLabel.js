// Short, readable model label for "Powered by / ✦ AI" attribution.
// Strips the provider prefix and the :free variant, e.g.
// "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free" → "nemotron-3-nano-omni-30b-a3b-reasoning".
// The full model id is shown on hover via a Tooltip.
export function modelLabel(model) {
  const last = String(model ?? '').split('/').pop().split(':')[0];
  return last || 'LLM';
}
