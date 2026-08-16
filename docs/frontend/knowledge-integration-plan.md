# Knowledge Module Integration Plan

Status: IMPLEMENTED

## Goal

Migrate the Knowledge pages from mock data to the real Express backend knowledge endpoints, per `docs/frontend/backend-integration-guide.md`. Fourth module in the order: Overview → People → Projects → Teams → Knowledge → Recognition.

## Backend Contract (verified live)

- `GET /api/knowledge` → `{ areas: AreaDTO[] }` (16 areas)
- `GET /api/knowledge/:areaId` → `{ area: AreaDTO }` (404 `{ error: { message } }` if missing)
- `GET /api/knowledge/transfer-plans` → `{ plans: PlanDTO[] }` (4 plans)
- AreaDTO:
  ```
  {
    id, name, type, criticality (1-5), criticalityScore (0-100), coverage,
    documentationFreshnessDays, documentationCompleteness, riskScore, riskLevel,
    dominantExpertShare, expertIds: string[],
    expertise: [{ personId, name, role, level, share, lastContributionAt, backupOwner }],
    evidence: [{ id, source, statement, occurredAt, url }],
    transferPlanId: string|null, linkedProjectIds: string[]
  }
  ```
- PlanDTO:
  ```
  { id, title, areaId, riskLevel, ownerId, backupOwnerId, nextSessionAt, dueDate,
    status, progress, fromCoverage, targetCoverage,
    actions: [{ id, title, ownerId, dueDate, status, expectedOutcome }] }
  ```

Both DTOs match the fields the pages render → **no adapter needed**.

## Changes

### 1. `src/pages/Knowledge/index.jsx`

- Replaced `getKnowledgeAreas()` with `useData(fetchKnowledgeAreas)` + `LoadingState` / `ErrorState onRetry`.
- KPI row derived in-component from the real areas: `criticalRisks` (critical+high count), `singleOwner` (expertise ≤ 1 person OR no `capable` backup — same rule the mock used), `docsFresh` (% with freshness ≤ 30d). `coverageTrend` stays the hardcoded `'+8%'` (no backend source).
- Priority risks table: `priorityKnowledgeRisks()` → `[...areas].sort((a, b) => b.riskScore - a.riskScore)` (all rendered columns exist on AreaDTO).
- Kept mock `getPeople()` for expert avatars (AvatarGroup needs `initials`/`avatarColor`), and mock `transferOpportunities()` (AI suggestions — no backend source) and `areaHierarchy()` (client/project chain — Projects-module enrichment).

### 2. `src/pages/KnowledgeDetail/index.jsx`

- `fetchKnowledgeArea` import from `data/service.js` → `api/knowledge.js`.
- `expertiseGroups(area)` → inline grouping by level using the DTO's real `expertise[].name`; render `m.person?.name` → `m.name`.
- Mitigation plan: mock `getTransferPlan(area.transferPlanId)` → `useData(fetchTransferPlans)` + `plans.find((p) => p.areaId === area.id)` (real plan + actions).
- Kept mock `getProject()` (linked-project chips), `getPeople()` (plan-modal select + action owner names), `areaHierarchy()` (breadcrumb). "Start transfer plan" modal remains a toast (backend has no create endpoint — out of scope).

### 3. `src/pages/TransferPlans/index.jsx`

- `fetchTransferPlans` import from `data/service.js` → `api/knowledge.js`. Already used `useData` + loading/error/empty. Owner/backup names keep mock `getPeople()`.

### 4. Mock removal from `src/data/service.js`

- Removed: `fetchKnowledgeAreas` (already dead), `fetchKnowledgeArea`, `fetchTransferPlans`, `knowledgeRiskSummary`, `priorityKnowledgeRisks`, `expertiseGroups`, `getTransferPlans`, `getTransferPlan`, `getKnowledgeArea` (dead), plus the unused `transferPlans`/`transferPlanById` imports.
- Kept: `getKnowledgeAreas` + mock areas data (CommandPalette, Composer, PersonProfile, `areaHierarchy`, `transferOpportunities`), `getPeople`, `getProject`, `areaHierarchy`, `transferOpportunities`. `transferPlans` fixtures array left inert.

## Verification

- Live: `/api/knowledge` (16 areas, all fields), `/api/knowledge/k-01` (Payment Service, critical 81), `/api/knowledge/transfer-plans` (4 plans with actions). Derived KPIs on live data: critical 4, singleOwner 3, docsFresh 75%. Plan lookup by `areaId` resolves (k-01 → "Raise coverage for Payment Service", 38→65, 4 actions). Real expertise names render (Aarav Sharma et al.).
- `npm run lint` + `npm run build` in `frontend/` both pass.
- Grep: no references to removed mock selectors anywhere in `src/`.

## Out of Scope

- No backend changes, no adapter/new hooks.
- `updateTransferPlan` (PATCH) stays unused (no update UI in TransferPlans).
- Project/client enrichment (`getProject`, `areaHierarchy`, `transferOpportunities`) stays on mock.