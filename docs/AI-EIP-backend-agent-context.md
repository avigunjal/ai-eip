# AI-EIP MVP Backend — Coding-Agent Context

## Objective and deadline

Build a **thin, demo-ready backend** for AI-EIP (Engineering Intelligence Platform) by **Aug 18**. The product helps engineering leaders understand delivery risk through the relationships between people, skills, systems, projects, capacity, knowledge coverage, and recognition.

The goal is a credible, explainable end-to-end hackathon demo—not a production platform.

## Current project status

- MVP scope and core architecture/data model are already designed.
- The frontend is well advanced (roughly 50%+ implemented) and is no longer the bottleneck.
- Navigation, visual system, and product experience are largely in place.
- Backend implementation and AI reasoning are the main remaining gaps.
- Assume backend-team support is unavailable; make progress independently.

## Completed UI capabilities

Existing screens/concepts include:

- **Overview / dashboard:** portfolio KPIs, project and risk signals, engineering insights.
- **Projects and Risks:** project health, delivery confidence, risk drivers, evidence, prevention actions.
- **Knowledge:** knowledge areas, coverage, single-owner risk, criticality, documentation, transfer opportunities/plans.
- **Teams:** team capacity vs demand, skill/capability coverage, workload, staffing scenarios.
- **AI Composer:** recommended team composition for a target project, rationale, evidence, trade-offs, impact, and assessment.
- **Recognition:** engineering contribution/recognition context.
- **Insights:** surfaced intelligence and recommendations.

## Product decision: freeze UI

Do **not** add significant new screens. Connect the existing UI to stable API contracts and make the primary demo path work end-to-end. Small UI changes required for loading, empty, error, drill-down, or API integration are in scope.

## MVP backend strategy

Use a simple architecture:

```text
React UI → Node.js + Express API → service/calculation layer → seeded SQLite data
                                      ↓
                              optional AI explanation layer
```

- Use **Node.js + Express** for the API. It is fast to build, easy for a React frontend to consume, and provides a clean migration path to PostgreSQL.
- Use **SQLite as the demo database**, with a seed script that creates deterministic, realistic data. It keeps the demo self-contained and makes resets reliable. JSON fixtures may be used only as the source for seeding.
- Keep calculations in services, not route handlers.
- No authentication/authorization, third-party integrations, queues, microservices, real-time sync, or production database work for the MVP.
- External-source labels such as GitHub/Jira/docs/incidents may be represented by seeded evidence; do not implement live connectors.

### Database choice and future migration

### Today: local development

Use SQLite locally with committed migrations and one repeatable canonical `seed` command. The Express API is the only layer the frontend calls, so the UI is independent of the current database.

### Tomorrow: Supabase shareable demo

Use **Supabase-hosted PostgreSQL** for the deployed demo. This is a schema deployment and re-seed—not a migration of mock SQLite records:

1. Create the Supabase project.
2. Set the backend `DATABASE_URL` to its Supabase PostgreSQL connection string.
3. Run the existing schema migrations against Supabase.
4. Run the existing canonical seed command against Supabase.
5. Verify the primary API/demo flow using Supabase.
6. Deploy Express with the Supabase production connection string in its server environment.

The hosted database provides shared, persistent **demo** data. It does not provide live GitHub, Jira, or company data; those require authenticated integrations, permissions, consent, and sync jobs, all of which are out of MVP scope.

### Portable-schema rules

- Use an ORM with migrations (Prisma or Drizzle) so SQLite and PostgreSQL use the same logical schema.
- Use portable types: UUID/text IDs, ISO-8601 timestamps/dates, numeric scores, and standard joins. Avoid SQLite-only SQL, SQLite-specific date functions, and database-specific route queries.
- Keep data access in repositories/services. Express routes call services and never contain raw database-specific SQL.
- Store local and hosted connection strings only in environment variables. The deployed Express service holds the Supabase database credential; it is never exposed to the browser.
- Keep mock/demo data in one canonical seed source. Tomorrow, run that seed source against Supabase rather than exporting/importing the SQLite database file.

**After the demo:** retain PostgreSQL/Supabase, then add authentication, workspace/tenant isolation, integration sync jobs, audit history, and background recalculation before connecting real organizational data.

## Initial relational schema

Use an ORM with migration support (Prisma or Drizzle) so SQLite and PostgreSQL share one schema. Keep IDs as UUID/text values and use ISO-8601 timestamps/dates.

```text
people(id, name, role, team_id, availability_fte)
teams(id, name, manager_person_id, sustainable_capacity_fte, committed_fte, unplanned_fte)
projects(id, name, status, target_date, health_score, health_delta, delivery_confidence)
team_memberships(team_id, person_id)
project_teams(project_id, team_id)
project_owners(project_id, person_id)

capabilities(id, name, criticality)
person_capabilities(person_id, capability_id, level, last_used_at)
team_capability_coverage(team_id, capability_id, coverage_score)
allocations(id, team_id, person_id, week_start, roadmap_fte, operational_fte, unplanned_fte)

knowledge_areas(id, name, type, criticality, coverage_score, documentation_freshness_days, documentation_completeness)
knowledge_area_projects(knowledge_area_id, project_id)
knowledge_expertise(knowledge_area_id, person_id, level, share_pct, last_contributed_at, is_backup)
knowledge_transfer_plans(id, knowledge_area_id, owner_person_id, target_coverage, due_date, status)
transfer_actions(id, plan_id, title, owner_person_id, due_date, status, expected_coverage_delta)

risks(id, project_id, title, category, probability, impact, urgency, score, severity, confidence, trend, status, owner_person_id)
prevention_actions(id, risk_id, title, owner_person_id, due_date, status, expected_outcome)
evidence(id, entity_type, entity_id, source, statement, occurred_at, source_url)

staffing_scenarios(id, name, project_id, team_id, capacity_delta_fte, capability_delta, trade_off, confidence)
scenario_changes(id, scenario_id, person_id, change_type, allocation_delta_fte, rationale)
recognition(id, person_id, project_id, knowledge_area_id, contribution_type, summary, occurred_at)
```

Store derived scores either as recalculated API fields (preferred for the demo) or as seed snapshots for chart history. Keep the raw inputs so every result can be explained.

## Core domain model

Main relationships:

```text
People ── belong to ── Teams ── deliver ── Projects
   │                         │                 │
   ├─ expertise/allocations ─┼─ capabilities ───┤
   │                         │                 ├─ Risks → Prevention actions
   └─ knowledge ownership ─ Knowledge areas ───┤
                                      │          │
                                   Systems ──────┘
```

Minimum entities:

- `Person`: id, name, role, teamId, availability/allocation, skills, expertise levels.
- `Team`: id, name, managerId, memberIds, sustainableCapacityFte, committedFte, unplannedFte, projectIds.
- `Project`: id, name, status, ownerIds, teamIds, targetDate, health score/trend, delivery confidence, linked knowledge areas/systems.
- `Risk`: id, projectId, title, category, probability, impact, urgency, severity, confidence, trend, status, evidence, ownerId.
- `PreventionAction`: id, riskId, title, ownerId, dueDate, status, expectedOutcome.
- `KnowledgeArea`: id, name, type, criticality, linked project/system IDs, expertise distribution, coverage, documentation freshness/completeness.
- `KnowledgeTransferPlan`: id, knowledgeAreaId, ownerId, actions/sessions, targetCoverage, dueDate, status.
- `Capability`: id, name, criticality, team coverage, linked knowledge areas/projects.
- `Allocation`: team/person/week, roadmapFte, operationalFte, unplannedFte.
- `StaffingScenario`: id, target project/team, proposed changes, affected people/projects, capacity and capability deltas, trade-off, confidence.
- `Recognition`: id, personId, project/knowledge-area IDs, contribution context, date, visibility/impact summary.
- `Evidence`: id, entity type/id, source label, plain-language statement, occurredAt, optional URL.

Do not create individual productivity scores or employee rankings. This is a planning and knowledge-resilience tool.

## Suggested API surface

Return JSON. Keep response shapes tailored to the UI where useful; include linked entities and explanation/evidence in detail responses.

```http
GET  /api/dashboard
GET  /api/projects
GET  /api/projects/:projectId
GET  /api/projects/:projectId/risk
GET  /api/risks
GET  /api/risks/:riskId
PATCH /api/risks/:riskId                         # review/status/owner updates, local state only
GET  /api/people
GET  /api/teams
GET  /api/teams/:teamId
GET  /api/capabilities
GET  /api/knowledge
GET  /api/knowledge/:knowledgeAreaId
GET  /api/knowledge/transfer-plans
PATCH /api/knowledge/transfer-plans/:planId      # local status updates
POST /api/team-composer                          # projectId + constraints → recommendation
GET  /api/team-composer/:scenarioId
GET  /api/recognition
GET  /api/insights
```

For every high-impact insight, risk, and recommendation, return: `summary`, `score/level`, `confidence`, `evidence[]`, `drivers[]`, `recommendedActions[]`, `assumptions[]`, and (when applicable) `tradeOff`.

## Deterministic intelligence calculations

Make scores repeatable from fixture data. Do not rely on an LLM to invent numeric assessments.

- **Risk score:** `probability × impact × urgency` (normalize to 0–100); derive severity with fixed thresholds.
- **Project health:** weighted roll-up of open-risk burden, health trend, milestone/delivery confidence, capacity pressure, dependency exposure, and knowledge risk. Use explicit weights and clamp to 0–100.
- **Delivery pressure:** `(committedFte + unplannedFte) / sustainableCapacityFte`; sustainable capacity defaults to 85% of nominal team capacity.
- **Knowledge risk:** normalized combination of `criticality × concentration × availability exposure × documentation gap`. Flag Critical when criticality is high, one person holds most knowledge, and no capable backup exists.
- **Capability coverage:** count/weight capable and backup people for a critical capability or knowledge area; distinguish primary, capable, learning, and unverified.
- **Team-composer ranking:** select people whose skill coverage matches project needs, then penalize over-allocation, missing backup coverage, duplicate primary ownership, and conflicts. Return 1–3 alternatives with trade-offs.
- **Recognition:** use only seeded contribution context (e.g., incident response, documentation, mentorship, delivery); never infer performance ranking.

Keep calculation inputs and their contribution visible in API responses so the UI can explain “why flagged?”.

## AI reasoning layer

The AI layer converts deterministic results and evidence into concise, useful language. It must be grounded in supplied structured data and must not change calculated scores or fabricate evidence.

Required output pattern:

```text
Finding → why it matters → cited evidence/signals → recommended next action → confidence/assumptions
```

Example: “Payment Service is a critical single-expert dependency: its criticality is 92, Developer A holds 85% of recent expertise, no capable backup is recorded, and the runbook is stale. Assign a backup, schedule paired release work, and update the runbook.”

If an LLM/API key is unavailable, generate this copy with deterministic templates. The demo must still work offline.

## Future AI and RAG path

Do not add RAG before the core demo works. The current product intelligence should come from structured database records and deterministic calculations; this makes it auditable and avoids hallucinated risk scores.

After the demo, add RAG in this sequence:

1. Ingest approved documents and integration records (runbooks, ADRs, incident summaries, Jira items, GitHub PR metadata) with workspace permissions and source links.
2. Extract text, split it into chunks, store metadata (`workspace`, `source`, `entity IDs`, `updatedAt`, access policy), and create embeddings.
3. Store embeddings in Supabase PostgreSQL with `pgvector` (or a dedicated vector store only if scale requires it).
4. Retrieve only permission-filtered, entity-relevant chunks—for example, the Payment Service when explaining its knowledge risk.
5. Supply retrieved excerpts plus deterministic scores/evidence to an LLM; require citations/source links in its response.
6. Keep AI output advisory: it may summarize and propose actions, but calculation services remain the source of truth for scores and severity.

This yields a useful future question-answering experience—“Why is Payment Service risky?” or “What documentation should the backup read?”—without compromising the explainable planning model.

## Seed-data and data-quality requirements

Create coherent, cross-linked fixtures—not isolated dashboard numbers:

- About **10 projects**, **18 risks**, **6 teams**, **28 people**, **12 capabilities**, **12 weeks of allocations**, **8 prevention actions**, **3 staffing scenarios**, and several knowledge areas/transfer plans.
- Include 2 overloaded teams, 3 capability gaps, 2 Critical and 3 High project risks, and several current/overdue prevention actions.
- Include one strong demo narrative: **Payment Service** is revenue-critical, roughly 38% covered, dominated by one expert, lacks a capable backup, has stale documentation, and affects active checkout/PCI work.
- IDs, names, dates, team membership, projects, expertise, evidence, risks, and actions must agree across all responses.
- Use plausible dates relative to the demo timeframe; risk evidence should precede assessments/actions.
- Never show a high/critical flag without at least 2–3 concrete evidence items and a next action.

## Priority demo flow

1. Open **Dashboard**: identify an at-risk project / critical knowledge signal.
2. Drill into **Project/Risk**: show score, drivers, evidence, confidence, and owned prevention action.
3. Open **Knowledge**: reveal the Payment Service single-owner dependency and transfer plan.
4. Open **AI Composer**: recommend a balanced team or staffing option with clear rationale and trade-off.
5. Optionally change a prevention/transfer-plan status locally and refresh the derived state.

Every step should visibly connect people, capability/knowledge coverage, capacity, and delivery risk.

## Implementation order

### Today — build and validate locally

1. Create the Node.js + Express service with health check, JSON middleware, error handling, and an `/api` router.
2. Add the ORM, portable SQLite migrations, and one repeatable canonical seed command based on the schema above.
3. Inspect the frontend data usage and introduce one API client/base URL.
4. Implement deterministic services and tests for risk, health, capacity, coverage, and team-composer ranking.
5. Implement the dashboard, projects, risks, knowledge, teams, and composer endpoints in that order.
6. Wire the primary UI flow; add loading, empty, and failure states.
7. Add template-based explanations first; connect an optional LLM only if time remains.

### Tomorrow — deploy the same application to Supabase

8. Create the Supabase project, configure the server-side `DATABASE_URL`, run migrations, and re-run the canonical seed command.
9. Test the full primary flow against Supabase; fix any SQLite/PostgreSQL portability issues before deployment.
10. Deploy Express with its production Supabase connection string and run the complete shared-demo flow.

## Constraints

- Deadline is Aug 18: favor reliable, explainable, demo-ready behavior over completeness.
- Supabase Free is sufficient for this hackathon dataset (500 MB database allowance), but a free project may pause after one week of low activity; keep the project active before the presentation.
- Preserve the existing UI and its API-ready direction; do not redesign the product.
- Keep all recommendations human-reviewable. A manager can validate, dismiss, or update local status; AI does not autonomously assign people or take external actions.
- Avoid scope creep: no production hardening, integrations, authentication, or complex infrastructure unless the core demo is already complete.
