// People domain service. Returns frontend-shaped person records.
//
// Field semantics (career profile):
//   role               → organizational level
//   yearsOfExperience  → career experience
//   capabilities       → technical competency (name + proficiency level)
//   expertise          → knowledge/organizational expertise
//   availabilityFte    → current capacity (0–1 of full-time equivalent)

import * as repository from './person.repository.js';
import { initialsOf, deterministicHue } from '../../utils/deterministic-random.js';

// Hue rotation keeps avatar colors deterministic but distinct per person.
const AVATAR_COLORS = ['#2563EB', '#0F9F8A', '#D88A12', '#7C5CE0', '#D14343', '#0DA6D6', '#3385F0', '#099F69'];

function avatarColor(id) {
  return AVATAR_COLORS[deterministicHue(id) % AVATAR_COLORS.length];
}

async function toPerson(row) {
  const capabilities = await repository.findCapabilities(row.id);
  const expertise = await repository.findExpertise(row.id);
  return {
    id: row.id,
    name: row.name,
    initials: initialsOf(row.name),
    role: row.role,
    yearsOfExperience: row.years_of_experience,
    teamId: row.team_id ?? null,
    availabilityFte: Number(row.availability_fte),
    avatarColor: avatarColor(row.id),
    expertise: expertise.map((item) => ({
      knowledgeAreaId: item.knowledge_area_id,
      level: item.level,
      lastContributionAt: item.last_contributed_at,
    })),
    capabilities: capabilities.map((item) => ({
      capabilityId: item.id,
      name: item.name,
      criticality: Number(item.criticality),
      level: item.level,
      lastUsedAt: item.last_used_at ?? null,
    })),
  };
}

export async function listPeople() {
  return Promise.all((await repository.findAll()).map(toPerson));
}

export async function getPersonById(id) {
  const row = await repository.findById(id);
  if (!row) return null;
  return toPerson(row);
}

export async function listPeopleByTeam(teamId) {
  return Promise.all((await repository.findByTeam(teamId)).map(toPerson));
}