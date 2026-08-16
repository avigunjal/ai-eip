# Frontend API Client Plan

> Saved for future reference — this documents the design, structure, and
> follow-up steps for the axios-based API layer in `frontend/src/api/`.

## Goal

Give the frontend a real HTTP client that talks to the Express backend
(`http://localhost:4000/api`) instead of relying only on in-memory fixtures
(`src/data/service.js`). The client must be:

- **Transport-only** — no business logic in `client.js`.
- **Reusable & scalable** — one thin resource module per domain; adding an
  endpoint is a two-line addition in the right module.
- **Easy to read** — explicit, typed helpers; no magic numbers.
- **2026 React best practice** — typed errors, cancellation via `AbortSignal`,
  per-request timeout, Vite env config, and a dev proxy (no CORS config).

## Architecture

```text
frontend/src/api/
├── client.js        Transport core: axios instance, HttpStatus, ApiError, http helpers
├── dashboard.js     Executive overview + dashboard insights
├── projects.js      Portfolio + project detail + project risks
├── risks.js         Risk list/detail + local PATCH updates
├── teams.js         Team list/detail
├── people.js        People list/detail
├── capabilities.js  Capability list/detail
├── knowledge.js     Knowledge areas + transfer plans
├── teamComposer.js  Candidate teams, recommendations, scenarios
├── recognition.js   Recognition feed + create
├── insights.js      Insights + AI evidence
└── index.js         Barrel: `import { fetchProjects } from '../api'`
```

### Layering

1. **`client.js`** owns transport concerns only:
   - Base URL from `import.meta.env.VITE_API_BASE_URL ?? '/api'`.
   - JSON headers (`Content-Type`, `Accept`).
   - `GET` / `POST` / `PATCH` helpers returning the unwrapped response body.
   - Optional per-request timeout (instance default `10_000ms`).
   - Error normalization into a typed `ApiError`.
   - Cancellation via `AbortSignal` (surfaced as `isAbort`, never as an error).
   - `HttpStatus` constants instead of magic numbers.
   - Commented hook for future auth token injection.

2. **Resource modules** own endpoints + envelope unwrapping (domain knowledge):
   - Each function calls the `http` helpers and destructures the response
     envelope key (`{ projects }.projects`, `{ area }.area`, `{ feed }.feed`…).
   - All return values are JSDoc-typed against the global contract typedefs in
     `src/data/contracts.jsdoc.js`.
   - Accept optional `{ params, signal, timeout }` options for query filters
     and request cancellation (compatible with `src/hooks/useData.js`).

## Backend contract (response envelopes)

| Endpoint | Envelope |
|---|---|
| `GET /api/dashboard`, `/api/dashboard/overview` | plain object |
| `GET /api/dashboard/insights` | `{ insights }` |
| `GET /api/projects` | `{ projects }` |
| `GET /api/projects/:id` | `{ project }` |
| `GET /api/projects/:id/risks` | `{ projectId, risks }` |
| `GET /api/risks`, `GET /api/risks/:id` | `{ risks }` / `{ risk }` |
| `PATCH /api/risks/:id` | `{ risk }` |
| `GET /api/people`, `GET /api/people/:id` | `{ people }` / `{ person }` |
| `GET /api/teams`, `GET /api/teams/:id` | `{ teams }` / `{ team }` |
| `GET /api/capabilities`, `GET /api/capabilities/:id` | `{ capabilities }` / `{ capability }` |
| `GET /api/knowledge`, `GET /api/knowledge/:id` | `{ areas }` / `{ area }` |
| `GET /api/knowledge/transfer-plans`, `PATCH .../:id` | `{ plans }` / `{ plan }` |
| `GET /api/team-composer/teams` | `{ teams }` |
| `GET /api/team-composer/recommendations?projectId=` | `{ recommendation }` |
| `POST /api/team-composer`, `GET /api/team-composer/:id` | `{ recommendation }` / `{ scenario }` |
| `GET /api/recognition`, `/api/recognition/feed` | `{ feed }` |
| `POST /api/recognition` | `{ recognition }` |
| `GET /api/insights`, `POST /api/ai/insights` | `{ insights }` |
| `GET /api/ai/evidence/:entityId` | `{ entityId, evidence }` |

Errors are always `{ error: { status, message } }` with a proper HTTP status
code; `client.js` normalizes these into `ApiError`.

## Error model (`ApiError`)

| Situation | `status` | `code` |
|---|---|---|
| Backend error body | HTTP status | `payload.code` or `HTTP_<status>` |
| Network failure (no response) | `0` | `NETWORK_ERROR` |
| Timeout (`ECONNABORTED`) | `0` | `TIMEOUT` |
| Request cancelled (`AbortSignal`) | `0` | `CANCELLED` |

Helpers: `isNetworkError`, `isTimeout`, `isAbort`, `isUnauthorized`,
`isNotFound`; narrowing guard `isApiError(error)`.

## Dev wiring

- **Vite proxy** (`vite.config.js`): `/api` → `http://localhost:4000` so the
  frontend runs without CORS config; `VITE_API_BASE_URL` stays `/api`.
- **`.env.example`**: documents `VITE_API_BASE_URL=/api` for future overrides
  (e.g. a deployed API origin).

## Follow-up (not in scope of the initial change)

- Migrate pages/hooks from `src/data/service.js` fixtures to the new API
  modules. `useData(fetchProjects)` already matches the async fetcher shape, so
  swapping the import is the main work. Derived selectors (KPIs, risk
  summaries) still live in `service.js` and are unchanged by this layer.
- Add an auth token to the request interceptor hook when the backend requires it.