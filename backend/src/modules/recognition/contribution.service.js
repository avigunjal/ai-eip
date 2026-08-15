// Contribution attribution logic.
// TODO: attribute PRs/reviews/docs/mentorship to impact types.

export function attributeContribution(event) {
  // Map raw event -> { type, evidence, summary }
  return { type: 'delivery', evidence: event };
}
