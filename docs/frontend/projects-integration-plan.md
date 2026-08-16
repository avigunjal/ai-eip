# Projects Module — Frontend Integration Plan

> Frontend-specific, actionable plan for integrating the **Projects** module
> with the real backend. Governed by
> [`backend-integration-guide.md`](./backend-integration-guide.md).
>
> **Status: IMPLEMENTED** and verified against the live backend (list: 10
> projects, detail `pr-07` incl. `trend`/`teams`/`owners`/`knowledgeAreas`,
> risks: 3 enriched DTOs). Lint + build pass.

---

## 1. Scope

- Pages: `Projects` list (`/projects`) + `ProjectDetail` (`/projects/:id`).
- APIs: `GET /api/projects`, `GET /api/projects/:id`, `GET /api/projects/:id/risks`.
- Other modules untouched (Teams/Knowledge/Recognition/People still mock).

---

## 2. Key findings (inspected + live-verified)

- Backend Project DTO **matches the frontend contract** on both pages:
  - List fields: `id,name,status,healthScore,deliveryConfidence,targetDate,topDriver` ✓ (10 projects).
  - Detail fields: `trend:[{date,score}]` (12 rows), `teams:[{id,name}]`,
    `owners:[{id,name}]`, `knowledgeAreas:[{id,name}]`, `risk` ✓.
- `GET /api/projects/:id/risks` returns the enriched Risk DTO the Risks tab needs
  (`title,severity,confidence,trend`, etc.) ✓ (3 risks for `pr-07`).
- Service already exists: `src/api/projects.js` (`fetchProjects`,
  `fetchProject`, `fetchProjectRisks`). **No new service/hook** — reuse
  `useData` (ProjectDetail/TeamDetail convention).
- **Only mapping gap:** `project.owners` = `[{id,name}]` but `AvatarGroup`
  requires `{id,name,initials,avatarColor}` → small pure adapter.

---

## 3. Changes

### New file

`src/api/projects.adapter.js` — `mapProjectOwners(owners)`:
derives `initials` from name and a deterministic `avatarColor` from id.
Pure, no HTTP/React (mirrors `dashboard.adapter.js` convention).

### Changed

1. `src/pages/Projects/index.jsx` (list)
   - `getProjects()` → `useData(fetchProjects)` from `src/api/projects.js`.
   - Add loading gate (`LoadingState variant="grid"`) + error
     (`ErrorState onRetry`).
   - Client-side search/status filters + KPI strip unchanged (fields match,
     no adapter).

2. `src/pages/ProjectDetail/index.jsx`
   - `fetchProject` from `src/api/projects.js` (existing `useData` pattern).
   - Risks: `useData(() => fetchProjectRisks(projectId), [projectId])` replaces
     `getRisksForProject`.
   - Team name: `project.teams?.[0]` (embedded) replaces `getTeam`.
   - Owners: `mapProjectOwners(project.owners)` replaces `peopleForProject`.
   - Linked systems: `project.knowledgeAreas` replaces the `knowledgeAreas`
     fixture import.
   - Risks tab: its own loading (`LoadingState variant="table"`) + small error
     fallback (mirrors Overview insights pattern).

### Mock removal (after verification)

Removed from `src/data/service.js` (now dead):
- `fetchProjects`, `fetchProject` (async fetchers).
- `peopleForProject` (used only by ProjectDetail).

Kept (shared with modules still on mocks):
- `getProjects` (Composer, Teams, CommandPalette), `getProject` (EvidenceDrawer,
  KnowledgeDetail), `getRisksForProject` (Composer), `getTeam` (PersonProfile),
  all other selectors.

---

## 4. UI states

- List: skeleton → error → table (empty state already built into DataTable).
- Detail: existing loading/error/not-found; risks tab loading + error fallback;
  empty risks → "No open risks".

---

## 5. Testing & verification

- Manual + lint (no frontend test runner, consistent with prior modules).
- Live-verified: list, detail, and risks endpoints return the expected DTOs;
  adapter run against real `pr-07` owners.
- `npm run lint` + `vite build` pass.

---

## 6. Definition of Done

- [x] List + Detail render real data via existing `src/api/projects.js`.
- [x] Loading/error/empty work on both pages.
- [x] Owners avatars render from `project.owners` via `mapProjectOwners`.
- [x] Risks tab real data.
- [x] Lint + build pass.
- [x] Only Projects mocks removed; shared selectors kept; other modules untouched.

---

## 7. Deferred (other modules, later)

- Owners joined against `/api/people` for full profiles (not needed for avatars;
  Option A chosen).
- Teams/Knowledge/Recognition pages stay on mocks until their modules run.