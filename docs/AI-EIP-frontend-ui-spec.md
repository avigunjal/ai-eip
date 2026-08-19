# AI-EIP Frontend UI Specification

## Purpose

Build a high-fidelity, responsive **AI Engineering Intelligence Platform (AI-EIP)** mock application. It helps engineering leaders see and prevent delivery risk, reduce knowledge dependency, plan teams, and recognize meaningful engineering impact.

Use the supplied Aurora dashboard screenshot as the visual reference: bright canvas, compact left rail, generous whitespace, thin neutral borders, rounded white cards, restrained blue/teal accents, clear typography, and information-dense but calm dashboards. This is an **enterprise SaaS product**, not a consumer app or a flashy “AI” interface.

The UI is mock-data driven. Build all main routes and realistic empty/loading/error states; no backend or authentication integration is required.

## Product framing

### Primary users

- **VP/Head of Engineering:** portfolio health, intervention priorities, organizational risk.
- **Engineering manager:** team delivery risk, staffing choices, contributor development.
- **Tech lead/project lead:** project risk drivers, knowledge gaps, concrete prevention actions.
- **Individual contributor:** impact timeline and recognition profile (view-only in MVP).

### MVP capability pillars

1. **Project Risk & Prevention** — surface delivery risk early, explain why, and track prevention actions.
2. **Knowledge Dependency** — expose critical systems and projects with single-person or fragile expertise.
3. **Team Composition & Staffing** — compare capacity, capability coverage, and allocation options.
4. **Engineering Recognition & Impact** — make high-quality, often invisible contributions visible and reviewable.

### Tone and language

Use precise, neutral, action-oriented labels. Prefer “Needs attention,” “Knowledge coverage,” and “Suggested action” over alarmist or vague language. AI insight copy must indicate confidence and evidence, never claim certainty.

## Information architecture and routes

| Section | Route | Intent |
|---|---|---|
| Overview | `/` | Executive engineering-health overview and priority queue. |
| Projects | `/projects` | Project portfolio, filters, and risk comparison. |
| Project detail | `/projects/:projectId` | Risk, delivery health, owners, dependencies, and actions. |
| Risks | `/risks` | Cross-project risk register and prevention workflow. |
| Knowledge | `/knowledge` | Knowledge concentration map and critical-system coverage. |
| Knowledge detail | `/knowledge/:systemId` | System expertise, gaps, documentation, and mitigation. |
| Teams | `/teams` | Team health, capacity, composition, and staffing needs. |
| Team detail | `/teams/:teamId` | Allocation, skills coverage, delivery commitments, members. |
| Recognition | `/recognition` | Impact feed, recognition highlights, and contribution analytics. |
| Person profile | `/people/:personId` | Individual impact, expertise, recognition, and workload context. |
| Insights | `/insights` | AI-generated evidence-backed observations; saved/dismissed states. |
| Settings | `/settings` | Data sources, scoring preferences, notifications, workspace members. |

### Navigation model

Left sidebar (persistent desktop):

```text
AI-EIP  [spark/compass mark]

Overview
Projects
Risks                         [3]
Knowledge
Teams
Recognition

──────── Engineering ────────
Insights                     [5]

──────── Workspace ─────────
Settings
```

- Highlight the active destination with a pale blue/teal filled row and a 3px left indicator.
- Count badges appear only for actionable, non-zero items.
- Sidebar footer: workspace switcher (“Northstar Engineering”), help icon, and user avatar/menu.
- Top bar: breadcrumb/title on the left; centered/expanding global search; date range; notifications; avatar on the right.

## App shell and shared behavior

### Desktop shell

- Viewport background: very light cool gray (`#F7F9FC` or equivalent).
- Fixed 248px sidebar; top bar height 72px; content max-width 1440px with 28–32px outer padding.
- Main content scrolls independently. Keep global controls visually stable.
- Every data page uses: `page heading + supporting sentence + contextual controls`, then summary KPIs, then primary analysis, then supporting detail.

### Global controls

- **Date range:** Last 30 days default; options 7/30/90 days and custom. Use it on trend/impact metrics.
- **Global search:** projects, systems, teams, people; keyboard shortcut `⌘/Ctrl + K` opens a command palette.
- **Notifications:** display action assignment, material risk change, review request. Provide unread state.
- **Filters:** shown in a compact horizontal toolbar; active filters render as removable chips; include “Clear all.”
- **Drill-down:** metric cards, chart marks, table rows, and entity chips navigate to contextually relevant details.

## Aurora-inspired design system

### Visual principles

- Light, airy, quiet: white surfaces and neutral structure dominate; color communicates status or selection only.
- One strong focal visualization per page; do not create a wall of equally weighted cards.
- Use rounded corners and soft elevation sparingly. Cards primarily rely on a 1px border.
- Avoid gradients except a very subtle decorative Aurora wash in the app mark or empty states. No neon, glassmorphism, excessive shadows, animated charts, or dark dashboard background.

### Tokens

| Token | Value / use |
|---|---|
| `--canvas` | `#F7F9FC` page background |
| `--surface` | `#FFFFFF` cards, menus, modals |
| `--surface-subtle` | `#F1F5F9` selected/filter/background bands |
| `--border` | `#E3E8EF` card/table separators |
| `--text` | `#172033` headings/body emphasis |
| `--text-muted` | `#687386` metadata, helper text |
| `--primary` | `#2563EB` links, selected state, primary actions |
| `--teal` | `#0F9F8A` healthy/positive trend |
| `--amber` | `#D88A12` attention/medium risk |
| `--red` | `#D14343` high/critical risk |
| `--violet` | `#7C5CE0` knowledge/AI secondary series |
| `--radius-card` | `14px` |
| `--radius-control` | `8px` |
| `--shadow-float` | `0 8px 24px rgba(23, 32, 51, .08)` for menus/modals only |

### Typography and spacing

- Use **Inter** (fallback: ui-sans-serif/system). Weight 600–700 for titles, 500–600 for labels, 400–500 for body.
- Page title 28px/36px; section title 18px/26px; body 14px/21px; table/meta 13px/18px; KPI number 30–36px/40px.
- Base spacing unit: 4px. Common gaps: 8, 12, 16, 24, 32px.
- Cards: 20–24px padding on desktop; 16px on mobile.

### Components

| Component | Specification |
|---|---|
| `Button` | Primary solid blue; secondary white with border; ghost neutral; destructive red only in confirm flows. 36px standard height. |
| `StatusBadge` | Compact pill with icon + label. Critical/High/Medium/Low/Healthy/Monitoring. Never color-only. |
| `MetricCard` | Label, metric, delta, contextual comparison; optional small 7-point sparkline. Click only if it drills down. |
| `InsightCard` | Accent icon, concise finding, confidence, evidence count, timestamp, action links. |
| `DataTable` | Sticky header, row hover, sortable headings, pagination, optional selection. Use responsive cards on phones. |
| `AvatarGroup` | Up to 4 avatars, then `+N`; always provide names in tooltip/accessibility label. |
| `EntityChip` | Small linked project/system/team/person tag with optional icon. |
| `ProgressBar` | 6px track for capacity/coverage; paired with explicit percentage and textual state. |
| `EmptyState` | Restrained icon/illustration, clear explanation, single next action. |
| `EvidenceDrawer` | Right-side drawer for a risk/insight: score, signals, source links, confidence, and recommended actions. |

## Page specifications

### 1. Overview (`/`)

**Goal:** answer “What needs engineering leadership attention today?” within 15 seconds.

1. Header: “Engineering overview” and “A clear view of delivery health, expertise, and impact.” Date selector + “Export snapshot.”
2. Five metric cards:
   - Engineering Health: `78 / 100`, `+4 pts vs previous 30 days`.
   - Projects at risk: `3`, `2 require action this week`.
   - Knowledge concentration: `High`, `7 critical single-owner areas`.
   - Team capacity: `82%`, `4 teams above sustainable load`.
   - Recognized impact: `+14%`, `vs prior period`.
3. Main two-column grid (8/4):
   - **Project health trend:** 12-week line/area chart (health score, 0–100). Hover returns week, score, delta, notable event.
   - **Risk overview:** stacked horizontal bars by severity and category (Schedule, Dependency, Knowledge, Capacity, Quality).
4. Bottom grid (7/5):
   - **Projects needing attention** table: project, health, trend, top driver, owner avatars, next review; sort by risk.
   - **AI insights** feed: three concise evidence-backed insight cards.
5. Full-width **Knowledge concentration** card: ranked systems with coverage meter, owner count, and risk badge.

### 2. Projects (`/projects`)

Portfolio-first operational view. Header actions: “Create project” (mock modal) and “Configure views.” Filters: team, status, risk, owner, timeframe; search by project.

- KPI strip: Active projects, At risk, On track, Avg. health score.
- Primary table: Project; status; health score with mini ring/progress; risk level; trend sparkline; team; delivery date; top driver; last updated.
- Supporting “Health by team” grouped horizontal bar chart and “Delivery confidence” distribution (donut + legend).
- Clicking a row opens project detail; clicking a severity badge filters risk register.

### 3. Project detail (`/projects/:projectId`)

Example: **Atlas Platform Migration**. Breadcrumbs, status badge, owner avatars, target date, “Watch project” and overflow menu.

- Header KPI row: Health `62`; delivery confidence `68%`; open risks `4`; knowledge coverage `54%`.
- Tabs: **Overview**, Risks, Dependencies, Team, Activity.
- Overview layout:
  - Delivery health trend with annotated risk events.
  - “Risk drivers” ranked list (e.g., API contract pending, single SME for auth service, 2 engineers over capacity), each with signal count and “View evidence.”
  - Milestone timeline: planned vs forecast dates, colored only where status differs.
  - Prevention action checklist: owner, due date, status, impact expected. CTA “Add action.”
  - Project team allocation and system dependencies.

### 4. Risks (`/risks`)

Risk register with a management workflow.

- Summary: Critical `2`, High `3`, Rising this week `4`, Actions overdue `2`.
- Filter toolbar: severity, category, project, team, owner, state (Open/Monitoring/Mitigated), created date.
- Table: severity; risk title; project; category; confidence; trend; owner; prevention status; last signal. Use red/amber only for severity marker/badge.
- Row click opens `EvidenceDrawer` showing:
  - Plain-English finding and `Confidence: 87%`.
  - Score decomposition: probability × impact.
  - Signal timeline (e.g., delayed PRs, blocked tickets, declining review coverage).
  - Source evidence links (mock Jira/GitHub/document entries).
  - Recommended actions (accept, assign, mark monitoring, dismiss) and audit note.

### 5. Knowledge (`/knowledge`)

**Goal:** reveal where project and system knowledge is too concentrated.

- KPI cards: Critical knowledge areas, single-owner systems, documentation freshness, coverage trend.
- Main visual: **Knowledge concentration matrix**. Rows = systems/domains; columns = expertise holders; cell intensity = proficiency/recency. Add a legend and text alternative table. Sort to put high-criticality, low-coverage areas first.
- Right-side **Critical systems** ranked card: system, business criticality, active experts, coverage score, trend.
- Secondary **Coverage vs criticality** quadrant scatter plot: each dot is a system; x = criticality, y = coverage; upper/lower labels; select a dot to open detail.
- “Knowledge transfer opportunities” list: suggested pairing, expected coverage gain, effort, and action CTA.

### 6. Knowledge detail (`/knowledge/:systemId`)

Example: **Identity & Access Service**. Header displays `Critical`, coverage `38%`, documentation freshness `47 days`, and linked projects.

- Expertise map: named people grouped as Primary / Capable / Learning; show availability, last contribution, and confidence.
- Dependency graph (small, contained): selected system in center, adjacent projects/services; include a list alternative and a “Focus mode” toggle.
- Documentation inventory: source, owner, last updated, completeness, status.
- Mitigation plan: pairings, docs to create, shadowing sessions, target coverage. Add mock “Start transfer plan” modal.

### 7. Teams (`/teams`)

**Goal:** show whether teams can deliver their commitments sustainably and have the right mix of skills.

- Team cards or table: team name, health, active projects, capacity, skills at risk, manager, trend.
- Primary visualization: **Capacity versus demand** grouped horizontal bars by team (available capacity, committed load, unplanned load), with a 85% sustainable-capacity marker.
- Secondary visualization: **Capability coverage heatmap**: critical capability/domain rows × team columns; accessible numeric labels in cells.
- Staffing recommendations cards: proposed action, rationale, expected trade-off, confidence, and “Compare scenarios.”

### 8. Team detail (`/teams/:teamId`)

Example: **Platform Engineering**. Header with manager, member count, health, capacity, and active projects.

- Tabs: Overview, Capacity, Skills, Projects, Members.
- Capacity tab: weekly stacked allocation bars (Roadmap / Operational / Unplanned) against target; workload table by member. Avoid presenting individual workload as performance ranking.
- Skills tab: team capability heatmap and gap list linked to systems/projects.
- Projects tab: project cards with allocation, delivery confidence, risk.
- Members tab: avatar/name/role, current allocation, domains, recent impact—not employee scoring.

### 9. Recognition (`/recognition`)

**Goal:** make impact visible, contextual, and equitable.

- KPI strip: Impact signals captured, cross-team contributions, recognition sent, review coverage.
- “Impact highlights” feed with card anatomy: contributor, type (Reliability / Mentorship / Delivery / Knowledge sharing), concise evidence summary, linked project/system, peers involved, date, “Recognize” button.
- **Impact composition** stacked bars over time by contribution type (not an individual leaderboard).
- **Contribution network** is optional for desktop mock only: compact node-link visualization of cross-team collaboration; must have a list/table alternative.
- Recognition composer modal: recipient(s), value/type, specific evidence, optional public/private toggle, send. Seed with evidence but require human confirmation.

### 10. Person profile (`/people/:personId`)

View-only narrative profile; never use a single opaque “employee score.”

- Header: name, role, team, expertise chips, current allocation range; “Send recognition.”
- Tabs: Impact, Expertise, Collaborations, Recognition.
- Impact timeline: attributed contribution events with linked evidence.
- Expertise: systems and proficiency/recency; show consent/context note.
- Work context: active commitments and availability indication, not surveillance metrics.

### 11. Insights (`/insights`)

Cards grouped by **Needs review**, **Saved**, and **Dismissed**. Each includes finding, confidence, evidence count, affected entities, generated timestamp, owner/status, and actions: investigate, save, dismiss. Include “Why am I seeing this?” disclosure describing source signals and scoring limits.

### 12. Settings (`/settings`)

Tabbed settings UI: Data sources, Score configuration, Notifications, Workspace. Show connected integrations as mock cards (GitHub, Jira, Slack, Confluence), sync state, last sync, and “Manage” actions. Do not ask for real credentials.

## Engineering visualizations

| Visualization | Where | Data | Interaction / interpretation |
|---|---|---|---|
| Health trend | Overview, project | date, health score, event annotations | Hover/keyboard focus reveals values; click an event filters related risks. |
| Severity/category stacked bars | Overview, Risks | count by severity/category | Legend toggles a category; click drills into filtered register. |
| Risk driver ranking | Project detail | driver, impact, signal count, trend | Open evidence drawer; never imply causal certainty. |
| Milestone forecast timeline | Project detail | planned/forecast/completion dates | Compare dates; show explicit legend and textual milestones. |
| Knowledge matrix | Knowledge | system, person, proficiency, recency, criticality | Select row/cell; provide sortable table alternative. |
| Coverage/criticality quadrant | Knowledge | coverage, criticality, system | Select system; labels explain priority zone. |
| Capacity vs demand bars | Teams | planned, unplanned, available capacity | Compare to sustainable marker; tooltip includes raw hours/FTE. |
| Capability heatmap | Teams | team, capability, coverage | Cell label includes coverage %; filter by risk. |
| Allocation bars | Team detail | week, roadmap, operational, unplanned | Hover/focus for values, compare to target. |
| Impact composition | Recognition | date, contribution type, evidence count | Filter contribution type/team; no rank ordering people. |

Use an accessible chart library such as Recharts, Nivo, Visx, or Chart.js. Charts need a visible legend, text tooltip, non-color encodings (labels/patterns where necessary), and a “View data table” control.

## Mock data contract

Create deterministic local fixtures (TypeScript preferred) and derive charts from them. Keep names realistic but fictional. Every record should have stable IDs and timestamps in the selected period.

```ts
type Severity = 'critical' | 'high' | 'medium' | 'low';
type Project = {
  id: string; name: string; status: 'on_track' | 'at_risk' | 'paused' | 'complete';
  healthScore: number; healthDelta: number; deliveryConfidence: number;
  targetDate: string; teamIds: string[]; ownerIds: string[];
  topDriver: string; trend: { date: string; score: number }[];
};
type Risk = {
  id: string; title: string; projectId: string; severity: Severity;
  category: 'schedule' | 'dependency' | 'knowledge' | 'capacity' | 'quality';
  confidence: number; probability: number; impact: number; trend: 'rising' | 'stable' | 'improving';
  status: 'open' | 'monitoring' | 'mitigated'; ownerId: string; lastSignalAt: string;
  signals: { id: string; label: string; source: string; occurredAt: string; url?: string }[];
};
type KnowledgeArea = {
  id: string; name: string; criticality: number; coverage: number;
  documentationFreshnessDays: number; expertIds: string[]; linkedProjectIds: string[];
};
type Team = { id: string; name: string; managerId: string; capacityPct: number; healthScore: number; memberIds: string[]; };
type Person = { id: string; name: string; initials: string; role: string; teamId: string; avatarColor: string; expertise: { knowledgeAreaId: string; level: 'primary' | 'capable' | 'learning'; lastContributionAt: string }[]; };
type Recognition = { id: string; personId: string; type: 'reliability' | 'mentorship' | 'delivery' | 'knowledge_sharing'; summary: string; evidenceIds: string[]; occurredAt: string; visibility: 'public' | 'private'; };
```

Minimum seeded fixture size: 10 projects, 9 teams, 28 people, 16 knowledge areas, 18 risks, 30 recognition/impact events, 12 weekly data points. Include varied states: at least 2 critical, 3 high, 3 single-owner systems, 2 overloaded teams, an empty filtered result, and an error state.

## Interaction and state requirements

- Use URL query parameters for filters, sort, search, date range, selected chart segment, and table page where practical.
- Tables support sort, filter, pagination, row click, and a keyboard-operable overflow menu. Filters update mock results immediately.
- Chart tooltip/focus state includes labels, values, comparison, and link if drill-down exists.
- “Dismiss insight,” “assign action,” “watch project,” and “send recognition” should update local client state with an undo toast.
- Forms have validation, disabled submit until valid, success confirmation, and cancel behavior.
- Include skeleton cards/tables while simulated data is loading; inline retry panels for an error; intentional empty states for zero results and no insights.
- Use confirmation dialogs only for meaningful or hard-to-reverse mock actions (e.g., discard a drafted recognition note).

## Responsive behavior

| Breakpoint | Layout |
|---|---|
| Desktop ≥1280px | Full sidebar, 12-column content grid; 8/4 and 7/5 dashboard splits. |
| Tablet 768–1279px | Collapsible icon sidebar; 2-column cards; tables horizontally scroll only as a last resort. |
| Mobile <768px | Top bar + drawer navigation; one-column content; filters open in a bottom sheet; KPI cards horizontally scroll or stack; charts retain minimum readable height. |

- Preserve page title and highest-priority alert at the top on mobile.
- Convert complex tables to labeled record cards below 640px; never hide critical state/owner/next action.
- Side drawers become full-screen sheets on mobile; modal actions are reachable without hover.

## Accessibility and trust requirements

- Meet WCAG 2.2 AA contrast; minimum 44×44px touch targets; visible focus rings; logical tab order; skip-to-content link.
- Semantic landmarks: `aside`, `header`, `nav`, `main`; native buttons/inputs wherever possible.
- Never use color as the only severity, trend, or chart encoding. Add text label/icon/pattern and accessible chart data tables.
- Every icon-only button has an accessible name; avatars have meaningful text alternatives; tooltips are keyboard available.
- Respect reduced-motion preference; keep motion subtle (150–200ms opacity/transform), no autoplaying visualizations.
- Avoid exposing sensitive individual performance judgments. Show evidence, provenance, confidence, and “last updated” for AI-derived content. Recognition must require human review before sending.

## Implementation guidance

- Recommended stack: React + TypeScript + Tailwind CSS (or equivalent token-based CSS), React Router, Lucide icons, a chart library, and local fixture/data hooks.
- Create reusable primitives before page composition: `AppShell`, `PageHeader`, `MetricCard`, `StatusBadge`, `FilterBar`, `DataTable`, `ChartCard`, `InsightCard`, `EvidenceDrawer`, `EmptyState`, `LoadingState`, `ErrorState`, and `AvatarGroup`.
- Keep feature folders aligned to routes and store mock fixtures separately from presentational components. Use typed selectors to derive filtered aggregate data.
- Centralize all colors, radii, type scale, spacing, risk labels, and chart palette in theme tokens. Do not hard-code status colors inside pages.
- Provide seed data, not placeholder “Lorem ipsum.” Avoid dependencies on an API; include a small simulated loading delay only if it does not impede review.
- Build desktop first, then verify 1280px, 1024px, 768px, 390px widths. Avoid horizontal page overflow.
- Aim for polished visual hierarchy over feature completeness. A working route tree with connected local drill-downs is more valuable than disconnected static screenshots.

## Acceptance checklist

- [ ] Aurora-inspired shell is light, restrained, spacious, and consistent.
- [ ] All routes above render with realistic fixtures and coherent navigation.
- [ ] Overview makes the four MVP pillars visible without scrolling excessively.
- [ ] Risks include evidence, confidence, and an actionable prevention workflow.
- [ ] Knowledge and staffing use interpretable, accessible engineering-specific charts.
- [ ] Recognition emphasizes evidence and contribution context, not a leaderboard.
- [ ] Loading, empty, error, hover/focus, and mobile states are designed.
- [ ] Charts have legends, accessible text/data alternatives, and drill-down behavior.
- [ ] Controls are keyboard-accessible and visual status is never color-only.
