# Overview Module — Frontend Integration Plan

> Frontend-specific, actionable plan for integrating the **Overview** module with
> the real backend. Governed by
> [`backend-integration-guide.md`](./backend-integration-guide.md) — this plan
> is the "Inspect first, modify second" output of that guide.
>
> **Status: IMPLEMENTED** (defaults from §11 applied). Verified against the live
> backend: `GET /api/dashboard` and `GET /api/dashboard/insights` both return 200
> and map correctly through `dashboard.adapter.js` (confirmed with a live-data
> run). `npm run lint` and `vite build` pass.

---

## 1. Scope

- Only the **Overview** module (`src/pages/Overview/index.jsx`).
- Two endpoints: `GET /api/dashboard` and `GET /api/dashboard/insights`.
- Preserve the existing UI. No redesign, no unrelated refactoring.
- Remove ONLY Overview mock data — and only after verification.

**Not touched in this step:** People, Projects, Teams, Knowledge, Recognition,
Insights page, other module mocks, `src/api/client.js` (reused as-is).

---

## 2. Current-State Analysis (inspected)

### Frontend files that participate

| File | Role |
|---|---|
| `src/pages/Overview/index.jsx` | The page to integrate |
| `src/components/ui/InsightCard.jsx` | Insight card UI (contract: `title`, `summary`, `severity`, `confidence`, `evidenceCount`, `why.{evidence[],reasoning,impact,assessment,assessmentTone}`) |
| `src/components/common/MetricCard.jsx` | KPI card (label, value, delta, detail, chain) |
| `src/components/ui/ChartCard.jsx` | Section card wrapper |
| `src/components/ui/DataTable.jsx` | Attention table (has built-in `EmptyState`) |
| `src/components/common/LoadingState.jsx` / `ErrorState.jsx` / `EmptyState.jsx` | Existing loading/error/empty patterns |
| `src/hooks/useData.js` | Existing async-loading hook: `{ data, loading, error, retry, reload }` |
| `src/api/client.js` + `src/api/dashboard.js` | **Existing API client + dashboard service (REUSED — already built)** |

### Mock-data flow → UI section (the mapping to replace)

| UI section | Current mock source | Consumed fields |
|---|---|---|
| KPI strip (5 cards) | `overviewKpis()` (`src/data/service.js`) | `health{value,delta}`, `projectsAtRisk{value,detail}`, `knowledgeConcentration{value,detail}`, `teamCapacity{value,detail}`, `recognizedImpact{value,delta}` |
| Knowledge chips on KPI card | `singleOwnerSystems()` | list of `{ id, name, criticality }` |
| Health trend chart | `coverageTrend()` | 12 rows `{ date, coverage }` |
| Engineering relationships chain | `engineeringChain(projectId)` | `project`, `teams[]`, `people[]`, `skills[]`, `areas[]`, `risks[]` |
| Projects needing attention table | `projectsNeedingAttention(5)` | `{ id, name, status, healthScore, deliveryConfidence, targetDate, topDriver }[]` |
| AI insights | `src/data/insights.js` (static) | `InsightCard` contract (see above) |
| Global loading gate | `useData(fetchProjects)` | `loading` only |

### Existing error/loading/empty patterns

- Loading: `{loading && <LoadingState variant="grid" />}` (already in Overview).
- Error: `if (error) return <ErrorState onRetry={retry} />;` — used in
  `ProjectDetail`, `TeamDetail`, `KnowledgeDetail`. **Overview currently has no
  error state** — this is a gap to fill.
- Empty: `DataTable` renders `EmptyState` automatically for zero rows.

---

## 3. Backend Contract (inspected, verified in source)

### `GET /api/dashboard` → plain object (`dashboard.service.js`)

```js
{
  summary: {
    health: number,               // avg project healthScore
    projectsAtRisk: number,       // count of status === 'at_risk'
    criticalKnowledgeRisks: number, // count of critical knowledge areas
    highestTeamPressure: number,  // max team deliveryPressure
  },
  projects: Project[],            // first 5, NOT sorted by health
  knowledgeRisks: KnowledgeArea[], // critical areas
  teams: Team[],
}
```

### `GET /api/dashboard/insights` → `{ insights }` (`insight.service.js`)

Each insight:

```js
{
  id, level, score, summary, confidence,
  evidence: string[],            // evidence statements
  drivers: string[],             // why-drivers
  recommendedActions: string[],
  assumptions: string[],
}
```

---

## 4. Contract Mismatches & Adapter Decisions — **REVIEW POINTS**

The backend DTOs differ from the current UI contracts. Per the guide, we adapt on
the frontend and **do not** change the backend. Each decision below needs your
sign-off (default proposal in bold).

### 4.1 KPI cards (`summary` → KPI view model)

| KPI | Backend field | Proposed mapping |
|---|---|---|
| Engineering health | `summary.health` | value = health; **delta = 0** (backend has no delta → hide trend arrow) |
| Projects at risk | `summary.projectsAtRisk` | value = count; **detail stays static** "require action this week" |
| Knowledge concentration | `summary.criticalKnowledgeRisks` | **value = count**; detail = "critical knowledge risks" *(was "High" + single-owner copy — semantic shift, confirm)* |
| Team capacity | `summary.highestTeamPressure` | **value = `"${n}%"`**; detail = "highest team pressure" *(was avg capacity % — semantic shift, confirm)* |
| Recognized impact | *(not in backend)* | **keep current static mock value** `+14%` for now *(no endpoint exists; flagged)* |

### 4.2 Health trend chart (`coverageTrend`)

No backend endpoint returns a 12-week trend.
**Proposal: keep the current synthetic mock trend for now** and flag it — a real
trend source is a future module concern. *(Alternative: drop the chart — not
recommended, changes UI.)*

### 4.3 Engineering relationships chain (`engineeringChain`)

Backend `Project` DTO provides `teams`, `owners`, `knowledgeAreas`, `risk` — but
no per-person `skills`/`expertise` list.
**Proposal: build the chain from the dashboard Project DTO** (`teams` → teams,
`owners` → people, `knowledgeAreas` → skills + systems, `project.risk.drivers`
→ risks). This is an approximation of the mock chain.
*(Alternative: leave chain on mock `engineeringChain` until richer endpoints —
keeps a mock dependency in Overview.)*

### 4.4 Insight adapter (`mapInsightToViewModel`)

Backend has no `title`, no `why.*`, no `assessmentTone`. Proposed mapping:

| InsightCard field | Backend source |
|---|---|
| `id` | `id` |
| `title` | **`summary`** (sentence; no short-title field exists) |
| `summary` | `summary` |
| `severity` | `level` |
| `confidence` | `confidence` |
| `evidenceCount` | `evidence.length` |
| `why.evidence` | `evidence[]` |
| `why.reasoning` | **`drivers.join('. ')`** |
| `why.impact` | **`recommendedActions.join('. ')`** |
| `why.assessment` + `assessmentTone` | **derived from `level`** deterministically: `critical/high → 'High Risk'/'error'`, `medium → 'Medium Risk'/'warning'`, `low → 'Positive'/'success'` (matches mock convention) |

### 4.5 Shared mock `src/data/insights.js`

It is imported by **both** Overview and the Insights page.
**Overview stops importing it; the Insights page keeps it.** Do NOT delete the
file — it is not Overview-only mock data.

### 4.6 Attention table ordering

Backend `projects` are not health-sorted. **Adapter sorts `projects` by
`healthScore` ascending** before binding to the table (table also sorts
client-side; keep server-side order sensible).

---

## 5. Implementation Plan (files)

### New files

1. **`src/api/dashboard.adapter.js`** — pure, exported mapping functions
   (no HTTP, no React):
   - `mapDashboardOverview(dto)` → Overview view model (KPIs, sorted
     attention projects, knowledge chips, chain).
   - `mapInsightToViewModel(insight)` → InsightCard contract.
   - Both defensive against missing/empty arrays (guide §14/§17).
2. **`src/hooks/useDashboard.js`** — thin hooks reusing the existing
   `useData` (no new state machinery):
   - `useDashboard()` → `{ data: OverviewViewModel, loading, error, retry }`
     (wraps `fetchDashboardOverview` + `mapDashboardOverview`).
   - `useDashboardInsights()` → `{ data: InsightViewModel[], loading, error,
     retry }` (wraps `fetchDashboardInsights` + `mapInsightToViewModel`).

### Changed files (minimum)

3. **`src/pages/Overview/index.jsx`** — replace mock sources with the hooks:
   - `useDashboard()` drives loading, error, and all dashboard-backed sections.
   - `useDashboardInsights()` feeds the insight column.
   - Add `if (error) return <ErrorState onRetry={retry} />;` (existing pattern).
   - Keep all JSX, styling, save/dismiss actions, and navigation as-is.

### Reused unchanged

- `src/api/client.js` — transport (per the Mandatory Constraint).
- `src/api/dashboard.js` — `fetchDashboardOverview`, `fetchDashboardInsights`
  (already implemented).
- `src/hooks/useData.js`, `LoadingState`, `ErrorState`, `EmptyState`.

---

## 6. Implementation Order (per guide §10–§20)

1. **Step 1 — Understand:** done (this plan is the output).
2. **Step 2 — `GET /api/dashboard`:** add adapter + `useDashboard`; wire
   loading/error. Verify the request independently first.
3. **Step 3 — Replace dashboard data:** bind KPI strip, attention table,
   knowledge chips, chain, trend per §4 decisions.
4. **Step 4 — `GET /api/dashboard/insights`:** add `mapInsightToViewModel` +
   `useDashboardInsights`; feed `InsightCard` the exact contract it expects.
5. **Verify** loading, error, empty (empty insights → `EmptyState`; empty table →
   built-in), no duplicate requests.
6. **Lint** (`npm run lint`).
7. **Manual verification** (Network tab: exactly 2 requests, no failures).
8. **Only then:** remove Overview mock usage (see §8 below).

---

## 7. Loading / Error / Empty

- **Loading:** keep existing `<LoadingState variant="grid" />` gate.
- **Error:** add `if (error) return <ErrorState onRetry={retry} />;` (matches
  ProjectDetail/TeamDetail pattern) for dashboard; insights failures must not
  crash the page — show inline `EmptyState`/error text, not a crash.
- **Empty:** `DataTable` has built-in empty state; insights column gets a small
  `EmptyState` when the list is empty. Empty ≠ error (guide §16).

---

## 8. Mock Data Removal (ONLY Overview, only after verification)

After all gates pass, remove Overview-only mock usage from
`src/pages/Overview/index.jsx` and the now-unused Overview-only selectors in
`src/data/service.js`:

- Remove imports/usage of: `fetchProjects`, `overviewKpis`,
  `projectsNeedingAttention`, `coverageTrend`, `singleOwnerSystems`,
  `engineeringChain`, and `src/data/insights.js` **from Overview only**.

**Keep intact (used by other modules):**
- `src/data/insights.js` (Insights page still uses it).
- All other `src/data/service.js` selectors/fetchers (People/Projects/Teams/
  Knowledge/Recognition pages).
- Do not delete `src/data/service.js` or `fixtures.js`.

---

## 9. Testing & Verification

- Frontend currently has **no test runner** (`package.json` has no test script).
- Per guide §19: adapter pure functions are the prime test candidates.
  **Decision needed:** (a) add a minimal `vitest` setup for adapter tests, or
  (b) verify manually + lint for this step and defer tests to a later module.
  Default: **(b) manual + lint** unless you want vitest added now.
- Manual: run backend (`npm run dev`), run frontend (`npm run dev`), open
  Overview, confirm exactly `GET /api/dashboard` + `GET /api/dashboard/insights`
  fire once, no failed/duplicate requests, UI equivalent to mock version.

---

## 10. Definition of Done (guide §23)

- [ ] `GET /api/dashboard` integrated via existing API client.
- [ ] Dashboard response mapped through `dashboard.adapter.js`.
- [ ] KPI strip, attention table, knowledge chips, chain render real data.
- [ ] `GET /api/dashboard/insights` integrated.
- [ ] Insights mapped through `mapInsightToViewModel`; `InsightCard` receives
      its exact contract.
- [ ] Loading state works.
- [ ] Error state works (new, follows existing pattern).
- [ ] Empty state works (empty ≠ error).
- [ ] No duplicate/unnecessary requests; no console errors.
- [ ] Lint passes.
- [ ] Only Overview mock data removed; other module mocks untouched.
- [ ] No unrelated refactoring; UI preserved.

---

## 11. Open Decisions for Your Review

Decisions were confirmed by the user with "build"; **defaults were applied**:

1. KPI semantics (4.1): **counts used** — knowledge concentration = critical
   knowledge risks, team capacity = highest team pressure. ✔
2. Recognized impact (4.1): **kept static** `+14%` (no backend source). ✔
3. Health trend (4.2): **kept synthetic** `coverageTrend()` mock — no backend
   endpoint exists yet. Deferred: remove when a trend source exists. ✔
4. Chain (4.3): **built from dashboard Project DTO** (teams/owners/
   knowledgeAreas/risk.drivers). ✔
5. Insight mapping (4.4): `summary`→title, `drivers`→reasoning,
   `recommendedActions`→impact, `level`→assessment+tone. ✔
6. Tests (9): **manual + lint** for this step (no frontend test runner exists);
   vitest deferred. ✔

## 12. Post-implementation status

- New: `src/api/dashboard.adapter.js`, `src/hooks/useDashboard.js`.
- Changed: `src/pages/Overview/index.jsx` (real data + loading/error/empty;
  insights column keeps its own loading/error/empty state).
- Reused unchanged: `src/api/client.js`, `src/api/dashboard.js`, `useData`,
  `LoadingState`/`ErrorState`/`EmptyState`.
- Remaining Overview mock dependency: `coverageTrend()` (synthetic trend,
  no backend source). All other Overview mocks removed from the page.
- `src/data/insights.js` still used by the Insights page (untouched).
- Verified live: KPIs mapped (`health 67`, `at risk 4`, `knowledge 1`,
  `pressure 116%`), attention table sorted by health asc, chain built, and
  `InsightCard` receives its exact contract (8 insights mapped).
- Backend left running (`npm run dev` on :4000) for browser verification:
  open `npm run dev` in `frontend/` and navigate to Overview.