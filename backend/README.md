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
```

## Demo data

The canonical seed lives in `src/database/seed/seedData.js`; `seed.js` applies it deterministically. It includes the Payment Service single-owner narrative, 10 projects, 18 risks (2 critical, 4 high), 8 prevention actions, 6 teams, 28 people, 12 capabilities, 16 knowledge areas, 4 transfer plans, 3 staffing scenarios, 12 weeks of allocations, and recognition events. Re-run it whenever you need a clean demo state.

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