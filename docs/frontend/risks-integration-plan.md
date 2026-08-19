# Risk Module Integration Plan

Status: IMPLEMENTED

## Goal

Migrate the Risks register and the evidence drawer from mock data to the real Express backend risk endpoints, per `docs/frontend/backend-integration-guide.md`. Picks up after Overview → People → Projects → Teams → Knowledge → Recognition.

## Backend Contract (verified live)

- `GET /api/risks` → `{ risks: RiskDTO[] }` (18 risks)
- `GET /api/risks/:riskId` → `{ risk: RiskDTO }` (404 `{ error: { message } }` if missing)
- `PATCH /api/risks/:riskId` → `{ risk: RiskDTO }` (exists; no update UI yet)
- RiskDTO:
  ```
  {
    id, title, projectId, projectName: string|null,
    severity, category, confidence, probability, impact, urgency, score,
    trend, status, ownerId: string|null, lastSignalAt: string|null,
    signals: [{ id, label, source, occurredAt, url }],
    actions: [{ id, title, ownerId, dueDate, status, expectedOutcome }]
  }
  ```

The DTO covers every field the page and drawer render (including `projectName`, so the drawer's mock `getProject()` lookup is no longer needed). **No adapter needed.**

## Changes

### 1. `src/pages/Risks/index.jsx`

- Replaced `getRisks()` / `riskSummary()` / `getRisk()` with `useData(fetchRisks)` + `LoadingState variant="table"` / `ErrorState onRetry`.
- KPIs derived in-component from the real list: `critical` / `high` counts, `rising` trend count, and `overdueActions` computed from real prevention actions (`dueDate < today`; the mock's hardcoded `2` is gone — real data shows `0`).
- `openRisk` passes the table row directly (list DTOs are complete with `signals` + `actions`, so no extra `getRisk(id)` lookup is needed).

### 2. `src/components/ui/EvidenceDrawer.jsx`

- Project chip now uses the backend-provided `projectName` / `projectId` (`project = risk.projectName ? { id: risk.projectId, name: risk.projectName } : null`) instead of mock `getProject()`; chip still hides when a risk has no linked project.

### 3. Mock removal from `src/data/service.js`

- Removed: `fetchRisks`, `getRisks`, `getRisk`, `riskSummary`, `riskBySeverityAndCategory` (only referenced by a "REMAINING" Overview comment), and the now-dead `simulateLatency` helper + empty "Fetchers (async)" section header.
- Kept: `getRisksForProject` + the `risks` fixture (Composer page is not yet wired to the backend).

## Verification

- Live: `/api/risks` returns 18 risks with all rendered fields (title, severity, category, confidence, trend, status, probability, impact, projectId, projectName, signals, actions). KPIs on live data: critical 2, high 4, rising 7, overdueActions 0.
- Backend `npm test`: 15/15 pass (no backend changes).
- `npm run lint` + `npm run build` in `frontend/` both pass.
- Grep: no live references to removed mock selectors anywhere in `src/`.

## Out of Scope

- No backend changes, no adapter/new hooks.
- `updateRisk` (PATCH) stays unused — the "Assign / Mitigate" workflow is a REMAINING UI note on the Risks page.
- Trend column with directional arrow (`trendConfig`) and signal highlighting in the drawer remain REMAINING UI work.
- `getRisksForProject` stays on mock until the Composer module is wired.
