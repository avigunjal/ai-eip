# AI-EIP — Engineering Overview Dashboard
## Final UI & Product Direction — Implementation Specification

**Status:** FINAL — Freeze visual architecture after implementation  
**Screen:** Engineering Overview  
**Goal:** Transform the dashboard from a traditional engineering reporting dashboard into the entry point of the AI-EIP intelligence-to-decision experience.

---

# 1. PRODUCT PRINCIPLE

This dashboard must communicate one clear product story:

> **AI-EIP understands the engineering organization, detects connected risks, analyzes evidence, and helps leaders make better decisions.**

The dashboard is NOT just a collection of KPIs.

It must establish this flow:

```text
UNDERSTAND
Engineering organization health
        ↓
CONNECT
Projects · Teams · People · Skills · Systems · Risks
        ↓
DETECT
AI identifies meaningful engineering risks
        ↓
EXPLAIN
Evidence and confidence behind the insight
        ↓
DECIDE
Decision Intelligence helps determine the best action
        ↓
ACT
Human records the decision
```

The Engineering Overview is therefore the **starting point of the intelligence journey**.

---

# 2. FINAL PAGE ARCHITECTURE

The page order must be:

```text
01. Page Header
02. Executive Engineering Signals
03. Engineering Intelligence Map
04. AI Analysis Engine
05. AI Prioritized Insights
06. View All Insights
07. AI Prioritized Projects
```

Do not add additional major dashboard sections.

The dashboard should remain focused and executive-friendly.

---

# 3. PAGE HEADER

## Title

```text
Engineering overview
```

## Subtitle

```text
A connected view of engineering health, expertise, risk, and impact.
```

Alternative wording is NOT required.

Use the exact copy above.

### Purpose

The subtitle should immediately communicate that this is more than a project dashboard.

It represents a connected intelligence layer across engineering.

---

# 4. EXECUTIVE ENGINEERING SIGNALS

Display five cards in one responsive row.

## Card 1 — Engineering Health

```text
ENGINEERING HEALTH

67

↑ 0%
```

Purpose:

Overall engineering health score.

---

## Card 2 — Projects Requiring Attention

Replace generic wording where appropriate.

```text
PROJECTS REQUIRING ATTENTION

4

require attention this week
```

This is more actionable than simply saying "Projects at Risk".

---

## Card 3 — Knowledge Concentration

```text
KNOWLEDGE CONCENTRATION

1

critical knowledge risk

Payment Service
```

### Interaction

The `Payment Service` chip/card must be actionable.

Clicking it should navigate to or open the related decision context.

Target:

```text
/decision-intelligence/payment-backup
```

or use the existing route architecture if different.

This is one of the most important transitions in the product.

The dashboard should naturally lead into Decision Intelligence.

---

## Card 4 — Team Capacity

```text
TEAM CAPACITY

116%

highest team pressure
```

---

## Card 5 — Recognized Impact

```text
RECOGNIZED IMPACT

+14%

↑ 14%
```

---

# 5. KPI CARD DESIGN

Maintain the existing AI-EIP visual language.

## Requirements

- Clean enterprise cards
- Soft neutral background
- Subtle border
- Border radius consistent with existing design system
- Minimal shadows
- Small uppercase label
- Large primary metric
- Supporting context below
- Semantic icon in upper-right

Do NOT:

- Add gradients
- Add oversized icons
- Add excessive colors
- Make cards look like consumer analytics widgets
- Add unnecessary charts inside KPI cards

The dashboard should feel:

```text
Enterprise
Calm
Intelligent
Trustworthy
Premium
```

---

# 6. ENGINEERING INTELLIGENCE MAP

Rename the existing relationship visualization conceptually to:

```text
Engineering intelligence map
```

Subtitle:

```text
How critical engineering entities connect — from projects to people, systems, expertise, and risk.
```

The visualization is a core differentiator of AI-EIP.

It must communicate that AI-EIP understands **relationships**, not isolated metrics.

---

# 7. INTELLIGENCE MAP DATA MODEL

The visible relationship flow should communicate:

```text
PROJECT
Billing Upgrade
      │
      ├─────────────── Ownership ───────────────┐
      ↓                                         ↓
ENGINEERING TEAM                            ENGINEER
Payments Engineering                        Olivia Williams
      │                                         │
      │                                         │
      ├────────────── Expertise ────────────────┤
      ↓                                         ↓
SKILLS                                    KNOWLEDGE
Node.js · REST API · JavaScript          Critical domain knowledge
      │
      ↓
SYSTEMS
Billing Engine
Storage Layer
      │
      │ Exposure
      ↓
RISK
API gateway rate-limit misconfiguration
```

The exact visual graph layout can remain close to the existing implementation.

However, the hierarchy and relationship meaning must be clearer.

---

# 8. INTELLIGENCE MAP DESIGN RULES

Each entity card should have:

```text
[semantic icon] ENTITY TYPE

Entity Name

Optional supporting information
```

Examples:

### Project

```text
PROJECT

Billing Upgrade

Critical
Owner · Olivia Williams
Design
```

### Team

```text
ENGINEERING TEAM

Payments Engineering
Backend Engineering
+1 more
```

### Engineer

```text
ENGINEER

OW  Olivia Williams
```

### Skills

```text
SKILLS

Node.js · REST API · JavaScript
```

### Systems

```text
SYSTEMS

Billing Engine
Storage Layer
```

### Risk

```text
RISK

API gateway rate-limit misconfiguration
```

---

# 9. RELATIONSHIP EDGES

Relationship edges must have meaning.

Use small labels such as:

```text
94 Ownership
88 Membership
79 Expertise
84 Mapped
72 Exposure
```

Risk connections should remain visually distinct.

For example:

```text
normal relationships
→ subtle neutral line

risk relationship
→ subtle dashed warning line
```

Do not make the graph visually noisy.

The user should understand the story within approximately 5 seconds.

---

# 10. AI ANALYSIS ENGINE

Immediately below the intelligence map, add the AI Analysis Engine.

This section establishes:

> **Where the intelligence comes from.**

## Layout

Use a two-column layout on desktop:

```text
┌──────────────────────┐  ┌───────────────────────────────────────────┐
│ Engineering Health   │  │ ✦ AI Analysis Engine                 Live │
│ Trend                │  │                                           │
│                      │  │ Analyzing 21 engineering signals...       │
│ [12 week chart]      │  │                                           │
│                      │  │ ✓ Incidents · 10                         │
│                      │  │ ✓ GitHub · 2                             │
│                      │  │ ✓ Jira · 1                               │
│                      │  │ ✓ Docs · 1                               │
│                      │  │                                           │
│                      │  │ Last updated just now                    │
└──────────────────────┘  └───────────────────────────────────────────┘
```

---

# 11. ENGINEERING HEALTH TREND

Keep the existing trend chart but ensure it remains visually secondary.

Title:

```text
Engineering health trend
```

Subtitle:

```text
Average project health, last 12 weeks
```

Requirements:

- Minimal line chart
- No excessive gridlines
- No unnecessary interactions
- Neutral visual styling
- Supports the AI insight section rather than competing with it

---

# 12. AI ANALYSIS ENGINE CARD

## Title

```text
✦ AI Analysis Engine
```

## Status

```text
● Live
```

Use subtle green/teal semantic status styling.

## Primary copy

```text
Analyzing 21 engineering signals...
```

## Sources

```text
✓ Incidents · 10
✓ GitHub · 2
✓ Jira · 1
✓ Docs · 1
```

## Footer

```text
Last updated just now
```

---

# 13. AI PRIORITIZED INSIGHTS

This is the most important dashboard section after the Intelligence Map.

The purpose is to answer:

> **What requires leadership attention right now?**

Use the existing insight card structure, but strengthen the hierarchy.

---

## Insight Card Structure

```text
✦ AI INSIGHT

[Primary insight statement]

[Supporting explanation]

SEVERITY                              AI CONFIDENCE

██████████████████████░░░             87%

Evidence · 3 sources

────────────────────────────────────────────

✦ Why this matters                 [⌃ / ⌄]

[Engineering signals]     ✦ Explain with AI
```

---

# 14. INSIGHT EXAMPLE — PAYMENT SERVICE

Use this as the strongest insight.

## Primary insight

```text
Payment Service has critical knowledge concentration risk.
```

## Supporting explanation

```text
Critical knowledge is concentrated with one primary engineer and no confirmed backup can independently support the service.
```

## Severity

```text
CRITICAL
```

## Confidence

```text
87%
```

## Evidence

```text
Evidence · 3 sources
```

---

# 15. WHY THIS MATTERS

Expandable evidence content.

Example:

```text
WHY THIS MATTERS

• Documentation coverage is below the required threshold.
• Critical knowledge is concentrated with a single primary owner.
• No confirmed backup can independently support the service.
• An unplanned absence creates production recovery risk.
```

The content should be evidence-based.

Avoid generic AI language.

---

# 16. EXPLAIN WITH AI

Keep:

```text
✦ Explain with AI
```

This should visually indicate a deeper explanation capability.

Do NOT create a separate chatbot experience in this implementation.

The existing interaction/provider abstraction should remain unchanged.

---

# 17. ENGINEERING SIGNALS ACTION

Keep:

```text
✓ Engineering signals
```

This indicates that the insight is grounded in recorded engineering data.

This distinction is important.

AI-EIP should visually communicate:

```text
AI recommendation
≠
ungrounded AI output
```

The product must feel evidence-driven.

---

# 18. VIEW ALL INSIGHTS

Place a centered secondary action after the visible insight cards.

```text
View all 8 insights
```

Style:

- Secondary button
- Neutral
- No primary emphasis

This creates a clean transition into the project prioritization table.

---

# 19. AI PRIORITIZED PROJECTS

Use the title:

```text
AI prioritized projects
```

Subtitle:

```text
Ranked by engineering health risk
```

---

# 20. PROJECT TABLE

Columns:

```text
PROJECT
STATUS
HEALTH
CONFIDENCE
TARGET
DRIVER
```

Example rows:

```text
Billing Upgrade
Paused
30
35
18 Oct
API gateway rate-limit misconfiguration
```

```text
Atlas Platform Migration
At risk
54
52
30 Sep
Feature-flag rollout lacks rollback plan
```

```text
Payments 3.0
At risk
56
60
8 Sep
API contract for payments not yet finalized
```

```text
Checkout Modernization
At risk
58
61
30 Aug
Two engineers exceed sustainable capacity
```

```text
Multi-region Reliability
At risk
60
64
18 Sep
Notification service has no on-call backup
```

---

# 21. TABLE PRIORITIZATION

Projects should appear based on intelligence priority.

The table should communicate:

```text
Most important engineering attention
↓
Less urgent attention
```

Do not present this as a generic project list.

The purpose is prioritization.

---

# 22. DASHBOARD → DECISION INTELLIGENCE CONNECTION

This is a critical requirement.

The dashboard must contain a clear transition into Decision Intelligence.

The strongest path is:

```text
Engineering Overview
        ↓
Knowledge Concentration
        ↓
Payment Service
        ↓
Critical AI Insight
        ↓
Decision Intelligence
```

The Payment Service should be consistently represented across these screens.

---

# 23. PRODUCT NARRATIVE CONSISTENCY

The dashboard and Decision Workspace must feel like parts of one system.

The user journey is:

```text
AI-EIP ENGINEERING OVERVIEW

"I can see what is happening."
        ↓

ENGINEERING INTELLIGENCE MAP

"I understand what is connected."
        ↓

AI INSIGHT

"I know what requires attention."
        ↓

DECISION INTELLIGENCE

"I understand my options."
        ↓

AI RECOMMENDATION

"I have evidence for the recommended path."
        ↓

HUMAN DECISION

"I choose the action."
        ↓

DECISION RECORDED

"The organization has accountability."
```

This narrative is the final product positioning.

---

# 24. VISUAL HIERARCHY

The page should follow this hierarchy:

## Level 1

```text
Engineering overview
```

## Level 2

```text
Executive engineering signals
```

## Level 3

```text
Engineering intelligence map
```

## Level 4

```text
AI Analysis Engine
```

## Level 5

```text
AI prioritized insights
```

## Level 6

```text
AI prioritized projects
```

Do not give every card equal visual importance.

The Intelligence Map and AI Insights should receive more visual attention than generic metrics.

---

# 25. COLOR SYSTEM

Continue using the existing AI-EIP design tokens.

Semantic meaning should remain consistent.

## Critical / Risk

Muted red.

Use for:

- Critical risks
- High severity
- Exposure

## Warning

Muted amber.

Use for:

- Projects requiring attention
- At-risk states

## Healthy / Positive

Muted teal or green.

Use for:

- Positive outcomes
- Confirmed signals
- Improvements
- Live status

## AI

Use the existing subtle AI accent.

Do NOT introduce bright purple gradients or flashy generative-AI styling.

AI-EIP is an enterprise intelligence product.

---

# 26. TYPOGRAPHY

Maintain existing typography.

Hierarchy:

```text
Page title
Large / strong

Section heading
Medium / strong

Card metric
Large / strong

Insight headline
Medium / strong

Supporting copy
Normal / muted

Metadata
Small / muted

Labels
Small uppercase / letter spacing
```

Avoid excessive bold text.

---

# 27. SPACING

Use consistent vertical rhythm.

Recommended structure:

```text
Page header
↓ 24–32px

Executive signals
↓ 24px

Engineering intelligence map
↓ 24px

AI analysis section
↓ 16–24px

AI insights
↓ 24px

View all insights
↓ 24px

Prioritized projects
```

Do not compress the page excessively.

The dashboard should feel calm and premium.

---

# 28. INTERACTION REQUIREMENTS

## Knowledge Concentration → Payment Service

Actionable.

Must lead toward the related Decision Intelligence context.

---

## Intelligence Map Entities

Interactive only if functionality already exists.

Do not add fake interactions.

If clickable:

- subtle hover state
- cursor pointer
- no dramatic animation

---

## AI Insights

Support:

- Expand/collapse "Why this matters"
- Engineering signals context
- Explain with AI

---

## Project Rows

Use existing navigation behavior.

If no behavior exists, do not introduce complex routing solely for this UI update.

---

# 29. MOTION

Keep motion subtle.

Allowed:

```text
Hover elevation
150–200ms transitions

Expand/collapse
200–250ms

Insight reveal
small fade/translate
```

Avoid:

- Floating animations
- Constant pulsing
- Large transitions
- Decorative motion

The only status that may have subtle emphasis is:

```text
● Live
```

---

# 30. RESPONSIVE BEHAVIOR

## Desktop

```text
5 KPI cards
Full intelligence graph
2-column analysis section
Full table
```

## Tablet

```text
2–3 KPI columns
Graph horizontally adaptable
Analysis sections stack when needed
Table scroll container
```

## Mobile

```text
1 KPI card per row
Relationship map horizontally scrollable or simplified
Analysis cards stacked
Insights full width
Project table horizontal scroll
```

Do not destroy information density on smaller screens.

---

# 31. ACCESSIBILITY

Requirements:

- Semantic buttons for actions
- Keyboard support
- Visible focus states
- Sufficient contrast
- Tooltips for unfamiliar icons
- Do not rely only on color for severity/status

---

# 32. DO NOT CHANGE

The following should remain untouched unless required for integration:

- Existing sidebar architecture
- Existing top navigation architecture
- Global provider abstraction
- Backend architecture
- Zustand/store architecture
- Existing shared design tokens
- Existing Decision Intelligence implementation
- Existing Decision Workspace flow

This is primarily a dashboard experience refinement.

---

# 33. FINAL DESIGN STANDARD

The finished dashboard must NOT feel like:

```text
A traditional admin dashboard
```

It should feel like:

```text
An Engineering Intelligence Command Center
```

The strongest impression should be:

> **AI-EIP understands how engineering is connected and turns those signals into actionable decisions.**

---

# 34. FINAL ACCEPTANCE CHECKLIST

Before considering this screen complete:

## Product Story

- [ ] Dashboard clearly communicates Engineering Intelligence
- [ ] Relationships are visually understandable
- [ ] AI Analysis Engine explains signal sources
- [ ] Insights explain what needs attention
- [ ] Evidence and confidence are visible
- [ ] Payment Service creates a natural path to Decision Intelligence

## UI

- [ ] No unnecessary new cards
- [ ] No excessive colors
- [ ] No gradients unless already part of the design system
- [ ] Clear visual hierarchy
- [ ] Premium enterprise appearance
- [ ] Consistent spacing
- [ ] Consistent typography

## Integration

- [ ] Knowledge Concentration links toward the Payment Service decision context
- [ ] Dashboard and Decision Intelligence use consistent terminology
- [ ] Payment Service appears consistently across the experience

## Quality

Run:

```bash
npm run lint
npm run build
```

Verify:

- [ ] Desktop
- [ ] Tablet
- [ ] Mobile
- [ ] Existing routes
- [ ] Existing Decision Intelligence flow
- [ ] No console errors

---

# 35. IMPLEMENTATION PRIORITY

Implement in this order:

```text
1. Page copy and hierarchy
2. KPI row refinement
3. Engineering Intelligence Map refinement
4. AI Analysis Engine
5. AI Insights hierarchy
6. Dashboard → Decision Intelligence transition
7. AI prioritized projects table
8. Responsive polish
9. Final spacing and visual QA
```

---

# FINAL RULE

After this implementation:

> **Do not redesign the dashboard again unless there is a clear functional problem.**

Only allow:

- Bug fixes
- Alignment fixes
- Spacing fixes
- Responsive fixes
- Minor copy corrections

The overall architecture is considered FINAL.

The dashboard must support the complete AI-EIP narrative:

```text
UNDERSTAND
        ↓
CONNECT
        ↓
DETECT
        ↓
EXPLAIN
        ↓
DECIDE
        ↓
ACT
```

This is the final Engineering Overview direction for the AI-EIP hackathon demo.
