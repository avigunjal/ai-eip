# AI Engineering Intelligence Platform (AI-EIP)
## Detailed System Design

**Version:** 1.0
**Status:** MVP System Design
**Purpose:** Detailed technical design of the AI-EIP monorepo: frontend architecture, backend structure, API contracts, database model, AI reasoning pipeline, and deployment architectures. Complements `ARCHITECTURE.md`.

---

# 1. Frontend Architecture

## 1.1 Stack

- **React 19** + JSX (JavaScript, no TypeScript)
- **Vite** build tooling (dev proxy forwards `/api` → backend)
- **MUI** component system + Emotion for styling
- **Recharts** for visualization
- **Zustand** for client state (stores: `actionStore`, `aiStore`, `toastStore`, `uiStore`)
- **React Router v7** data router
- **axios** HTTP transport with error normalization and bounded retry
- **oxlint** for linting

## 1.2 Folder Structure

```
frontend/
├── index.html
├── vite.config.js              # dev proxy /api → http://localhost:4000
├── src/
│   ├── main.jsx                # React entry
│   ├── App.jsx
│   ├── index.css / styles/tokens.css
│   ├── routes/
│   │   ├── router.jsx          # createBrowserRouter (all routes under AppShell)
│   │   └── sitemap.js          # sidebar nav + page titles + icon map
│   ├── layouts/
│   │   ├── AppShell.jsx        # persistent sidebar + topbar shell
│   │   ├── Sidebar.jsx
│   │   └── TopBar.jsx
│   ├── pages/                  # one folder per route
│   │   ├── Overview/  Projects/  ProjectDetail/
│   │   ├── Risks/     Knowledge/ KnowledgeDetail/  TransferPlans/
│   │   ├── Teams/     TeamDetail/ PersonProfile/
│   │   ├── Composer/  Recognition/  Insights/  Settings/  NotFound.jsx
│   ├── components/
│   │   ├── common/             # AvatarGroup, MetricCard, StatusBadge, EmptyState,
│   │   │                       # ErrorState, LoadingState, PageHeader, EntityChip
│   │   └── ui/                 # InsightCard, EvidenceDrawer, DataTable, ChartCard,
│   │                           # FilterBar, CommandPalette, EngineeringRelationshipGraph,
│   │                           # AiStatusCard, AnalyzingPanel, NotificationBell, Toaster
│   ├── api/                    # resource modules + transport
│   │   ├── client.js           # axios instance, ApiError normalization, withRetry
│   │   ├── dashboard.js  projects.js  risks.js  teams.js  people.js
│   │   ├── capabilities.js  knowledge.js  teamComposer.js  recognition.js
│   │   ├── insights.js  ai.js
│   │   └── *.adapter.js        # API → UI view-model mappers (dashboard, insights, projects)
│   ├── hooks/                  # useData, useDashboard, useUrlFilters, useInsightAi,
│   │                           # useAiTerms, useToast, useBreakpoints, useCountUp
│   ├── store/                  # zustand: actionStore, aiStore, toastStore, uiStore
│   ├── data/                   # fixtures.js + service.js (in-memory fallback world)
│   ├── config/                 # constants, paths, riskLabels, modelLabel, dates
│   ├── theme/                  # MUI theme (palette, typography, shadows, components)
│   └── providers/ThemeProvider.jsx
```

## 1.3 Data Flow

```
Page (React)
  └─ hook (useData / useDashboard / useInsightAi)
      └─ api resource module (projects.js, ...)
          └─ client.js (axios)
              ├─ response interceptor: unwraps body, normalizes ApiError
              └─ withRetry(): bounded retry on transient failures
          └─ adapter (*.adapter.js): maps API envelope → UI view-model
```

- **Transport** (`client.js`): base URL from `VITE_API_BASE_URL` (defaults `/api`), 10s timeout, cancellation via `AbortSignal`, and a typed `ApiError` with `isNetworkError` / `isTimeout` / `isAbort` / `isUnauthorized` / `isNotFound` accessors.
- **Retry policy** (`withRetry`): retries 5xx, 429, and network errors; never retries validation/4xx, auth, aborts, or timeouts. Exponential backoff, `retries`/`baseDelayMs` configurable.
- **Adapters**: API envelopes are adapted to the UI's view-model (the pre-integration UI was built against `src/data/fixtures.js`, so adapters keep the swap invisible to components).
- **State**: page-level data lives in hooks; cross-cutting state (AI settings, toasts, URL filters, command palette) lives in Zustand stores.
- **Resilience**: `src/data/` mirrors the API world for development and graceful degradation; the AI surfaces always show whether output is deterministic or LLM-sourced.

## 1.4 Routing

React Router v7 data router. All routes are children of `AppShell` so the sidebar/topbar persist; `handle.title` drives the browser title and breadcrumb. Detail routes: `projects/:projectId`, `knowledge/:systemId`, `teams/:teamId`, `people/:personId`, plus `knowledge/transfer-plans`. Catch-all redirects to the dashboard.

---

# 2. Backend Architecture

## 2.1 Stack

- **Node.js** + **Express 4** (`type: module`, ES modules)
- **better-sqlite3** (SQLite; PostgreSQL/Supabase planned)
- **helmet**, **cors**, **morgan**, **dotenv**
- **node:test** test runner (`npm test` runs `tests/**/*.test.js`)
- Auth is stubbed (request middleware reserved); no user model in MVP

The MVP backend follows a **modular monolith** architecture: every domain is an isolated module (`routes → controller → service → repository`) sharing a single runtime and database. This keeps deployment simple while preserving clean extraction boundaries — any module can be promoted to a standalone service later without internal redesign.

## 2.2 Folder Structure

```
backend/
├── src/
│   ├── server.js               # HTTP bootstrap (listen)
│   ├── app.js                  # Express assembly: middleware + route mounts + handlers
│   ├── config/
│   │   ├── env.config.js       # typed env access (PORT, DATABASE_URL, AI_*)
│   │   └── database.config.js  # SQLite adapter, migration runner, schema_migrations
│   ├── middleware/
│   │   ├── error.middleware.js # notFoundHandler + errorHandler → JSON error envelope
│   │   └── request.middleware.js # (reserved for future auth/logging)
│   ├── modules/
│   │   ├── dashboard/          # routes → controller → service (aggregation)
│   │   ├── project/            # projects + health + risk roll-up + trend
│   │   ├── risk/               # risk register, enrichment, PATCH status/severity/owner
│   │   ├── team/               # teams, delivery pressure, health, risk exposure
│   │   ├── person/             # people profiles
│   │   ├── capability/         # capabilities catalog
│   │   ├── knowledge/          # knowledge areas, expertise, transfer plans + actions
│   │   ├── team-composer/      # skill matcher, staffing scenarios
│   │   ├── recognition/        # recognition feed + impact
│   │   ├── insight/            # deterministic insight synthesis
│   │   ├── evidence/           # evidence repository (cross-domain)
│   │   └── ai/                 # AI reasoning layer (provider registry, use cases)
│   ├── analytics/              # pure scoring engines (no HTTP)
│   │   ├── project-risk/       #   project-risk.service.js, project-risk.rules.js
│   │   └── knowledge-risk/     #   knowledge-risk.service.js
│   ├── database/
│   │   ├── migrations/         # 001_initialSchema.sql, 002_*.sql (+ README)
│   │   └── seed/               # seedData.js (canonical) + seed.js (runner)
│   ├── shared/
│   │   ├── constants/          # severities, thresholds, DEMO_TODAY
│   │   ├── errors/app.error.js
│   │   └── types/api.types.js
│   └── utils/                  # async-handler, deterministic-random, mappers
└── tests/
    ├── analytics/project-risk.test.js
    ├── integration/api.test.js
    ├── modules/llm.provider.test.js
    └── modules/skill-matcher.test.js
```

## 2.3 Module Anatomy

Every feature module follows the same internal contract:

```
<module>.routes.js      → defines HTTP routes, mounts controller handlers
<module>.controller.js  → thin HTTP layer: parse params/body, call service, map to envelope
<module>.service.js     → business rules + frontend-shaped DTO mapping (no HTTP, no SQL)
<module>.repository.js  → SQL (SQLite adapter)
```

Rules:
- **Services** own business logic and the API → frontend contract. Repositories own SQL. Controllers stay thin.
- **Envelopes**: collection endpoints return `{ <resource>: [...] }`; singular endpoints return `{ <resource>: {...} }`; create endpoints return `201`; not-found returns `404` with an error envelope.
- **Error contract**: every error is normalized to `{ error: { status, message } }` (5xx messages masked to "Internal server error").

## 2.4 Cross-Cutting Concerns

- **Deterministic randomness** (`utils/deterministic-random.js`): seeded pseudo-random series so charts and demo data are stable across runs.
- **Shared constants** (`shared/constants`): severity taxonomy (`critical/high/medium/low`), risk categories, expertise levels, severity thresholds (`80/60/40`), and a fixed `DEMO_TODAY` for date-stable seeds.
- **AppError**: typed HTTP errors used across services; `errorHandler` converts to the JSON envelope.
- **async-handler**: wraps async controllers so rejections reach the error middleware.

---

# 3. API Contracts

Base URL: `/api`. All bodies/responses are JSON. Errors always use:

```json
{ "error": { "status": 404, "message": "Project not found" } }
```

## 3.1 Health

```
GET /api/health → { "status": "ok" }
```

## 3.2 Dashboard

```
GET /api/dashboard | /api/dashboard/overview
    → { summary: { health, projectsAtRisk, criticalKnowledgeRisks, highestTeamPressure },
        projects: ProjectSummary[], knowledgeRisks: KnowledgeArea[], teams: Team[] }

GET /api/dashboard/insights
    → { insights: Insight[] }
```

## 3.3 Projects

```
GET  /api/projects                     → { projects: Project[] }
GET  /api/projects/:projectId          → { project: ProjectDetail }
GET  /api/projects/:projectId/risks    → { risks: EnrichedRisk[] }
```

`Project` includes `healthScore`, `healthDelta`, `deliveryConfidence`, `targetDate`, `status`, `teamIds`, `teamSize`, `owners`, `teams`, `knowledgeAreas`, `topDriver`, `trend[]`, `risk: { score, severity, confidence, drivers[] }`, `aiMetadata: { lastAnalyzedAt, confidence, signalsUsed[] }`.

`ProjectDetail` adds `risks[]` (enriched with actions and evidence).

## 3.4 Risks

```
GET   /api/risks           → { risks: EnrichedRisk[] }
GET   /api/risks/:riskId   → { risk: EnrichedRisk }
PATCH /api/risks/:riskId   → { risk: EnrichedRisk }
      body (any subset): { status, severity, ownerId }
```

`EnrichedRisk` includes `title`, `category`, `probability`, `impact`, `urgency`, `score`, `severity`, `confidence`, `trend`, `status`, `owner`, `projectName`, `signals[]`, `actions[]`.

## 3.5 Teams

```
GET /api/teams             → { teams: Team[] }
GET /api/teams/:teamId     → { team: Team }
```

`Team` includes `sustainableCapacityFte`, `committedFte`, `unplannedFte`, `capacityPct`, `deliveryPressure`, `healthScore`, `riskExposure`, `memberIds`, `projectIds`.

## 3.6 People

```
GET /api/people             → { people: Person[] }
GET /api/people/:personId   → { person: Person }
```

## 3.7 Capabilities

```
GET /api/capabilities             → { capabilities: Capability[] }
GET /api/capabilities/:capabilityId → { capability: Capability }
```

## 3.8 Knowledge

```
GET  /api/knowledge               → { areas: KnowledgeArea[] }
GET  /api/knowledge/areas         → { areas: KnowledgeArea[] }  (alias)
GET  /api/knowledge/:areaId       → { area: KnowledgeArea }
GET  /api/knowledge/transfer-plans → { plans: TransferPlan[] }
POST /api/knowledge/transfer-plans → 201 { plan: TransferPlan }
     body: { areaId, backupOwnerId, dueDate }
PATCH /api/knowledge/transfer-plans/:planId → { plan: TransferPlan }
     body: { status }
```

`KnowledgeArea` includes `criticality` (1–5) and `criticalityScore` (0–100), `coverage`, `documentationFreshnessDays`, `documentationCompleteness`, `riskScore`, `riskLevel`, `dominantExpertShare`, `expertise[]` (with `backupOwner`), `evidence[]`, `transferPlanId`, `linkedProjectIds`.

`TransferPlan` includes `title`, `areaId`, `riskLevel`, `ownerId`, `backupOwnerId`, `nextSessionAt`, `dueDate`, `status`, `progress`, `fromCoverage`, `targetCoverage`, `actions[]`.

## 3.9 Team Composer

```
GET  /api/team-composer/teams         → { teams: Team[] }
GET  /api/team-composer/recommendations?projectId=pr-07 → { recommendation }
POST /api/team-composer               → 201 { recommendation }  (persists a staffing scenario)
     body: { projectId }
GET  /api/team-composer/:scenarioId   → { scenario }
```

`recommendation` includes `requiredSkills`, `recommendedTeam[]` (with `fitScore`, `coverage`, `matchedSkills`), `rejectedCandidates[]` (with `rejectionReason`), `assessment: { coverageScore, missingSkills, matchedSkills, confidence }`, `rationale`, `tradeOff`, `impact`, `alternatives[]`.

## 3.10 Recognition

```
GET  /api/recognition | /api/recognition/feed → { feed: Recognition[] }
POST /api/recognition                           → 201 { recognition }
```

`Recognition` includes `personId`, `projectId?`, `knowledgeAreaId?`, `contributionType`, `summary`, `occurredAt`, `visibility`, `impact[]` (grounded impact statements).

## 3.11 Insights

```
GET /api/insights → { insights: Insight[] }
```

`Insight` includes `id`, `level`, `score`, `confidence`, `summary`, `evidence[]`, `drivers[]`, `recommendedActions[]`, `assumptions[]`. Deterministic; no LLM involved.

## 3.12 AI Reasoning Layer

```
GET  /api/ai/settings                                    → { enabled, provider, model }
PATCH /api/ai/settings                                   → { enabled, provider, model }
      body: { enabled: boolean }   # runtime toggle; clears AI cache

GET  /api/ai/analyze/project/:projectId                   → { deterministic, ai|null }   (cache-only read)
POST /api/ai/analyze/project/:projectId                   → { analysis|null }             (explicit LLM call)
POST /api/ai/analyze/project/:projectId/regenerate        → { analysis }                  (bypass cache)

GET  /api/ai/explain/insights                             → [ { insightId, explanation|null, explanationMeta|null } ]
POST /api/ai/explain/insights                             → { insights[], source, generatedAt }   (batch explain)
POST /api/ai/explain/insights/:insightId                  → { insightId, explanation, explanationMeta }
POST /api/ai/explain/insights/:insightId/regenerate       → { insightId, explanation, explanationMeta }

GET  /api/ai/explain/composition/:projectId               → { deterministic, ai|null }   (cache-only read)
POST /api/ai/explain/composition                          → { recommendation, explanation, source, provider, model, generatedAt }
      body: { projectId }
POST /api/ai/explain/composition/:projectId/regenerate    → { recommendation, explanation, source, ... }

GET  /api/ai/evidence/:entityId                           → { entityId, evidence[] }
POST /api/ai/insights                                     → { insights }   # deterministic generation
```

`analysis` shape: `{ projectId, source: 'llm'|'deterministic', provider, model, generatedAt, summary, findings[], recommendedActions[], confidence, evidence[] }`. `explanationMeta` = `{ source, provider, model, generatedAt }`.

---

# 4. Database Model

## 4.1 Storage Today

- SQLite via `better-sqlite3` at `DATABASE_URL=sqlite:./data/ai-eip.db`.
- Migrations run on boot from `src/database/migrations/*.sql`, tracked in `schema_migrations` (idempotent, ordered by filename).
- Foreign keys enforced (`PRAGMA foreign_keys = ON`).
- Canonical seed (`src/database/seed/seedData.js`) is the single source of demo truth; `npm run db:seed` recreates it. DDL is portable to PostgreSQL.

## 4.2 Logical Model (23 tables)

**Identity & Organization**
- `people` (id, name, role, team_id, availability_fte, years_of_experience)
- `teams` (id, name, manager_person_id, sustainable_capacity_fte, committed_fte, unplanned_fte)
- `team_memberships` (team_id, person_id)

**Delivery**
- `clients` (id, name)
- `projects` (id, name, description, type, phase, status, target_date, health_score, health_delta, delivery_confidence, client_id)
- `project_teams` (project_id, team_id)
- `project_owners` (project_id, person_id)

**Skills & Coverage**
- `capabilities` (id, name, criticality)
- `person_capabilities` (person_id, capability_id, level, last_used_at)
- `team_capability_coverage` (team_id, capability_id, coverage_score)
- `project_requirements` (project_id, capability_id, weight)

**Allocation & Capacity**
- `allocations` (id, team_id, person_id, week_start, roadmap_fte, operational_fte, unplanned_fte)

**Knowledge**
- `knowledge_areas` (id, name, type, criticality, coverage_score, documentation_freshness_days, documentation_completeness)
- `knowledge_area_projects` (knowledge_area_id, project_id)
- `knowledge_expertise` (knowledge_area_id, person_id, level, share_pct, last_contributed_at, is_backup)
- `knowledge_transfer_plans` (id, knowledge_area_id, owner_person_id, backup_person_id, target_coverage, due_date, status, progress, next_session_at)
- `transfer_actions` (id, plan_id, title, owner_person_id, due_date, status, expected_outcome)

**Risk**
- `risks` (id, project_id, title, category, probability, impact, urgency, score, severity, confidence, trend, status, owner_person_id)
- `prevention_actions` (id, risk_id, title, owner_person_id, due_date, status, expected_outcome)
- `evidence` (id, entity_type, entity_id, source, statement, occurred_at, source_url) — generic citation store for any entity

**Staffing**
- `staffing_scenarios` (id, name, project_id, team_id, capacity_delta_fte, capability_delta, trade_off, confidence)
- `scenario_changes` (id, scenario_id, person_id, change_type, allocation_delta_fte, rationale)

**Recognition**
- `recognition` (id, person_id, project_id?, knowledge_area_id?, contribution_type, summary, occurred_at, visibility, impact TEXT/JSON)

## 4.3 Key Relationships

- `projects` → `clients`; `projects` ↔ `teams` (`project_teams`); `projects` ↔ `people` (`project_owners`).
- `projects` → `project_requirements` → `capabilities`.
- `knowledge_areas` ↔ `projects` (`knowledge_area_projects`); `knowledge_areas` ↔ `people` (`knowledge_expertise`, with `is_backup` flag and `share_pct`).
- `risks` → `projects`; `risks` → `prevention_actions`; any entity → `evidence` (generic `entity_type`/`entity_id` index).
- `knowledge_transfer_plans` → `knowledge_areas` + `transfer_actions`; `backup_person_id` is persisted separately from `knowledge_expertise.is_backup` so UI actions never mutate risk/insight signals.
- `staffing_scenarios` → `projects` + `scenario_changes` → `people`.

## 4.4 Hot-Path Indexes

`idx_evidence_entity(entity_type, entity_id)`, `idx_risks_project(project_id)`, `idx_allocations_person(person_id)`, `idx_allocations_team(team_id)`.

---

# 5. AI Reasoning Pipeline

## 5.1 Principles

- **Deterministic first**: all scores, drivers, evidence, and recommendations are computed offline with no LLM.
- **AI advisory only**: the LLM explains and summarizes; it never modifies scores or evidence.
- **Grounded**: prompts contain only a compact summary of deterministic results and explicitly forbid inventing facts.
- **Degrade gracefully**: any provider failure → deterministic fallback, never a 500.

## 5.2 Pipeline

```
Deterministic engine output
        ↓
compact context builder (context.js)   — project / insights / composition
        ↓
provider registry (llm.provider.js)    — openrouter (current), xai (supported
                                          alternative via the same interface)
        ↓
LLM call (max 3 attempts, retry/backoff, 60s timeout)
        ↓
structured-output coercion (schemas.js + coerce*)  — invalid → null
        ↓
validate (grounded confidence floor, shape checks)
        ↓
cache (TTL) + in-flight dedupe
        ↓
return to controller → { source: 'llm'|'deterministic', provider, model, ... }
```

## 5.3 Reliability Mechanics (`ai.service.js`)

| Mechanism | Behavior |
|---|---|
| **Result cache** | In-memory `Map`, 5 min default; 30 min for project analyses, insight explanations, composition explanations. Cleared on runtime AI toggle-off. |
| **In-flight dedupe** | Concurrent duplicate requests share one upstream call (`runOnce` / `runCached`); entry removed in `finally`. |
| **Bounded retry** | Max 3 attempts; retries on `429/500/502/503/504`, timeout, network, rate-limit, malformed output. Capped backoff (`min(retryAfter, 5s)` or `300ms × attempt`). 4xx fail fast. |
| **Structured JSON parsing** | Handles markdown fences, wrapping braces, and trailing prose via balanced-brace scanning. |
| **Runtime toggle** | `PATCH /api/ai/settings` flips `enabled`; disabling clears the cache so stale LLM results are never served in deterministic mode. |
| **Provider isolation** | `ProviderError` typed; service only ever sees the registry interface. Missing API key or unregistered provider ⇒ AI disabled ⇒ deterministic. |

## 5.4 Contexts

- `projectContext` — project facts, top risk drivers with evidence, highest risks.
- `insightsContext` — up to 5 insights with level/score/confidence/summary/drivers/evidence.
- `compositionContext` — recommended team with fit/coverage, required skills, assessment, rationale, trade-off, impact, alternatives.

Three system prompts (`SYSTEM_ANALYZE`, `SYSTEM_INSIGHTS`, `SYSTEM_COMPOSITION`) all embed the grounding rule and JSON-only response instructions with a declared schema.

## 5.5 Use Cases

1. **Project analysis** — deterministic assessment always served; `ai` populated from cache on load, generated on explicit "Explain with AI" action, regenerated on demand.
2. **Insight explanations** — one batch LLM call for cache-missing insights; per-insight cache; single-insight explain and regenerate endpoints.
3. **Composition explanations** — deterministic explanation always available; `ai` cached on explicit action.

---

# 6. Deployment Architecture (MVP)

The MVP is host-agnostic by design; it runs fully offline with AI disabled and requires only two processes.

## 6.1 Topology

```
Browser (static SPA)
   │  HTTPS
   ▼
Static host for frontend/dist          — Vercel / Netlify / any static server
   │  /api/* → backend (reverse proxy or env VITE_API_BASE_URL)
   ▼
Node.js + Express API (single process)
   │
   ▼
SQLite file (backend/data/ai-eip.db)   — created + migrated on boot, seeded via npm run db:seed
```

- **Frontend**: `vite build` produces a static bundle; `VITE_API_BASE_URL` selects the API origin.
- **Backend**: `npm start`; `PORT`, `NODE_ENV`, `CLIENT_ORIGIN` (CORS), `DATABASE_URL`, and `AI_*` from env. No external services required.
- **SQLite**: ephemeral file on the host. Fine for demo/judging; swap `DATABASE_URL` to a managed PostgreSQL connection when moving off a single host.
- **AI**: optional. `AI_ENABLED=true` plus `OPENROUTER_API_KEY` (free tier) or `XAI_API_KEY`. All env-driven; no key is ever committed (`backend/.env` is gitignored).
- **Operational**: `helmet` headers, CORS restricted to `CLIENT_ORIGIN`, centralized error envelope, request logging via `morgan`.

## 6.2 Runbook

```bash
# Backend
cd backend && npm install && npm run db:seed && npm start   # :4000

# Frontend
cd frontend && npm install && npm run dev                   # :5173 (proxies /api)
# or: npm run build && npm run preview
```

## 6.3 Test Command

```bash
cd backend && npm test    # node --test tests/**/*.test.js
```

---

# 7. Future AWS Architecture

Target state when AI-EIP moves from seeded demo data to live engineering signals at enterprise scale.

## 7.1 Topology

```
                             Internet
                                │  CloudFront + WAF
                                ▼
                    S3 (frontend static bundle) ─── Route 53 / ACM
                                │  /api → API Gateway (REST)
                                ▼
              ┌─────────────────────────────────────────────┐
              │   Application Layer (private subnets)       │
              │   ECS Fargate (Express API, autoscaled)     │
              │   └─ ECR image, sidecar logs → CloudWatch   │
              └─────────────────────────────────────────────┘
                      │                    │
        ┌─────────────▼──────┐   ┌─────────▼──────────┐
        │ RDS PostgreSQL     │   │ ElastiCache Redis  │
        │ (multi-AZ, 2 nodes)│   │ (AI result cache)  │
        └────────────────────┘   └────────────────────┘
                      │
        ┌─────────────▼──────────────────────────────┐
        │   AI Reasoning (Amazon Bedrock)            │
        │   Claude / Llama via Bedrock Runtime       │
        │   + Bedrock Knowledge Base (RAG)           │
        └────────────────────────────────────────────┘
```

## 7.2 Data Ingestion (Signal Pipelines)

- **EventBridge + SQS/Kinesis** collect events from connectors; a worker (Lambda or Fargate) normalizes them into the canonical relational model.
- **Connectors** (out of MVP scope):
  - GitHub App webhooks → PRs, reviews, contribution shares, repo health
  - Jira Cloud webhooks → tickets, blockers, story points, delivery metrics
  - Wiki/Docs crawler (S3 + scheduled Lambda) → freshness, completeness, ownership
  - Incident/Monitoring APIs → PagerDuty/DataDog pulls for on-call and reliability signals
- **Scheduler** (EventBridge rule → Step Functions): periodic enrichment, aggregation, and insight recomputation (idempotent).

## 7.3 Data & AI

- **RDS PostgreSQL** as the system of record (replaces SQLite; migrations already portable). Read replicas for analytics workloads.
- **ElastiCache Redis** replaces the in-memory AI cache (projected TTL semantics unchanged).
- **Secrets Manager** stores provider keys (replaces env vars); IAM roles assume Bedrock access — no credentials in code.
- **RAG retrieval**: Bedrock Knowledge Base over ingested docs for natural-language "why / how do I fix" questions, still grounded in deterministic evidence.

## 7.4 Security & Identity

- **Cognito** (or OIDC) user pools; API Gateway authorizer + JWT; backend request middleware enforces tenant scoping.
- **WAF** in front of CloudFront; **KMS** for at-rest encryption; RDS in private subnets; API keys rotated via Secrets Manager.

## 7.5 Observability & Operations

- CloudWatch Logs/Metrics + X-Ray tracing across API and workers.
- Alarms: API error rate, LLM spend/rate-limit, ingestion lag, RDS/Redis utilization.
- IaC: Terraform/CDK definitions for the full environment.

---

# 8. Design Decisions Summary

| Decision | Rationale |
|---|---|
| Deterministic analysis as source of truth | Offline-capable, auditable, recomputable; AI adds explanation only |
| Provider registry + runtime toggle | Swap/free providers without code changes; demo can run without keys |
| Structured output + coercion | LLM output is advisory; invalid output degrades to deterministic, never breaks the UI |
| Feature-based backend modules | Clear ownership; mirrors how the domain grows |
| `evidence` as a first-class entity | Every insight/risk is traceable to concrete signals |
| SQLite today, PostgreSQL tomorrow | Zero-infra MVP; portable DDL preserves contracts |
| Canonical seed with fixed `DEMO_TODAY` | Deterministic, stable demo across re-seeds and machines |
| UI actions never mutate signals | Transfer-plan backups and scenarios don't alter risk/insight state |
| Fixture fallback in frontend | UI development and degraded mode independent of backend availability |