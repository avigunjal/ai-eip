# AI-EIP backend

Node.js + Express backend for the AI-EIP hackathon demo. Today it runs against a local SQLite database; tomorrow the same API contracts, schema, and seed data move to Supabase PostgreSQL.

## Layout

Feature-based (modular) structure: every domain owns its routes, controller, service, and repository in one folder.

```text
src/
  app.js            Express app wiring (no server.listen)
  server.js         HTTP server bootstrap
  config/           env.config.js, database.config.js
  middleware/       error.middleware.js, request.middleware.js (future auth)
  modules/          One folder per feature (kebab-case, singular)
    <feature>/        routes → controller → service → repository
    analytics/        project-risk/ + knowledge-risk/ (pure scoring engines)
  shared/           Constants, API contract types, app.error.js
  utils/            Cross-cutting helpers (async-handler, mappers, deterministic-random)
  database/         Migrations + canonical seed (seedData.js + seed.js)
```

File naming is dot-notation: `project.routes.js`, `project.controller.js`, `project.service.js`, `project.repository.js`. Services own business rules + frontend-shaped DTO mapping; repositories own SQL; controllers stay thin.

## Run locally today

1. Copy `.env.example` to `.env` if you need to change defaults.
2. Run `npm install`.
3. Run `npm run db:seed` to create/reset the local demo database.
4. Run `npm run dev`.

The API starts on `http://localhost:4000`. Start with:

- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/projects/pr-07`
- `GET /api/knowledge`
- `POST /api/team-composer` with `{ "projectId": "pr-07" }`

## API surface

```http
GET    /api/health
GET    /api/dashboard | /api/dashboard/overview
GET    /api/dashboard/insights
GET    /api/projects
GET    /api/projects/:projectId
GET    /api/projects/:projectId/risks
GET    /api/risks
GET    /api/risks/:riskId
PATCH  /api/risks/:riskId                  # local status/owner updates
GET    /api/people
GET    /api/people/:personId
GET    /api/teams
GET    /api/teams/:teamId
GET    /api/capabilities
GET    /api/capabilities/:capabilityId
GET    /api/knowledge
GET    /api/knowledge/:areaId
GET    /api/knowledge/transfer-plans
PATCH  /api/knowledge/transfer-plans/:planId
GET    /api/team-composer/teams
GET    /api/team-composer/recommendations?projectId=pr-07
POST   /api/team-composer                   # { projectId } -> persists a scenario
GET    /api/team-composer/:scenarioId
GET    /api/recognition | /api/recognition/feed
POST   /api/recognition
GET    /api/insights
POST   /api/ai/insights
GET    /api/ai/evidence/:entityId
GET    /api/ai/analyze/project/:projectId     # cache-only: { deterministic, ai } — no LLM call ever
POST   /api/ai/analyze/project/:projectId     # explicit "Explain with AI" trigger (30-min cached)
POST   /api/ai/analyze/project/:projectId/regenerate  # regenerate one analysis (bypasses cache)
GET    /api/ai/explain/insights             # cache-only: per-insight cached AI explanations (no LLM call)
POST   /api/ai/explain/insights             # explicit "Explain with AI" trigger (per-insight cached)
POST   /api/ai/explain/insights/:insightId  # explain ONE insight only (small call, per-insight cached)
POST   /api/ai/explain/insights/:insightId/regenerate  # regenerate one explanation (bypasses cache)
GET    /api/ai/explain/composition/:projectId  # cache-only: { deterministic, ai } — no LLM call ever
POST   /api/ai/explain/composition          # { projectId } -> team explanation
POST   /api/ai/explain/composition/:projectId/regenerate  # regenerate the explanation (bypasses cache)
```

## AI provider layer

AI-EIP is **deterministic-first**. Scores, risks, evidence, recommendations, and confidence are always
calculated locally; the LLM only explains/summarizes those results and can never change them.

### Environment variables (see `.env.example`)

```text
AI_ENABLED=false             # master switch; false keeps the app fully offline/deterministic
AI_PROVIDER=openrouter       # openrouter (default) | xai
OPENROUTER_API_KEY=          # backend-only; required when AI_ENABLED=true
OPENROUTER_MODEL=openrouter/free
XAI_API_KEY=                 # optional Grok provider key
XAI_MODEL=grok-4.5
```

- **OpenRouter (primary):** `openrouter/free` routes to a $0 free model that supports the requested
  features. Free-tier limits are 50 requests/day (20 req/min) without credits; explicit triggers +
  caching keep usage well under that.
- **xAI Grok (optional):** Responses API, billed per token. Every request hard-codes `store: false`
  (no server-side storage) and carries no conversation state.
- Provider API keys live only in the backend environment and are never returned to the client.

### Behavior

- `isAIEnabled()` is true only when `AI_ENABLED=true`, the selected provider is registered, and its key
  is present. The deterministic project assessment is always served via
  `GET /api/ai/analyze/project/:id` regardless of the AI switch.
- AI is **explicitly user-triggered** — nothing calls the LLM on page load. A page refresh/revisit only
  reads the in-memory cache (`GET …/analyze/project/:id` and `GET …/explain/composition/:projectId`
  return `{ deterministic, ai }` where `ai` is the cached LLM result or `null`); only the `POST` explain
  and `/regenerate` endpoints call the LLM. Per-card insight explain sends just the clicked insight to
  the LLM (a small call, never the whole page).
- Each response carries `source` / `provider` / `model` so the UI can label `✦ AI · model` vs
  `Deterministic · Engineering signals`.
- **Failure handling:** the deterministic assessment is independent of AI, so a timeout, non-2xx, 429,
  malformed, or invalid JSON never hides it and never produces a fake AI analysis. The explain/regenerate
  POSTs return no AI result (null / 502-with-previous-kept) on failure — never a 500, never a stuck
  request, and never a broken project page.
- **Bounded auto-retry:** transient failures (timeout, network, rate-limit, 5xx, malformed/unusable
  output) are retried server-side up to **3 attempts** with a short capped backoff (429 honors
  `Retry-After`, capped at 5s), so users never have to click again; non-transient 4xx fail fast. The
  free router picks a different model per attempt, so a retry often lands on a cooperative one. The
  provider timeout (60s for OpenRouter, covering the whole response including a slow body read, not
  just headers) bounds each attempt. The frontend additionally auto-retries transient network/429/5xx
  errors once per explicit action; a 502 on `regenerate` is never auto-retried (the previous analysis
  is already preserved).
- **Cost protection:** compact grounded context only, generous `max_tokens` (free models are reasoning
  models that spend tokens on chain-of-thought), in-memory caching (30-min for project analyses,
  5-min for composition, 30-min per-insight for insight explanations), in-flight per-key Promise dedupe
  (concurrent duplicate calls share one upstream request), and no tools/web search/RAG. AI output is
  generated only on explicit user action — per-card on Insights — and can be regenerated (`regenerate`
  bypasses the cache; a failed regeneration keeps the previous result).
- **Runtime toggle:** `GET/PATCH /api/ai/settings` reads/updates the in-memory AI switch (seeded from
  `AI_ENABLED` at startup). Toggling off forces the empty AI state and clears the AI result cache; it
  never writes to `.env` and never exposes API keys. Provider/model are read-only.
- **Grounding:** prompts forbid inventing dates, percentages, people, incidents, tickets, or time
  windows; observations must come from the supplied context and recommendations must start with an
  action verb.
- LLM output is validated/coerced server-side (strings flattened, arrays capped, confidence clamped
  0–100); invalid output yields no AI result (the deterministic assessment remains).
- **Confidence contract:** LLM responses expose `confidence` — the model's self-assessment of the
  quality/grounding of its analysis (`AI ANALYSIS CONFIDENCE`) — kept separate from the project's
  delivery confidence (never overwritten). Aberrantly low self-assessments surface as `n/a`.
- **Evidence references:** analyze responses include an `evidence` array (`{ id, type, summary }`)
  listing the specific deterministic signals the LLM reasoned from, linking back to the evidence
  drawer.

## Demo data

The canonical seed lives in `src/database/seed/seedData.js`; `seed.js` applies it deterministically. It includes the Payment Service single-owner narrative, 10 projects, 18 risks (2 critical, 4 high), 8 prevention actions, 9 engineering squads, 28 people, 28 engineering skills, 16 knowledge areas, 4 transfer plans, 3 staffing scenarios, 12 weeks of allocations, and recognition events. Re-run it whenever you need a clean demo state.

## Tests

`npm test` runs Node's built-in test runner. `tests/integration/api.test.js` re-seeds the database and verifies the primary demo flow end-to-end.

## Conventions

- **Feature-based modules** with kebab-case folders (singular) and dot-notation files: `project.routes.js`, `project.controller.js`, `project.service.js`, `project.repository.js`.
- Controllers stay thin (parse request, delegate, respond); services own business rules; repositories own SQL.
- DTOs returned by services use the frontend contract (camelCase fields, resolved ids/names); shared response shapes live in `shared/types/api.types.js`.
- All scores are deterministic and recomputable from seeded inputs; the AI layer never changes calculated numbers.

## Supabase cutover tomorrow

1. Create a Supabase project.
2. Add the Supabase PostgreSQL connection string as the deployed server's `DATABASE_URL`.
3. Implement/run the PostgreSQL adapter and apply the equivalent schema migrations.
4. Run the canonical seed against Supabase; do not migrate the local SQLite mock database.
5. Verify the dashboard, project detail, knowledge, and team-composer paths against the cloud database before deployment.

Database credentials belong only in the Express server environment, never in the browser.