# AI Composer Module Integration Plan

Status: IMPLEMENTED

## Goal

Migrate the AI Composer page from mock data and a local mock ranking to the real Express backend team-composer endpoints, per `docs/frontend/backend-integration-guide.md`. The backend composer (deterministic capability matching) is the AI layer — the page now renders its recommendation instead of computing one locally.

## Backend Contract (verified live)

- `GET /api/team-composer/recommendations?projectId=<id>` → `{ recommendation: RecommendationDTO }` (404 `{ error: { message } }` if project missing; defaults to `pr-07` when no query param)
- `GET /api/team-composer/teams` → `{ teams: TeamDTO[] }` (same as `GET /api/teams`; has `capacityPct`, `memberIds`)
- `POST /api/team-composer` → `{ recommendation }` (persisted scenario; unused by the page — no save UI yet)
- `GET /api/team-composer/:scenarioId` → `{ scenario }` (unused by the page yet)
- RecommendationDTO:
  ```
  {
    name, project: { id, name },
    requiredSkills: string[],
    recommendedTeam: [{ id, name, role, teamId, availabilityFte, fitScore, coverage, matchedSkills }],
    assessment: { coverageScore, missingSkills, matchedSkills, confidence },
    rationale, tradeOff, impact,
    alternatives: [...]
  }
  ```

Supporting real data the page also consumes (all existing wired modules): `GET /api/projects`, `GET /api/projects/:id/risks`, `GET /api/people`, `GET /api/knowledge/areas`.

## Changes

### 1. `src/pages/Composer/index.jsx`

- Replaced the local mock ranking (in-component `composition` sort over `getPeople()` expertise) with `fetchRecommendations(activeProjectId)` from `api/teamComposer.js`. The composition list now renders `recommendedTeam`; per-person `matchedSkills.length` drives the "N skills" chip.
- Data source per page section:
  - Project selector → `fetchProjects` (real); defaults to the first non-paused/non-complete project (pr-01 Atlas Platform Migration) instead of the API's first row (pr-09 Billing Upgrade, paused).
  - Team capacity KPI → `fetchComposerTeams`, team resolved via `project.teamIds[0]`.
  - Skill coverage KPI → `recommendation.assessment.coverageScore`.
  - Open risk KPI → `fetchProjectRisks(projectId)`, critical/high count.
  - Single-owner KPI + "systems in scope" → `fetchKnowledgeAreas`, filtered by `linkedProjectIds`.
  - Avatars → enriched from `fetchPeople` by id (backend `initials`/`avatarColor`; fallback derives initials from the name).
- "Why this team?" now shows the backend's real `rationale` (Reasoning), `impact` (Impact), and `tradeOff` (an extra Evidence bullet); footer shows `assessment.confidence` + `requiredSkills.length`.
- Loaded via `useData` (per-project `fetchRecommendations` + `fetchProjectRisks` refetch on project switch) with `LoadingState` / `ErrorState onRetry` (retries all queries).
- `aiAssessment` badge logic unchanged — now computed from real coverage/risk values.

### 2. Mock removal from `src/data/service.js`

- Removed `getRisksForProject` (Composer was its only consumer). The `risks` fixture array is left inert in `fixtures.js` (like the knowledge plan's `transferPlans`).
- Kept `getProjects`, `getTeams`, `getPeople`, `getKnowledgeAreas` — still used by CommandPalette, PersonProfile, Knowledge, Teams, Recognition, TransferPlans, TeamDetail.

## Verification

- Live through the vite proxy (port 5173): all six page fetches return 200 and provide every field the page reads — `/api/projects`, `/api/team-composer/teams` (capacityPct 116), `/api/knowledge/areas` (linkedProjectIds/expertIds), `/api/people` (initials/avatarColor), `/api/team-composer/recommendations?projectId=pr-07` (coverage 86, confidence 68, 6 matched skills, recommendedTeam[0] James Brown), `/api/projects/pr-07/risks` (3 critical/high).
- Backend `npm test`: 15/15 pass (no backend changes).
- `npm run lint` + `npm run build` in `frontend/` both pass.
- Grep: no references to removed `getRisksForProject` anywhere in `src/`.

## Out of Scope

- No backend changes, no new hooks/adapters.
- `createScenario` (POST `/api/team-composer`) and `fetchScenario` stay unused — persisted composition drafts are a REMAINING UI note.
- Alternatives (`recommendation.alternatives`) are returned by the backend but not rendered yet.
- Drag/drop draft slots and free-text "compose for a new goal" remain REMAINING UI work.