/**
 * Backend Project DTO → frontend view-model adapters.
 *
 * Pure mapping functions: no HTTP, no React. `project.owners` ships as
 * `{ id, name }`; AvatarGroup needs initials + avatarColor, so they are
 * derived deterministically here (see docs/frontend/backend-integration-guide.md §6).
 */

const AVATAR_COLORS = ['#2563EB', '#0F9F8A', '#D88A12', '#7C5CE0', '#D14343', '#0DA6D6', '#3385F0', '#099F69'];

const initialsOf = (name) =>
  name.trim().split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase();

const colorFor = (id) => {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

/**
 * Map embedded project owners to the `{ id, name, initials, avatarColor }`
 * shape AvatarGroup expects.
 *
 * @param {{ id: string; name: string }[]} owners
 * @returns {{ id: string; name: string; initials: string; avatarColor: string }[]}
 */
export function mapProjectOwners(owners = []) {
  return owners.map((owner) => ({
    id: owner.id,
    name: owner.name,
    initials: initialsOf(owner.name),
    avatarColor: colorFor(owner.id),
  }));
}