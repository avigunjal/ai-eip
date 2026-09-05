# AI Engineering Intelligence Platform (AI-EIP)
## Architecture Document

**Version:** 1.0
**Status:** MVP Architecture
**Purpose:** Define the technical architecture, design decisions, and evolution path for AI-EIP.

---

# 1. Overview

## Product Overview

AI Engineering Intelligence Platform (AI-EIP) is an engineering intelligence platform that helps organizations identify project risks, knowledge gaps, and team capacity issues by analyzing signals generated throughout the software development lifecycle.

The platform brings together engineering signals from projects, teams, systems, repositories, documentation, and operational activities to provide actionable insights.

AI-EIP focuses on helping engineering leaders answer:

- Which projects require attention?
- Where are critical knowledge dependencies?
- Are teams operating within sustainable capacity?
- What actions can reduce engineering risks?

The platform combines deterministic engineering analysis with AI-assisted reasoning to explain findings and recommend possible actions. Deterministic analysis is always the source of truth; AI output is advisory and grounded in that analysis.

---

# 2. Problem Statement

Modern engineering organizations generate large amounts of information across multiple systems:

- Source control platforms
- Project management tools
- Documentation systems
- Incident management platforms
- Team and skill databases

However, these signals are distributed across different tools and are difficult to analyze together.

Engineering leaders often discover problems only after they impact delivery.

Common challenges include:

### Project Risk Visibility

Teams lack early visibility into:

- Delivery risks
- Dependency blockers
- Increasing operational pressure
- Project health degradation

### Knowledge Dependency

Critical systems may depend on a small number of engineers.

Examples:

- Single subject matter expert ownership
- Missing backup engineers
- Outdated documentation
- Low knowledge coverage

### Team Capacity Management

Engineering managers need better visibility into:

- Team workload
- Skill coverage
- Resource gaps
- Project allocation risks

### Decision Latency

Important engineering decisions require manually collecting information from multiple sources before action can be taken.

AI-EIP creates a unified intelligence layer to reduce this decision gap.

---

# 3. Goals

## 3.1 Engineering Risk Intelligence

Identify engineering risks by analyzing project and system signals.

Examples:

- Delivery confidence reduction
- Dependency risks
- Increasing unresolved issues
- Ownership gaps

## 3.2 Knowledge Intelligence

Identify areas where engineering knowledge is concentrated or insufficiently distributed.

Examples:

- Single engineer dependency
- Low documentation coverage
- Missing ownership backup
- Knowledge transfer opportunities

## 3.3 Engineering Team Intelligence

Provide visibility into team health, capacity, and skill coverage.

Capabilities:

- Team capacity analysis
- Skill coverage analysis
- Risk exposure detection
- Team composition recommendations

## 3.4 Action Recommendations

Convert identified risks into practical mitigation steps.

Examples:

- Create knowledge transfer plans
- Assign backup ownership
- Balance team capacity
- Improve documentation coverage

---

# 4. Non-Goals (MVP)

The MVP intentionally avoids:

- Replacing existing engineering tools
- Automatically making organizational decisions
- Fully autonomous engineering management
- Real-time monitoring of every engineering activity
- Building a complete enterprise data platform
- Automatically executing recommended actions
- Connecting to live source systems (GitHub, Jira, etc.) — the MVP analyzes a canonical seeded dataset that mirrors those signals

AI-EIP is designed as a **decision-support platform**, not a replacement for engineering leadership.

---

# 5. High-Level Architecture

## Architecture Overview

AI-EIP follows a layered architecture where engineering signals are collected, processed, analyzed, and converted into actionable insights.

```
                          Users
                            |
                            |
                  React Web Application
                  (React 19 + Vite + MUI)
                            |
                            |
                     Backend API Layer
                     (Node.js + Express)
                            |
         -------------------------------------------------
         |                                             |
         |                                             |
   Deterministic Intelligence                  AI Reasoning Layer
   (Risk engine · Knowledge engine ·           (explains · summarizes ·
    Team engine · Insight synthesis)            recommends)
   Core calculation pipeline —                 Advisory layer over the
   served directly to the UI                   deterministic result
         |                                             |
         -------------------------------------------------
                            |
                  Engineering Signal Layer
                  (Canonical Signal Store)
                            |
         -------------------------------------------------
         |          |            |          |           |
    Projects     Knowledge    Teams &    Risks &    Recognition
    & Clients    Areas        People     Evidence   & People
                            |
         -------------------------------------------------
                    Future connectors (roadmap)
         GitHub  ·  Jira  ·  Wiki  ·  Incident/Monitoring
```

Note: in the MVP, the Engineering Signal Layer is a canonical relational store populated by a deterministic seed dataset. Live source-system connectors (GitHub, Jira, wiki, incident feeds) are future capabilities and are intentionally drawn outside the MVP flow.

---

# 6. Architecture Principles

## 6.1 Signal First, AI Second

AI-EIP does not depend only on generative AI.

Engineering signals and deterministic analysis provide the foundation. The AI pipeline is strictly:

```
deterministic signals
    → compact, grounded context
    → LLM (if enabled)
    → structured-output validation / coercion
    → cache
    → deterministic fallback on any failure
```

AI is used for:

- Explaining findings
- Summarizing evidence
- Generating recommendations
- Improving decision understanding

AI output never replaces the deterministic scores, evidence, or drivers. The application remains fully functional offline with AI disabled.

## 6.2 Evidence-Based Insights

Every recommendation should be traceable to supporting signals.

Example:

Risk:

> Payment Service has high knowledge dependency

Supporting evidence:

- 85% contribution ownership by one engineer
- Recent incident ownership pattern
- Missing backup ownership
- Documentation freshness gap

The `evidence` entity is a first-class part of the model: each insight and risk cites the concrete signals (source, statement, timestamp, optional source URL) it was derived from. The AI reasoning layer is explicitly instructed to reason only over supplied evidence and never invent new facts.

## 6.3 Human Decision Support

The platform assists engineering leaders but does not automatically enforce organizational decisions.

Recommended actions (transfer plans, staffing scenarios, backup assignments) are persisted only after an explicit user action, and they never mutate the underlying risk/insight signals. Final decisions remain with engineering teams.

---

# 7. Core System Components

## 7.1 Frontend Application

Technology:

- React 19
- JavaScript (JSX)
- Vite build tooling
- MUI (Material UI) component system
- Recharts for visualization
- Zustand for client state
- React Router v7

Responsibilities:

- Dashboard visualization
- Risk exploration
- Knowledge analysis
- Team intelligence views
- Recommendation workflows
- AI explanation surfaces (with explicit deterministic/LLM source indicators)

## 7.2 Backend API Layer

Technology:

- Node.js
- Express
- better-sqlite3 (today) / PostgreSQL (future)
- Feature-based modular structure: `routes → controller → service → repository`

The MVP backend is a **modular monolith**: domain modules are isolated internally while sharing one runtime and one database. This keeps deployment simple while preserving clean extraction boundaries — any module can be promoted to a standalone service later without internal redesign.

Responsibilities:

- API orchestration
- Business logic
- Data aggregation
- Communication with analysis engines
- AI provider orchestration

Auth is stubbed for the MVP (CORS + Helmet hardening in place; request middleware reserved for a future auth layer).

## 7.3 Engineering Signal Layer

Responsible for collecting and normalizing engineering data. In the MVP this is a canonical relational model populated by a deterministic seed dataset; the schema and seed are written to be portable to PostgreSQL (Supabase) without changing API contracts.

Domain entities modeled:

- Projects, clients, and project ownership
- People, teams, and team memberships
- Capabilities, skill levels, and team coverage
- Allocations (roadmap / operational / unplanned FTE)
- Knowledge areas, expertise shares, and backups
- Risks and prevention actions
- Evidence (traceable signal citations)
- Staffing scenarios and scenario changes
- Recognition (contribution history and impact)
- Knowledge transfer plans and transfer actions

## 7.4 Intelligence Engines

AI-EIP contains multiple domain-focused analysis engines. All engines are deterministic, offline, and recomputable; none require an LLM.

### Risk Engine (`analytics/project-risk`)

Identifies:

- Project risks
- Delivery concerns
- Dependency issues

Scoring combines signal probability, impact, and urgency with domain thresholds and signal weights.

### Knowledge Engine (`analytics/knowledge-risk`)

Identifies:

- Knowledge concentration
- Ownership gaps
- Documentation gaps

Scoring weighs criticality, dominant expertise share, coverage gap, documentation gap, and backup availability to detect single-owner systems.

### Team Intelligence Engine (`team-composer` / `skill-matcher`)

Analyzes:

- Capacity
- Skills
- Team balance

Recommends a balanced team for a project from capability coverage, penalizing candidates on overloaded teams, and produces coverage assessment, trade-offs, impact, and alternatives.

### Insight Synthesis (`insights`)

Converts engine output into concise, explainable findings. Every insight cites its drivers, evidence, and assumptions, and is the input to the AI explanation layer.

## 7.5 AI Reasoning Layer

The AI layer provides:

- Natural language explanations
- Insight summaries
- Recommendation generation

It does not replace the underlying analysis logic. The AI layer is a reasoning layer, not a decision engine: it never sets scores, changes severities, or triggers actions. All quantitative state is owned by deterministic analysis, and all organizational decisions remain with engineering teams.

Implementation highlights:

- **Provider abstraction**: a provider registry (`llm.provider.js`) exposes a uniform interface. OpenRouter is the current provider (free tier, `openrouter/free`); xAI Grok is a supported alternative wired through the same interface, and future providers register the same way. Swapping providers never touches business logic.
- **Runtime enable toggle**: AI can be switched on/off at runtime without restart; disabling clears the AI cache so a stale LLM result can never be served in deterministic mode.
- **Grounded prompts**: the LLM only ever receives a compact summary of deterministic results — never full database objects or secrets — and is instructed to cite only supplied evidence.
- **Structured output**: responses are schema-constrained and validated/coerced; invalid output degrades gracefully to the deterministic result.
- **Reliability**: bounded retries with backoff for transient failures, an in-flight request dedupe, and TTL-based caching (30-minute analysis cache) mean users never see a 500 from the AI path.

## 7.6 Storage Layer

- **Today**: SQLite via `better-sqlite3`, created and seeded locally. Portable DDL uses text/UUID ids and ISO-8601 timestamps.
- **Tomorrow**: PostgreSQL (Supabase). The database adapter, migrations, and seed data are structured so the swap changes no HTTP routes or service contracts.
- **Seed strategy**: a canonical demo dataset with a fixed "demo today" date keeps every date deterministic and stable across re-seeds.

## 7.7 Recognition & People Signals

Recognition is a differentiator: contribution history (project, knowledge area, contribution type, summary, visibility) with grounded impact statements. It feeds team intelligence and demonstrates the platform's people dimension beyond pure delivery metrics.

---

# 8. MVP Architecture vs Future Architecture

## MVP

The MVP implementation includes:

- React 19 + Vite + MUI frontend with dashboard, projects, risks, knowledge, teams, team composer, recognition, insights, and settings views
- Node.js + Express modular backend (`routes → controller → service → repository`)
- Deterministic intelligence engines (project risk, knowledge risk, team composer, insight synthesis)
- SQLite relational store with migrations and a canonical seed dataset
- AI reasoning layer: provider registry (OpenRouter current, xAI supported), runtime toggle, grounded structured prompts, caching, dedupe, retry, deterministic fallback
- Knowledge transfer plans and backup assignment workflows
- Staffing scenarios persisted from the team composer
- Test suite (`node --test`) covering analytics engines, skill matching, LLM provider parsing, and API integration

## Future Evolution

Potential future capabilities:

- GitHub integration (contribution patterns, pull-request signals)
- Jira integration (project and ticket signals)
- Documentation ingestion (wiki freshness and coverage)
- Incident management platform integration
- Enterprise identity integration (SSO/auth)
- RAG-based knowledge retrieval
- Automated engineering signal pipelines
- PostgreSQL (Supabase) as the primary datastore
- Cloud deployment (see SYSTEM_DESIGN.md for the target architecture)

These are **extension points, not MVP requirements**. The MVP architecture is complete without them — each capability plugs into an existing seam (the signal layer, the provider registry, the storage adapter) without changing core contracts.

---

# 9. Architecture Summary

AI-EIP creates an engineering intelligence layer by combining:

```
Engineering Signals
        +
Deterministic Analysis
        +
AI-Assisted Reasoning
        =
Actionable Engineering Intelligence
```

The architecture is designed to start simple for MVP validation while providing a clear path toward an enterprise-scale engineering intelligence platform. The MVP is fully demoable offline with AI disabled, and every component is positioned to scale without a rewrite.