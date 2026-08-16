# Insights Contract Integration Plan

Status: IMPLEMENTED

## Goal

Fix the Insight contract: keep the backend domain/API intelligence model untouched, and move all Insights rendering through the API-adapter → ViewModel → InsightCard pipeline. Previously the Insights page read a hard-coded static mock (`src/data/insights.js`) and never touched the backend, while the Overview module already mapped real insights through an adapter. This unifies both pages on the same contract.

## Contract

### Backend domain/API model (unchanged — do not modify)

`GET /api/insights` → `{ insights }` (8 items):

```
{ id, level, score, summary, confidence, evidence[], drivers[], recommendedActions[], assumptions[] }
```

### Frontend ViewModel (what InsightCard expects)

```
{
  id, title, summary, severity, confidence, evidenceCount,
  why: { evidence[], reasoning, impact, assessment, assessmentTone }
}
```

### Mapping (backend → ViewModel)

- `severity` ← `level`
- `confidence` ← `confidence`
- `evidenceCount` ← `evidence.length`
- `why.evidence` ← `evidence`
- `why.reasoning` ← `drivers.join('. ')`
- `why.impact` ← `recommendedActions.join('. ')`
- `why.assessment` + `why.assessmentTone` ← deterministic map from `level` (critical/high → High Risk · error, medium → Medium Risk · warning, low → Positive · success)
- `title` ← `summary` (backend has no separate title)

## Changes

### 1. `src/api/insights.adapter.js` (new)

- Moved `mapInsightToViewModel` + `SEVERITY_ASSESSMENT` here from `dashboard.adapter.js`. The insight contract now lives with the Insights module and is shared by Overview + Insights. Pure mapping: no HTTP, no React.

### 2. `src/api/dashboard.adapter.js`

- Removed the insight mapping; now only Overview adapters (`buildChain`, `mapDashboardOverview`). Header notes that insight mapping lives in `insights.adapter.js`.

### 3. `src/hooks/useDashboard.js`

- `mapInsightToViewModel` now imported from `../api/insights.adapter.js` (Overview unchanged otherwise).

### 4. `src/pages/Insights/index.jsx`

- Replaced `import { insights } from '../../data/insights.js'` with `useData(fetchInsights)` + `mapInsightToViewModel` from the new adapter.
- Added `LoadingState` / `ErrorState onRetry` (page previously had no loading/error handling).
- Feed is grouped into Needs review / Saved / Dismissed exactly as before; Save / Dismiss / Undo behavior unchanged (store keyed by insight id, which the backend provides).

### 5. `src/data/insights.js` (deleted)

- Static mock was only imported by the Insights page; removed.

## Verification

- Live: `GET /api/insights` returns 8 insights in the unchanged backend model. Adapter output verified against live data: full ViewModel keys (`id,title,summary,severity,confidence,evidenceCount,why`), e.g. `knowledge-k-01` → severity `critical`, confidence 87, evidenceCount 3, why{evidence×3, reasoning, impact, assessment 'High Risk', assessmentTone 'error'}.
- `npm run lint` + `npm run build` in `frontend/` both pass.
- Grep: no references to `data/insights` remain.

## Out of Scope

- No backend changes (domain model preserved by design).
- `generateInsights` (`POST /api/ai/insights`) remains unused (no UI calls it).
- `InsightCard` unchanged; `title === summary` display is the established Overview behavior.