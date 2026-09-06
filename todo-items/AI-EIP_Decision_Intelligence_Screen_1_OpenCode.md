# AI-EIP — Decision Intelligence Screen 1

## OpenCode Implementation Specification

### Scope
Build only **Screen 1: Decision Intelligence → Decision Inbox**.

Do not implement Screen 2 (Decision Workspace) yet.

---

## 1. Product Purpose

Decision Intelligence must not duplicate the existing Risks page.

### Existing module boundaries

| Module | Question answered |
|---|---|
| Risks | What is going wrong or likely to go wrong? |
| Knowledge | Where is knowledge concentrated or fragile? |
| Teams | What is the health and capacity of teams? |
| Insights | What patterns require attention? |
| AI Composer | Who is the best staffing combination? |
| **Decision Intelligence** | **What should we do next, and what decision requires attention?** |

Core product flow:

```text
Engineering Signals
        ↓
Risk / Knowledge / Capacity Detection
        ↓
Decision Opportunity
        ↓
Decision Options
        ↓
Simulation
        ↓
AI Recommendation
        ↓
Action
```

Screen 1 represents the **Decision Opportunity / Decision Inbox**.

The user must understand within 5–10 seconds:

> These are important engineering decisions that need to be made.

---

## 2. Route and Navigation

Add a primary sidebar item:

```text
Decision Intelligence
```

Suggested route:

```text
/decision-intelligence
```

Place it after AI Composer:

```text
Overview
Projects
Risks
Knowledge
Teams
AI Composer
Decision Intelligence
Recognition
Insights
```

Reuse the existing sidebar active-state styling and icon system.

Do not redesign global navigation.

---

## 3. Design System Rules

The page must feel like a native AI-EIP module.

Reuse:

- muted dark-green top navigation
- warm/off-white background
- existing rounded cards
- subtle borders and shadows
- compact typography
- existing buttons
- existing chips and badges
- existing severity colors
- current sidebar and page spacing
- search bar, date selector, notification and avatar controls

Do not introduce:

- a new global theme
- excessive gradients
- glassmorphism
- marketing-style visuals
- oversized decorative AI elements
- a completely different card system

---

## 4. Page Header

### Title

```text
Decision Intelligence
```

### Subtitle

```text
From engineering signals to confident decisions. Explore, simulate, and take action.
```

### Primary action

```text
+ New decision
```

The action can be UI-only for now.

Use the same hierarchy and spacing as existing page headers.

---

## 5. KPI Summary

Create four KPI cards.

### Card 1

```text
DECISIONS REQUIRING ACTION
6

2 new in the last 30 days
```

### Card 2

```text
ESTIMATED VALUE
₹1.8 Cr

Across 6 decisions
```

This is estimated business/delivery value, not guaranteed revenue.

### Card 3

```text
POTENTIAL RISK REDUCTION
62%

If top recommendations are acted on
```

### Card 4

```text
AVG. AI CONFIDENCE
84%

Across all decisions
```

Reuse the visual language of existing KPI cards.

---

## 6. Intelligence Banner

Below the KPI cards, add one compact informational banner.

### Title

```text
Turn engineering signals into better outcomes
```

### Description

```text
We analyze project risks, team capacity, skills, and knowledge to surface decisions that need attention and recommend the best path forward.
```

### CTA

```text
Learn more
```

Visual requirements:

- subtle AI accent
- compact
- not visually dominant
- similar in spirit to the AI Analysis Engine on Insights

---

## 7. Decision Category Filters

Add category tabs:

```text
All decisions (6)
Staffing (2)
Risk mitigation (2)
Knowledge (1)
Priority / Scope (1)
```

Behavior:

- All selected by default
- clicking a tab filters cards without page reload
- counts come from data
- reuse existing tabs/chip styling
- accessible keyboard interaction

---

# 8. Decision Inbox

This is the main section.

Every item represents a **decision that needs to be made**, not simply a detected risk.

## Decision card structure

```text
[Decision Type Badge]                         [Severity]

Project / Context

DECISION QUESTION

Why this decision is required now

Signal 1       Signal 2       Signal 3

Potential value / impact                  [Review decision →]
```

### Visual hierarchy

Priority must be:

1. Decision question
2. Context/project
3. Why a decision is required
4. Severity
5. Supporting signals
6. Potential value
7. CTA

Do not make the risk score the dominant content.

---

## 9. Decision Card Data

Use centralized, data-driven mock data.

### Decision 1

```text
id: atlas-staffing
type: Staffing decision
category: staffing
severity: Critical

context:
Atlas Platform Migration

question:
How should we staff Atlas Platform Migration?

description:
The current delivery team is above sustainable capacity and the project has gaps in critical platform skills.

signals:
- Team capacity: 105%
- Skill coverage: 83%
- Open risks: 2

potentialValue:
₹42.3L
```

### Decision 2

```text
id: payment-backup
type: Knowledge decision
category: knowledge
severity: Critical

context:
Payment Service

question:
Who should be the backup owner for Payment Service?

description:
Critical knowledge is concentrated with a single primary engineer and no confirmed backup can independently support the service.

signals:
- Single owner: 1
- Docs coverage: 38%
- Knowledge risk: Critical

potentialValue:
₹28.7L
```

### Decision 3

```text
id: payments-delivery
type: Risk mitigation decision
category: risk_mitigation
severity: High

context:
Payments 3.0

question:
How do we reduce delivery risk for Payments 3.0?

description:
Multiple engineering signals indicate the current delivery plan may not be achievable without intervention.

signals:
- Risk score: 69
- Team capacity: 116%
- Active risks: 3

potentialValue:
₹25.4L
```

### Decision 4

```text
id: checkout-priority
type: Priority decision
category: priority_scope
severity: High

context:
Checkout Modernization

question:
Should we adjust scope or timeline?

description:
Two engineering teams are over capacity while critical dependencies are delaying delivery.

signals:
- Risk score: 58
- Delivery confidence: 61%
- Dependencies: 2

potentialValue:
₹18.1L
```

### Decision 5

```text
id: reliability-staffing
type: Staffing decision
category: staffing
severity: Medium

context:
Multi-region Reliability

question:
How should we improve system resilience?

description:
The platform requires additional reliability coverage, but available capacity and skills need to be balanced carefully.

signals:
- Team capacity: 82%
- Skill coverage: 81%
- Open risks: 1

potentialValue:
₹12.6L
```

### Decision 6

```text
id: data-lake-transfer
type: Risk mitigation decision
category: risk_mitigation
severity: Medium

context:
Data Lake Consolidation

question:
How do we reduce documentation and knowledge transfer risk?

description:
Documentation coverage remains low while a critical system dependency is concentrated with one primary owner.

signals:
- Docs coverage: 45%
- Knowledge risk: High
- Single owner: 1

potentialValue:
₹9.8L
```

---

## 10. Decision Type Styling

Use subtle category differentiation.

Categories:

- Staffing decision
- Risk mitigation decision
- Knowledge decision
- Priority / Scope decision

Use compact icon + badge styling.

Do not create large colorful category blocks.

Severity must reuse the application's existing:

- Critical
- High
- Medium

visual language.

---

## 11. Review Decision Navigation

Every card must include:

```text
Review decision →
```

Prepare navigation for the future route:

```text
/decision-intelligence/:decisionId
```

Screen 2 is not implemented now.

If the route does not yet exist, use the existing routing convention and a safe placeholder/TODO approach without building the workspace UI.

Every decision must have a stable ID.

---

## 12. Bottom Summary

Add two compact summary sections.

### A. Decision Insights

Show distribution:

```text
Staffing              2
Risk mitigation       2
Knowledge             1
Priority / Scope      1
```

Use compact bars or another lightweight visual.

Do not create a large analytics dashboard.

### B. Potential Outcomes

Show:

```text
↓ 62%
Potential risk reduction
```

```text
↑ 28%
Average capacity improvement
```

```text
₹96.4L
Estimated value
```

```text
3
Single-owner risks resolved
```

Reuse existing KPI/card patterns.

---

## 13. Data Model

Do not repeat hardcoded JSX for every card.

Use a centralized data-driven model.

Conceptual structure:

```ts
type DecisionType =
  | 'staffing'
  | 'risk_mitigation'
  | 'knowledge'
  | 'priority_scope';

type DecisionSeverity =
  | 'critical'
  | 'high'
  | 'medium';

interface DecisionSignal {
  label: string;
  value: string | number;
  tone?: 'critical' | 'high' | 'medium' | 'positive' | 'neutral';
}

interface Decision {
  id: string;
  type: DecisionType;
  severity: DecisionSeverity;
  context: string;
  question: string;
  description: string;
  signals: DecisionSignal[];
  potentialValue: string;
}
```

Adapt exact naming to existing project conventions.

---

## 14. Suggested Component Structure

Follow the current project architecture and naming conventions.

Suggested decomposition:

```text
DecisionIntelligencePage
│
├── DecisionPageHeader
├── DecisionSummaryCards
├── DecisionIntelligenceBanner
├── DecisionFilters
├── DecisionInbox
│   └── DecisionCard
└── DecisionFooterInsights
    ├── DecisionTypeDistribution
    └── PotentialOutcomes
```

Do not over-componentize trivial markup.

Before implementation, inspect existing shared components and reuse them wherever possible.

---

## 15. State Management

Screen 1 only requires minimal local state.

Required state:

```text
selectedDecisionCategory
```

Default:

```text
all
```

Filtered decisions should be derived from the source dataset.

Do not store duplicated filtered arrays unnecessarily.

---

## 16. Loading, Empty and Error States

Prepare the UI for future live APIs.

### Loading

Use existing skeleton/loading patterns if available.

Otherwise create lightweight skeletons for:

- KPI cards
- decision cards

Do not add fake loading delays.

### Empty state

```text
No decisions requiring attention

AI-EIP has not identified any decisions in this category for the selected period.
```

### Error state

```text
Unable to load decision intelligence

We couldn't retrieve the latest decision data.

[Try again]
```

---

## 17. Responsive Requirements

### Desktop

Primary target is the current AI-EIP desktop layout:

- sidebar visible
- KPI cards aligned cleanly
- full-width decision inbox
- compact card density

### Tablet

- KPI cards wrap naturally
- signal metadata wraps cleanly
- CTA remains accessible

### Mobile

Follow the application's existing responsive behavior.

At minimum:

- navigation follows current mobile behavior
- KPI cards stack
- decision cards remain readable
- signals wrap without horizontal scrolling
- CTA remains easily accessible

---

## 18. Accessibility

Ensure:

- semantic buttons
- keyboard accessible filters
- keyboard accessible Review Decision actions
- visible focus states
- severity is not communicated only through color
- icon-only controls have labels
- sufficient contrast
- logical heading hierarchy

---

# 19. Do Not Build Yet

Explicitly out of scope:

- Decision Workspace UI
- decision options
- simulations
- what-if sliders
- comparison tables
- AI recommendation details
- action plans
- approval workflows
- AI chat panel
- Jira/GitHub integrations
- real backend APIs
- database changes unless routing architecture requires them

Screen 1 is the **Decision Inbox**.

Screen 2 will be the **Decision Workspace**.

---

# 20. Definition of Done

- [ ] Decision Intelligence added to sidebar
- [ ] `/decision-intelligence` route works
- [ ] Header matches existing AI-EIP pages
- [ ] Four KPI cards implemented
- [ ] Intelligence banner implemented
- [ ] Category filters work
- [ ] Six data-driven decision cards implemented
- [ ] Decision question is visually dominant
- [ ] Severity styling matches existing AI-EIP
- [ ] Supporting engineering signals displayed
- [ ] Potential value/impact displayed
- [ ] Review Decision is prepared for Screen 2 routing
- [ ] Bottom summary implemented
- [ ] Loading state prepared
- [ ] Empty state implemented
- [ ] Error state implemented
- [ ] Responsive behavior works
- [ ] Accessibility basics covered
- [ ] No Screen 2 workspace functionality added

---

# Final Implementation Guidance

Before changing code:

1. Inspect the current AI-EIP architecture.
2. Reuse existing shared layout, cards, buttons, badges, tabs and navigation.
3. Add only the minimum new components required.
4. Keep mock decision data centralized and data-driven.
5. Do not refactor unrelated modules.
6. Do not redesign the global UI system.
7. Preserve consistency with the existing Teams, Knowledge, AI Composer, Recognition and Insights screens.

The final product message must be clear:

> **AI-EIP detects engineering problems. Decision Intelligence helps leaders decide what to do next.**
