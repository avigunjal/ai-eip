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

- Replaced `const teams = getTeams();` with `useData(fetchTeams)` (`fetchTeams` from `src/api/teams.js`).
- Added `LoadingState` (default) + `ErrorState onRetry` — page previously had no loading/error handling.
- KPI row (Teams / Overloaded / Engineers) unchanged.
- Kept mock `getProjects()` for per-card project count and `getPeople()` for member avatars (cross-module enrichment stays on mocks).

### 2. `src/pages/TeamDetail/index.jsx`

- Changed `fetchTeam` import from `../../data/service.js` to `../../api/teams.js`.
- Already used the `useData` loading / error / not-found pattern — no other change.
- Kept mock `getPeople()` (Members tab names/roles/avatars) and `getProjectsForTeam()` (Projects tab table).

### 3. Mock removal from `src/data/service.js`

- Removed `fetchTeams` (async mock — was already unreferenced) and `fetchTeam` (async mock — dead after TeamDetail swap).
- Kept `getTeams` (CommandPalette, Composer), `getTeam` (PersonProfile), `getProjectsForTeam` (TeamDetail enrichment), `getProjects`, `getPeople`.

## Rationale

- Teams-only APIs used; member/project resolution stays on mock selectors because those modules are not yet integrated (matches the PersonProfile precedent: real person + mock team/areas/recognition).
- Ids align between mock fixtures and backend seed (`t-01`, `p-04`), so real team ids resolve correctly against mock people/projects.

## Verification

- Live: `curl http://localhost:4000/api/teams` (9 teams, all have name/capacityPct/healthScore/memberIds) and `/api/teams/t-01` (Payments Engineering, cap 116, health 43).
- `npm run lint` + `npm run build` in `frontend/` both pass.
- Grep: no `fetchTeams` / `fetchTeam` references outside `src/api/teams.js` and the two pages' new imports.

## Out of Scope

- No backend changes, no new hooks/adapters/API modules.
- No changes to Teams' member/project enrichment sources (stays on mock).