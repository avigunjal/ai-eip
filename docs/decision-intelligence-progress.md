# Decision Intelligence — Implementation Status

**Feature:** Decision Intelligence (Decision Impact Simulator)
**Status:** Complete (both screens shipped and verified)
**Last updated:** 2026-09-06

---

## Overview

Decision Intelligence answers: **"What should we do next, and what decision requires attention?"** It is a deterministic-first module — the source of truth is engineering signals and offline computation; the AI layer (if enabled) only explains the pre-computed result.

Core product flow:

```text
Engineering Signals
        ↓
Risk / Knowledge / Capacity Detection
        ↓
Decision Opportunity        →  Screen 1 · Decision Inbox
        ↓
Decision Options
        ↓
Simulation                  →  Screen 2 · Decision Workspace
        ↓
AI Recommendation
        ↓
Action
```

---

## Scope & Boundaries

| Module | Question answered |
|---|---|
| Risks | What is going wrong or likely to go wrong? |
| Knowledge | Where is knowledge concentrated or fragile? |
| Teams | What is the health and capacity of teams? |
| Insights | What patterns require attention? |
| AI Composer | Who is the best staffing combination? |
| **Decision Intelligence** | **What should we do next?** |

Screen 1 (Decision Inbox) surfaces decisions that need attention — not duplicated risk cards. Screen 2 (Decision Workspace) simulates options, compares outcomes, scores them, and recommends a path.

---

## Screen 1 — Decision Inbox (`/decision-intelligence`)

### Delivered

| Specification (§) | Status |
|---|---|
| Sidebar item after AI Composer + route `/decision-intelligence` | ✅ |
| Page header (title / subtitle / "New decision" action) | ✅ |
| Four KPI cards (decisions requiring action, estimated value, potential risk reduction, avg. AI confidence) | ✅ |
| Intelligence banner ("Turn engineering signals into better outcomes") | ✅ |
| Category filters (All / Staffing / Risk mitigation / Knowledge / Priority & Scope) | ✅ |
| Six data-driven decision cards | ✅ |
| Decision question visually dominant | ✅ |
| Severity styling reused from existing AI-EIP language | ✅ |
| Supporting signals per card | ✅ |
| Potential value shown USD-formatted (`$342K`) | ✅ |
| "Review decision →" → Screen 2 route | ✅ |
| Bottom summary (decision insights distribution + potential outcomes) | ✅ |
| Loading / empty / error states | ✅ |
| Responsive (desktop / tablet / mobile) + accessibility basics | ✅ |

### Data

- `frontend/src/pages/DecisionIntelligence/data/decisions.js` — centralized dataset: 6 decisions across all 4 categories, each with stable `id` (e.g. `atlas-staffing`), type, severity, context, question, description, `signals[]`, and numeric USD `potentialValue`.
- `frontend/src/api/decisionIntelligence.js` — `fetchDecisions()`; the **seam** a future live endpoint replaces without touching the page.

### Components

`DecisionIntelligence/index.jsx` → `DecisionInbox`, `DecisionCard`, `DecisionSummaryCards`, `DecisionIntelligenceBanner`, `DecisionFilters`, `DecisionMeta`, `DecisionOutcomes`.

---

## Screen 2 — Decision Workspace (`/decision-intelligence/:decisionId`)

### Delivered

| Section | Component | Status |
|---|---|---|
| Header (context, question, severity, USD potential value) | `DecisionHeader` | ✅ |
| Problem context | `DecisionProblem` | ✅ |
| Engineering signals / evidence | `DecisionEvidence` | ✅ |
| Business impact cards | `BusinessImpact` | ✅ |
| Option cards with composite score + selected state | `DecisionOptions` | ✅ |
| Scenario comparison table (fixed layout, even columns) | `ScenarioComparison` | ✅ |
| AI recommendation card (green accent, animated AI chip, confidence bar) | `AIRecommendation` | ✅ |
| Final action step (review checklist, confirm dialog) | `DecisionActionPanel` + `DecisionConfirmDialog` | ✅ |
| Reasoning breakdown | `RecommendationReasoning` | ✅ |
| Not-found + skeleton states | `DecisionDetailNotFound`, `DecisionDetailSkeleton` | ✅ |

### Recommendation engine (frontend, deterministic)

- `frontend/src/api/decisionRecommendation.js` — transparent pipeline: `signals → option outcomes → composite score → rank → recommendation`.
- Weighted composite score (`capacity 0.25 / skill 0.25 / confidence 0.25 / value 0.15 / risk 0.10`), evidence-driven "why recommended" reasons, trade-offs, leadership considerations, deterministic confidence 75–93.
- `recommendationService.explain()` behind a **provider interface**: deterministic provider active today; a future real LLM provider registers here and the UI stays unchanged (deliberately not wired to the backend `/ai/explain` endpoints, which are resource-specific).

### Data

- `frontend/src/pages/DecisionDetail/data/decisionDetails.js` — all 6 records with USD outcomes (`{ value, currency }`).
- `frontend/src/api/decisionDetail.js` — `fetchDecisionDetail()` merges the inbox envelope (type/severity/signals/potentialValue) with workspace detail (problem/evidence/options/outcomes); returns `null` for unknown ids so the workspace renders a proper not-found (never a retry loop).
- `frontend/src/store/decisionStore.js` — Zustand store for the workspace (options, selected option, recommendation).
- `frontend/src/routes/router.jsx` — routes `decision-intelligence` and `decision-intelligence/:decisionId` with `decisionCrumbLabel`.

---

## Backend — Decision Impact Simulator (`/api/decision-intelligence`)

A parallel, complementary real API for the simulator contract.

| Endpoint | Purpose |
|---|---|
| `GET /api/decision-intelligence` | Scenario list (projects with open risks, ranked by delivery exposure) |
| `GET/PATCH /api/decision-intelligence/assumptions[/:id]` | Editable financial planning assumptions |
| `GET /api/decision-intelligence/projects/:projectId` | Project decision context + drivers |
| `GET .../options` | Option descriptors (continue / staffing / reallocate / knowledge_transfer) |
| `POST .../simulate` | Run one option deterministically |
| `POST .../compare` | Run all options, score, pick winner + reasons/trade-offs |
| `POST .../explain` | AI explanation over the already-completed comparison (`ai: null` on disable/failure — still 200) |

- **Files:** `backend/src/modules/decision-intelligence/` (`decision.routes/controller/service/signals/simulator/scoring/financial-impact/repository/config`).
- **Migration:** `007_decision_intelligence.sql` → `financial_assumptions` (role, annual cost per FTE, billing target, working days, recovery rate, effective-from). Values are explicit **planning estimates**, never real financial records.
- **AI use case:** `SYSTEM_DECISION_EXPLANATION` + `decisionComparisonResultContext` — the LLM can only explain an already-scored winner; it can never change scores or the outcome.

---

## Currency handling

- `frontend/src/config/currency.js` — `formatCurrency({ value, currency })` + `CURRENCY_SYMBOL` (`$ € £ ₹`).
- USD renders as `$342K` / `$14K` / `$0`; INR retains Indian shorthand (`₹28.7L` / `₹1.8Cr`) as long-form source values are stored numerically.
- All Screen 1/2 records use numeric `{ value, currency: 'USD' }`; engine `credit()`/`scoreOptions()`/`buildImpact()` read numeric `.value`.
- Verified: no stray `₹` on either screen; `$342K / $14K / $964K / $1.8M` render; zero page overflow at 1440px and 390px.

---

## Verification

- Backend: `node --test tests/decision-intelligence/*.test.js` — **24/24 pass** (scoring, assumptions live-edit, comparison shape guard, AI disabled/failure/cache/coercion).
- Frontend: `npm run lint` + `npm run build` clean (only pre-existing warnings: `DecisionMeta.jsx` fast-refresh, large-chunk size).
- Manual probes (Playwright): both screens render, option ranking correct, AI card / chips animate, comparison table columns even, no horizontal overflow on desktop/mobile.
- Browser console: only pre-existing React dev `%s` warnings.

---

## Out of scope / future work

- Live source connectors (GitHub / Jira / wiki) feeding the signal layer.
- Wiring the frontend workspace to the backend `/api/decision-intelligence` simulator endpoints (screens currently run on the local deterministic engine + mock seams).
- Real-LLM provider registration in `decisionRecommendation.js` when a compatible endpoint exists.
- Persisted user decisions / approval workflow.