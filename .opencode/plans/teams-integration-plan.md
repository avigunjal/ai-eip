# Teams Module Integration Plan

Status: IMPLEMENTED

## Goal

Migrate the Teams pages from mock data to the real Express backend team endpoints, per `docs/frontend/backend-integration-guide.md`. Third module in the order: Overview → People → Projects → Teams → Knowledge → Recognition.

## Backend Contract (verified live)

- `GET /api/teams` → `{ teams: TeamDTO[] }` (9 teams)
- `GET /api/teams/:teamId` → `{ team: TeamDTO }` (404 `{ error: { message } }` if missing)
- TeamDTO:
  ```
  {
    id, name, managerId, sustainableCapacityFte, committedFte, unplannedFte,
    capacityPct, deliveryPressure, healthScore,
    memberIds: string[], projectIds: string[]
  }
  ```

The TeamDTO contains every field the Teams pages render directly (name, capacityPct, healthScore, memberIds) → **no adapter needed**.

## Changes

### 1. `src/pages/Teams/index.jsx`

- Replace `const teams = getTeams();` with `useData(fetchTeams)` (`fetchTeams` from `src/api/teams.js`).
- Add `LoadingState` (default) + `ErrorState onRetry` — page currently has no loading/error handling.
- KPI row (Teams / Overloaded / Engineers) unchanged.
- Keep mock `getProjects()` for per-card project count and `getPeople()` for member avatars (cross-module enrichment stays on mocks).

### 2. `src/pages/TeamDetail/index.jsx`

- Change `fetchTeam` import from `../../data/service.js` to `../../api/teams.js`.
- Already uses the `useData` loading / error / not-found pattern — no other change.
- Keep mock `getPeople()` (Members tab names/roles/avatars) and `getProjectsForTeam()` (Projects tab table).

### 3. Mock removal from `src/data/service.js` (after verification)

- Remove `fetchTeams` (async mock — already unreferenced) and `fetchTeam` (async mock — dead after TeamDetail swap).
- Keep `getTeams` (CommandPalette, Composer), `getTeam` (PersonProfile), `getProjectsForTeam` (TeamDetail enrichment), `getProjects`, `getPeople`.

## Rationale

- Teams-only APIs used; member/project resolution stays on mock selectors because those modules are not yet integrated (matches the PersonProfile precedent: real person + mock team/areas/recognition).
- Ids align between mock fixtures and backend seed (`t-01`, `p-04`), so real team ids resolve correctly against mock people/projects.

## Verification

- Live: `curl http://localhost:4000/api/teams` and `/api/teams/t-01` shapes.
- `npm run lint` + `npm run build` in `frontend/`.
- Grep: no `fetchTeams` / `fetchTeam` references outside `src/api/teams.js` and TeamDetail's new import.

## Out of Scope

- No backend changes, no new hooks/adapters/API modules.
- No changes to Teams' member/project enrichment sources (stays on mock).