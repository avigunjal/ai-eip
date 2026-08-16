// Skill-to-requirement matching for the team composer.
// Scores a person's capability cards against a project's skill needs, with a
// weighted score so critical skills and stronger levels contribute more.

const LEVEL_SCORES = { primary: 1, capable: 0.8, learning: 0.5, unverified: 0.3 };

export function levelScore(level) {
  return LEVEL_SCORES[level] ?? 0;
}

// @param personCapabilities [{ capabilityId, level }]
// @param requirements     [{ capabilityId, name, weight }]
// @returns { score, coverage, matchedSkills, missingSkills }
export function matchCapabilities(personCapabilities, requirements) {
  const cards = personCapabilities ?? [];
  const cardsByCapability = new Map(cards.map((card) => [card.capability_id, card]));
  const coverage = {};
  let matchedWeight = 0;
  let totalWeight = 0;
  for (const requirement of requirements) {
    const card = cardsByCapability.get(requirement.capability_id);
    const matched = Boolean(card);
    coverage[requirement.name] = matched;
    totalWeight += Number(requirement.weight);
    if (matched) matchedWeight += Number(requirement.weight) * levelScore(card.level);
  }
  const score = totalWeight ? Math.round((matchedWeight / totalWeight) * 100) : 100;
  const matchedSkills = requirements.filter((requirement) => coverage[requirement.name]).map((requirement) => requirement.name);
  const missingSkills = requirements.filter((requirement) => !coverage[requirement.name]).map((requirement) => requirement.name);
  return { score, coverage, matchedSkills, missingSkills };
}