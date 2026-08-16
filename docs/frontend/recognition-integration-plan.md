# Recognition Module Integration Plan

Status: IMPLEMENTED

## Goal

Migrate the Recognition page from mock data to the real Express backend recognition endpoints, per `docs/frontend/backend-integration-guide.md`. Final module in the order: Overview → People → Projects → Teams → Knowledge → Recognition.

## Backend Contract (verified live)

- `GET /api/recognition` and `GET /api/recognition/feed` → `{ feed: FeedItemDTO[] }` (18 seeded items)
- `POST /api/recognition` → `201 { recognition }`; validates `type` ∈ { reliability, mentorship, delivery, knowledge_sharing } and `visibility` ∈ { public, private }; returns 400 `{ error: { status, message } }` on invalid input
- FeedItemDTO:
  ```
  {
    id, personId,
    person: { id, name },
    project: { id, name } | null,
    knowledgeArea: { id, name } | null,
    type, summary, occurredAt, visibility,
    evidenceIds: string[]
  }
  ```

The DTO matches the fields the page renders → **no adapter needed**.

## Changes

### 1. `src/pages/Recognition/index.jsx`

- Replaced `getRecognitions()` with `useData(fetchRecognitionFeed)` + `LoadingState` / `ErrorState onRetry` (page previously had no loading/error handling).
- KPI row (Total events + reliability/mentorship/delivery counts) and the `visibility === 'public'` feed filter derive from the real feed.
- Feed name prefers the real embedded `r.person?.name`, falling back to the mock `getPeople()` lookup. Avatars and the composer person-select keep mock `getPeople()` (AvatarGroup needs `initials`/`avatarColor` — same pattern as Teams/Projects/Knowledge).
- Composer modal now submits for real: `handleSubmit` calls `createRecognition({ personId, type, summary })` from `api/recognition.js`, then `retry()` refreshes the feed (new items render at the top). The "Undo" toast action is kept (backend has no delete endpoint — cosmetic, unchanged). Failures surface `err.message` via toast (e.g. invalid type → 400 message).

### 2. PersonProfile — stays on mock `getRecognitions()`

Consistent with the Teams/Knowledge precedents (PersonProfile keeps `getTeam`/`getKnowledgeAreas` mock). Its recognition metric/list stays mock-enriched.

### 3. Mock removal from `src/data/service.js`

- Removed `fetchRecognitions` (async mock — already dead, no page used it).
- Kept `getRecognitions` + `recognitions` fixtures (PersonProfile still uses them).

### 4. Insights page — out of scope

The `Insights` page reads a separate static `data/insights.js` mock and maps to `/api/insights` (not recognition data). The guide lists it under "Remaining modules" (item 7), so it stays for a later step.

## Verification

- Live: `GET /api/recognition/feed` (18 seeded items, all fields; `rec-01` Michael Miller public). POST created `rec-1786911390310` (Rohan Patel, delivery) → feed count 19, new item at index 0 with embedded `person` for name rendering. Invalid type (`bogus`) → 400 `{ error: { status, message } }`, surfaced by the client as a toast message.
- `npm run lint` + `npm run build` in `frontend/` both pass.
- Grep: no `fetchRecognitions` references; `getRecognitions` only in `data/service.js` and `PersonProfile/index.jsx` (intended).

## Out of Scope

- No backend changes, no adapter/new hooks.
- `Insights` page, `updateTransferPlan`, `team-composer` remain for later ("Remaining modules").
- No change to PersonProfile's recognition source.
- Note: the live POST test left one in-memory feed item on the running dev server; it resets on backend restart.