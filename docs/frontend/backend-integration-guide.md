# AI-EIP Backend → Frontend Integration Guide

## Purpose

This document defines the implementation rules for integrating the AI-EIP backend APIs into the existing frontend.

The integration must be performed **incrementally, module by module**.

Do **not** replace all frontend mock data simultaneously.

The primary objective is to preserve the existing UI while progressively replacing mock data with real backend data, without introducing unnecessary refactoring or coupling.

---

# 1. Core Integration Strategy

Follow this order strictly:

```text
Existing Frontend UI
        ↓
Identify data required by UI
        ↓
Identify corresponding backend API
        ↓
Implement API/service integration
        ↓
Map backend response → frontend View Model
        ↓
Connect View Model to existing UI
        ↓
Handle loading/error/empty states
        ↓
Test
        ↓
Validate existing UI behavior
        ↓
Remove ONLY that module's mock data
        ↓
Move to next module
```

## Critical Rule

Never do this:

```text
Replace all mock data
        ↓
Connect every API
        ↓
Fix everything together
```

Instead:

```text
Overview
  ↓
validate
  ↓
People
  ↓
validate
  ↓
Projects
  ↓
validate
  ↓
Teams
  ↓
...
```

Each module must remain independently functional.

---

# 2. Current Implementation Scope

## ONLY implement Overview first

The first integration scope is:

```text
Overview UI
    ↓
GET /api/dashboard
    ↓
GET /api/dashboard/insights
    ↓
Validate complete Overview
    ↓
Remove Overview mock data
```

Do not begin People, Projects, Teams, Knowledge, Recognition, or other modules during this step.

Do not perform unrelated refactoring.

---

# 3. Before Changing Code

OpenCode MUST inspect the existing repository before modifying anything.

Inspect:

- Frontend folder structure
- Overview module
- Existing API/service utilities
- Existing HTTP client
- Existing hooks
- Existing state management
- Existing mock-data files
- Existing types/interfaces
- Existing error/loading patterns
- Existing test setup
- Existing environment configuration
- Backend dashboard routes/controllers/services
- Backend insights implementation
- Existing API response contracts

Do not create a new architectural pattern if an equivalent pattern already exists.

Prefer extending the existing architecture over introducing duplicate abstractions.

---

# 4. Architecture Principles

Use the following separation of responsibilities.

```text
Component
   ↓
Hook / Controller
   ↓
Frontend Service
   ↓
HTTP Client
   ↓
Backend API
```

Where response transformation is required:

```text
Backend API
   ↓
Frontend Service
   ↓
Adapter / Mapper
   ↓
View Model
   ↓
React Component
```

## Components

React components should primarily handle:

- Rendering
- User interaction
- UI state presentation
- Calling hooks/view-model APIs

Components should NOT contain:

- Raw `fetch()` / Axios calls
- Backend URL construction
- Complex response transformation
- Business logic
- Duplicated mapping logic

Bad:

```js
function Overview() {
  useEffect(() => {
    fetch('/api/dashboard')
      .then(...)
  }, [])
}
```

Prefer:

```js
function Overview() {
  const { data, loading, error } = useDashboard();

  // render
}
```

---

# 5. API Service Layer

API communication must be centralized.

Example conceptual structure:

```text
services/
  dashboard.service.js
  insights.service.js
```

or follow the repository's existing service structure if one already exists.

Example:

```js
export async function getDashboard() {
  return apiClient.get('/api/dashboard');
}
```

The service should be responsible for communicating with the backend.

It should not contain UI rendering logic.

---

# Existing API Client — Mandatory Constraint

The frontend **already has a centralized API client implemented and configured for all modules** (`frontend/src/api/client.js` + resource modules).

OpenCode MUST reuse the existing API client.

## Do NOT

- Create another `fetch` wrapper.
- Create another Axios instance.
- Create another HTTP client.
- Create module-specific HTTP clients.
- Duplicate authentication/header/interceptor logic.
- Introduce a new API abstraction when the existing client already supports the requirement.
- Move or rewrite the existing API client unless there is a demonstrated defect blocking integration.

## Required Flow

```text
React Component
      ↓
Hook / Container
      ↓
Module Service
      ↓
Existing API Client
      ↓
Backend API
```

Example:

```text
Overview
   ↓
useDashboard()
   ↓
dashboard.service
   ↓
existing apiClient
   ↓
GET /api/dashboard
```

And:

```text
Overview
   ↓
useDashboardInsights()
   ↓
dashboard/insights service
   ↓
existing apiClient
   ↓
GET /api/dashboard/insights
```

The exact filenames and folder structure MUST follow the existing repository conventions.

## Before Implementing

OpenCode MUST first locate and inspect the existing API client and determine:

- Where it is defined.
- How modules currently consume it.
- How base URLs are configured.
- How authentication is handled.
- How headers are configured.
- How errors are handled.
- Whether interceptors/middleware already exist.
- Whether response parsing is already centralized.
- Whether request cancellation is supported.
- How tests mock the client.

Then reuse that implementation.

## Separation of Responsibilities

The existing API client owns **transport concerns**:

```text
API Client
├── HTTP method
├── Base URL
├── Headers
├── Authentication
├── Interceptors
├── Common HTTP error handling
└── Request configuration
```

Module services own **API/domain access**:

```text
Dashboard Service
├── getDashboard()
└── getDashboardInsights()
```

Adapters own **backend → frontend transformation**:

```text
Backend DTO
      ↓
Dashboard / Insight Adapter
      ↓
Frontend View Model
```

React hooks/containers own **data consumption and UI state orchestration**:

```text
Hook
├── loading
├── data
├── error
└── refresh/retry if existing architecture supports it
```

React components own **presentation**.

Do not mix these responsibilities.

## Example

Prefer:

```js
// dashboard.service.js

export const getDashboard = () =>
  apiClient.get('/api/dashboard');
```

rather than:

```js
// Overview.jsx

useEffect(() => {
  fetch(...)
}, []);
```

The exact implementation must follow the existing API client's actual interface.

Do not assume the client uses `.get()` if the repository uses another API.

## Important

The existence of the centralized API client means the current integration task is **not an API infrastructure task**.

The goal is to connect the existing frontend architecture to the existing backend APIs.

Therefore:

```text
Existing API Client
        ↓
     REUSE
        ↓
Module Service
        ↓
Adapter
        ↓
Hook
        ↓
Existing UI
```

No new HTTP infrastructure should be introduced.

## Overview Constraint

For the current Overview integration, OpenCode should only add the minimum required module-level API/service/adapter/hook code around the existing API client:

```text
Existing API Client
        ↓
Dashboard Service
        ↓
Dashboard Adapter (only if required)
        ↓
Dashboard Hook / existing data pattern
        ↓
Overview UI
```

and:

```text
Existing API Client
        ↓
Dashboard Insights Service
        ↓
Insight Adapter
        ↓
Existing Insights Hook / data pattern
        ↓
InsightCard
```

Do not modify the existing API client unless integration reveals a concrete, reproducible issue with it.

If such an issue is discovered, stop and report it before making architectural changes.

---

# 6. Adapter / View Model Pattern

Backend responses should not automatically become UI contracts.

If the backend response differs from what the UI requires, introduce an adapter.

Example:

```text
API Response
     ↓
mapDashboardResponse()
     ↓
DashboardViewModel
     ↓
React UI
```

This prevents backend contracts from becoming tightly coupled to individual React components.

## Important

Do not modify backend APIs simply because an existing React component expects a different shape unless there is a clear architectural reason to do so.

First determine whether the mismatch is a legitimate frontend presentation concern.

---

# 7. Insight Response Mapping

There is currently a known backend/frontend contract mismatch.

## Backend

The backend returns:

```js
{
  level,
  score,
  summary,
  confidence,
  evidence[],
  drivers[],
  recommendedActions[],
  assumptions[]
}
```

## Existing Frontend

`InsightCard` expects approximately:

```js
{
  severity,
  confidence,
  evidenceCount,
  why: {
    evidence,
    reasoning,
    impact,
    assessment
  }
}
```

## Required approach

Prefer a frontend adapter/view-model:

```text
GET /api/dashboard/insights
        ↓
Backend Insight DTO
        ↓
mapInsightToViewModel()
        ↓
InsightViewModel
        ↓
InsightCard
```

Do not spread mapping logic across multiple components.

Create one reusable mapping function.

Conceptually:

```js
function mapInsightToViewModel(insight) {
  return {
    severity: insight.level,
    confidence: insight.confidence,
    evidenceCount: insight.evidence?.length ?? 0,
    why: {
      evidence: insight.evidence,
      reasoning: insight.summary,
      impact: insight.drivers,
      assessment: insight.summary,
    },
  };
}
```

The exact mapping must be based on the actual repository's semantics and existing UI behavior.

Do not blindly copy the example above.

If the repository already has an established adapter/view-model convention, follow that convention instead.

---

# 8. React Best Practices

Follow existing React conventions first.

General rules:

- Prefer functional components.
- Keep components focused.
- Avoid unnecessary `useEffect`.
- Do not fetch data directly inside presentational components.
- Avoid unnecessary local state.
- Do not duplicate server state into multiple React states.
- Keep derived values derived rather than storing them separately.
- Use stable keys.
- Avoid unnecessary re-renders.
- Avoid premature memoization.
- Do not introduce global state unless existing architecture requires it.
- Follow existing hooks and state-management patterns.

Do not introduce Redux/Zustand/React Query/etc. merely for this integration if the project already has an established simpler mechanism.

---

# 9. DRY Principles

Do not duplicate:

- API calls
- URL construction
- Response mapping
- Error handling
- Loading-state logic
- Formatting logic
- Business rules

If multiple Overview components require the same dashboard data:

```text
useDashboard()
      ↓
shared dashboard data
```

rather than:

```text
OverviewHeader → /api/dashboard
OverviewStats  → /api/dashboard
OverviewChart  → /api/dashboard
```

The service/hook should provide the shared data.

However, do not over-engineer prematurely.

Create abstractions only when they represent a real reusable responsibility.

---

# 10. Overview Integration — Step 1

## Step 1.1 — Understand Existing Overview

Identify:

- Overview page/container
- Overview child components
- Current mock-data source
- Which UI sections consume which mock fields
- Existing loading states
- Existing empty states
- Existing error states

Create a mapping:

```text
Mock Data
   ↓
Overview UI Section
```

Do not remove the mocks yet.

---

# 11. Overview Integration — Step 2

## Integrate GET /api/dashboard

Implement the dashboard API integration using the existing frontend HTTP/service architecture.

Expected flow:

```text
Overview
   ↓
useDashboard()
   ↓
dashboard.service
   ↓
HTTP client
   ↓
GET /api/dashboard
```

Verify:

- Correct HTTP method
- Correct endpoint
- Correct request configuration
- Correct response parsing
- Correct authentication/configuration if applicable
- Correct error propagation

Do not connect insights yet if dashboard integration itself is broken.

---

# 12. Overview Integration — Step 3

## Replace Dashboard Data

Once `GET /api/dashboard` works:

```text
Dashboard API response
        ↓
Dashboard adapter if required
        ↓
Dashboard View Model
        ↓
Existing Overview components
```

Keep the existing UI.

Do not redesign the Overview.

Do not change styling unless required to display the real response correctly.

Do not remove unrelated mocks.

---

# 13. Overview Integration — Step 4

## Integrate GET /api/dashboard/insights

Implement:

```text
Overview
   ↓
Insights service
   ↓
GET /api/dashboard/insights
   ↓
Insight adapter
   ↓
InsightViewModel
   ↓
InsightCard
```

Ensure the existing InsightCard continues receiving the contract it expects.

The adapter should be the boundary between backend DTOs and UI models.

---

# 14. Loading States

The Overview must behave correctly while API requests are pending.

Do not allow:

```text
undefined
null
```

to randomly propagate into components and cause runtime errors.

Use the project's existing loading-state pattern.

For example:

```text
Loading
  ↓
Skeleton / existing loading UI
```

Do not create a new loading system if one already exists.

---

# 15. Error States

API failure must not crash the Overview.

Handle:

- Network failure
- HTTP errors
- Invalid/partial response
- Empty response

Use the application's existing error handling mechanism.

If no established pattern exists, introduce the smallest reusable pattern necessary.

Do not duplicate error UI across every component.

---

# 16. Empty States

Distinguish:

```text
Loading
Error
Empty
Success
```

These are different states.

Example:

```text
Loading → skeleton
Error   → error state
Empty   → meaningful empty state
Success → real data
```

Do not treat an empty array as an API failure.

---

# 17. Data Validation

Before connecting the UI, inspect the actual backend response.

Do not assume the response shape based only on documentation or mock data.

Verify:

- Required fields
- Optional fields
- Array fields
- Nullability
- Numeric values
- Enum values
- Nested structures

If the project already uses TypeScript, schemas, Zod, Joi, or another validation mechanism, follow that existing approach.

Do not introduce a new validation library unnecessarily.

---

# 18. Mock Data Removal Rule

This is extremely important.

Do NOT remove Overview mock data immediately after writing the API call.

The order must be:

```text
1. API implemented
2. API tested independently
3. Service verified
4. Adapter verified
5. UI connected
6. Loading state verified
7. Error state verified
8. Empty state verified
9. Existing Overview functionality verified
10. Real backend data confirmed
11. Only then remove Overview mock data
```

Only remove mocks that belong to Overview.

Do not remove:

- People mocks
- Projects mocks
- Teams mocks
- Knowledge mocks
- Recognition mocks
- Other module mocks

---

# 19. Testing Requirements

At minimum verify:

## Service

- Successful dashboard request
- Dashboard API failure
- Successful insights request
- Insights API failure

## Adapter

Test backend response → frontend View Model.

Especially test:

```text
level → severity
evidence[] → evidenceCount
backend insight fields → why.*
```

Also test missing/empty arrays where relevant.

## React/UI

Verify:

- Loading state
- Successful render
- Empty state
- Error state
- Existing interactions
- No console errors
- No unnecessary duplicate API requests

Follow the project's existing testing framework and conventions.

---

# 20. Manual Verification

After implementation, verify the browser Network tab.

Expected:

```text
GET /api/dashboard
GET /api/dashboard/insights
```

Check:

- HTTP status
- Response body
- Request count
- No duplicate unnecessary requests
- No failed requests
- No unexpected API calls

Then verify the rendered Overview against the previous mock-data UI.

The UI should remain functionally equivalent unless the real backend data naturally differs.

---

# 21. Do Not Do These Things

During this task, do NOT:

- Rewrite the Overview UI
- Redesign components
- Replace the entire state-management system
- Introduce a new HTTP client
- Introduce a new data-fetching library without necessity
- Modify unrelated modules
- Remove all mock data
- Refactor the entire frontend architecture
- Rewrite backend APIs unnecessarily
- Rename large numbers of files
- Change unrelated styling
- Perform broad cleanup
- Add speculative abstractions
- Implement future integrations such as Jira/GitHub/Slack
- Start another module before Overview is verified

---

# 22. Code Quality Standards

All changes must follow:

- Existing repository conventions
- Single Responsibility Principle
- DRY
- Separation of concerns
- Dependency inversion where appropriate
- Small focused functions
- Meaningful naming
- Minimal coupling
- Explicit contracts
- Predictable error handling
- Testability

Prefer:

```js
getDashboard()
mapDashboardResponse()
useDashboard()
```

over a large component containing:

```text
HTTP request
response parsing
business logic
mapping
state management
rendering
error handling
```

---

# 23. Definition of Done — Overview

Overview integration is complete only when all are true:

- [ ] Existing Overview UI has been inspected.
- [ ] Existing mock-data flow has been understood.
- [ ] Existing API/service architecture has been identified.
- [ ] `GET /api/dashboard` is integrated.
- [ ] Dashboard response is correctly mapped if required.
- [ ] Existing Overview UI renders real dashboard data.
- [ ] `GET /api/dashboard/insights` is integrated.
- [ ] Insight response is mapped through a dedicated adapter/view model where required.
- [ ] `InsightCard` receives its expected frontend contract.
- [ ] Loading state works.
- [ ] Error state works.
- [ ] Empty state works.
- [ ] API/service/adapter tests are added or updated according to existing project conventions.
- [ ] Browser Network requests have been verified.
- [ ] No duplicate/unnecessary requests exist.
- [ ] No console/runtime errors exist.
- [ ] Existing Overview behavior remains intact.
- [ ] Only Overview mock data has been removed.
- [ ] Mock data for other modules remains untouched.
- [ ] No unrelated refactoring was introduced.

---

# 24. Completion Gate

Before starting the next module, stop and verify:

```text
Overview
   ↓
Dashboard API ✓
   ↓
Dashboard UI ✓
   ↓
Insights API ✓
   ↓
Insight adapter ✓
   ↓
Insight UI ✓
   ↓
Loading/Error/Empty ✓
   ↓
Tests ✓
   ↓
Manual verification ✓
   ↓
Overview mocks removed ✓
```

Only after all gates pass should the next module be started.

---

# 25. Next Modules

After Overview is fully verified, continue incrementally.

Recommended order:

```text
1. Overview
2. People
3. Projects
4. Teams
5. Knowledge
6. Recognition
7. Remaining modules
```

For every module, repeat the same process:

```text
Existing UI
    ↓
Identify mock dependencies
    ↓
Identify backend API
    ↓
Inspect actual response
    ↓
Service
    ↓
Adapter/View Model
    ↓
Hook/state integration
    ↓
UI
    ↓
Loading/Error/Empty
    ↓
Tests
    ↓
Manual verification
    ↓
Remove ONLY that module's mocks
```

---

# 26. OpenCode Execution Rule

When implementing this document:

**Inspect first, modify second.**

Before making changes:

1. Inspect the relevant frontend files.
2. Inspect the relevant backend API.
3. Identify existing patterns.
4. Explain the intended minimal change internally.
5. Implement only the current module.
6. Test.
7. Verify.
8. Remove mocks only after successful verification.

Do not assume architecture.

Do not create duplicate patterns.

Do not perform broad refactoring.

Do not move to another module until the current module satisfies its Definition of Done.

**Current task: Overview only.**
