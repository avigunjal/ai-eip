# People Module — Frontend Integration Plan

> Frontend-specific, actionable plan for integrating the **People** module with
> the real backend. Governed by
> [`backend-integration-guide.md`](./backend-integration-guide.md).
>
> **Status: IMPLEMENTED** and verified against the live backend
> (`GET /api/people/:personId` returns 200; PersonProfile renders real person
> data with mock team/area/recognition lookups still resolving). Lint + build pass.

---

## 1. Scope

- Only People page: `src/pages/PersonProfile/index.jsx` (`/people/:personId`).
- Only People API: `GET /api/people/:personId`.
- Keep Overview, Projects, Teams, Knowledge, Recognition untouched (mock).

**Not touched:** `getPeople()`/`getPerson()` (shared by 8 other modules),
`src/data/insights.js`, all other module mocks.

---

## 2. Key finding: near-zero-diff integration

The backend Person DTO **already matches the frontend contract exactly**:

| Field | Backend | Frontend mock |
|---|---|---|
| `id`, `name`, `initials`, `role` | ✓ | ✓ |
| `yearsOfExperience` | ✓ | ✓ |
| `teamId` (nullable) | ✓ | ✓ |
| `availabilityFte` | ✓ | ✓ |
| `avatarColor` | ✓ | ✓ |
| `expertise[]` (`knowledgeAreaId`, `level`, `lastContributionAt`) | ✓ | ✓ |
| `capabilities[]` (`capabilityId`, `name`, `criticality`, `level`, `lastUsedAt`) | ✓ | ✓ |

Therefore **no adapter and no new hook are required** (guide §4: "Do not create
a new architectural pattern if an equivalent pattern already exists"). The
service (`src/api/people.js`) and the loading pattern (`useData`) already exist.

Id alignment: mock fixtures and backend seed use the same id scheme
(`p-01`, `t-01`, `k-01..k-16`), so real person data + mock team/area/recognition
lookups render correctly on the page.

---

## 3. Current-state analysis (inspected)

- `PersonProfile` consumes: `fetchPerson` (People mock), `getTeam`,
  `getKnowledgeAreas`, `getRecognitions` (other-module mocks).
- `getPeople()` (sync) is used by CommandPalette, Composer, TransferPlans,
  TeamDetail, Knowledge, KnowledgeDetail, Teams, Recognition → **stays**.
- `fetchPerson` is used only by PersonProfile; `fetchPeople` is not used by any
  page → both are the People-specific mock fetchers.
- Loading/error/empty are already handled in the page:
  `LoadingState`, `ErrorState onRetry`, `if (!person)` → "Person not found",
  empty recognitions → "No recognition yet."

---

## 4. Implementation

### Changed

1. `src/pages/PersonProfile/index.jsx` — split the import:
   - `fetchPerson` from `../../api/people.js` (existing service).
   - `getTeam, getRecognitions, getKnowledgeAreas` stay from
     `../../data/service.js` (other-module mocks, deferred).
   - `useData(() => fetchPerson(personId), [personId])` unchanged (matches
     ProjectDetail/TeamDetail).

2. `src/data/service.js` — after verification, removed the now-dead People mock
   fetchers `fetchPeople` and `fetchPerson` (grep-confirmed no other importers).
   `getPeople`/`getPerson` remain (used by other modules).

### Reused unchanged

- `src/api/client.js`, `src/api/people.js`, `useData`,
  `LoadingState`/`ErrorState`.

---

## 5. Mock data removal (People only)

- Removed: `fetchPeople`, `fetchPerson` from `src/data/service.js`.
- Kept: `getPeople`/`getPerson`, all other module mocks, `data/insights.js`.

---

## 6. UI states

- Loading: existing `LoadingState`.
- Error: existing `ErrorState onRetry`.
- Empty: `if (!person)` → "Person not found"; empty recognition list already
  handled ("No recognition yet.").

---

## 7. Testing & verification

- No frontend test runner exists → manual + lint (consistent with Overview).
- No adapter → nothing to unit-test.
- Live-verified: `GET /api/people/p-01` → 200, DTO matches; PersonProfile
  renders real name/role/team/expertise.
- `npm run lint` and `vite build` pass.

---

## 8. Definition of Done

- [x] `GET /api/people/:personId` integrated via existing `src/api/people.js`.
- [x] PersonProfile renders real person data; team/area/recognition lookups
      still resolve (id alignment).
- [x] Loading/error/empty states work.
- [x] Lint passes.
- [x] Only `fetchPeople`/`fetchPerson` mock removed; nothing else touched.

---

## 9. Deferred (other modules, later)

- Team name lookup → `GET /api/teams/:teamId` (Teams module).
- Expertise area names → `GET /api/knowledge` (Knowledge module).
- Person recognition list → `GET /api/recognition/feed` (Recognition module).