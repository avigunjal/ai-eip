# AI-EIP Dashboard — Implementation Brief

> **Status:** Approved (rev 2 — MUI). Full 12-route SaaS dashboard, mock-data driven.
> **Stack:** Vite 8 + React 19 + **Material UI v7** (pure-MUI, Aurora-aligned) + React Router v7 + Zustand + Recharts + `@mui/icons-material` + dayjs.
> **No backend** — deterministic in-memory fixtures. Light, "Aurora-inspired" enterprise UI.

## 1. Objective & scope

Build a high-fidelity, responsive mock **AI Engineering Intelligence Platform** covering every route in the spec, wired with real drill-down navigation, accessible charts, and local state (dismiss/save/watch/recognize with undo). A connected, working route tree is worth more than disconnected static screenshots.

## 2. Decisions

| Area | Choice | Rationale |
|---|---|---|
| UI library | **MUI v7** (`@mui/material`, `@mui/system`, `@mui/icons-material`, `@mui/lab`) | Reuse ready-made components; **no hand-rolled primitives** |
| Styling | **Pure MUI** (`sx`/emotion) + **CSS-var tokens** | Drop Tailwind; match Aurora (itself MUI) |
| Theme | Aurora-style MUI theme (palette + `components/*` + typography + shadows) mapped onto AI-EIP spec tokens | Align with Aurora look; spec tokens are the source of truth for colors |
| Font | **Inter** | Spec-required; Aurora lists it as a fallback |
| Router | react-router-dom v7 | Current; API-compatible v6 |
| State | Zustand | MUI has no state layer |
| Charts | **Recharts** | Accessible legends/tooltips, "View data table", drill-down |
| Icons | **@mui/icons-material** | Idiomatic for MUI |
| Dates | dayjs | Lightweight |

### CSS-variable color tokens (handled centrally)
All colors/radii/shadows live as CSS custom properties in `src/styles/tokens.css` (`:root`), the single source of truth. The MUI theme maps those same tokens into `palette`/`shadows`/`components` so both raw CSS (charts, dynamic status) and MUI `sx` read from one place. Status colors are **never hard-coded in pages** — they come from `config/riskLabels.js` → CSS vars.

## 3. Dependencies

```bash
npm rm tailwindcss @tailwindcss/vite
npm i @mui/material @mui/system @mui/icons-material @mui/lab @emotion/react @emotion/styled
# already present: react 19, react-dom, react-router-dom v7, zustand, recharts, dayjs, clsx, oxlint, vite 8
```

## 4. Folder structure (MUI / Aurora-aligned)

```
src/
├─ assets/                 # svg illustrations, logos
├─ components/
│   ├─ common/             # Logo, SectionHeader, WorkspaceSwitcher, NotificationMenu, ProfileMenu
│   ├─ base/               # thin wrappers: ReactEchart, StatusAvatar, IconifyIcon-equivalent
│   ├─ sections/           # per-page feature sections (dashboards/, risks/, knowledge/, teams/, ...)
│   └─ styled/             # shared styled widgets (OutlinedBadge, StyledTextField, ...)
├─ config/                 # constants.js, paths.js, dates.js, riskLabels.js
├─ data/                   # contracts.jsdoc, fixtures.js, service.js
├─ hooks/                  # useData, useUrlFilters, useToast, useStore
├─ layouts/                # AppShell, app-bar/ (TopBar), sidenav/ (Sidebar)
├─ pages/                  # 12 route pages
├─ providers/              # ThemeProvider, SettingsProvider, BreakpointsProvider
├─ routes/                 # router.jsx (v7 data router), sitemap.js, paths.js
├─ store/                  # uiStore.js, actionStore.js (zustand)
├─ styles/                 # tokens.css (:root CSS vars + base/reset/focus)
├─ theme/                  # Aurora-style MUI theme
│   ├─ colors.js           # token hex values
│   ├─ palette.js          # spec tokens → MUI palette
│   ├─ typography.js       # Inter scale
│   ├─ shadows.js          # Aurora-inspired soft shadows
│   ├─ components/         # MUI overrides (Button, Paper, AppBar, Drawer, Chip, DataGrid, Tabs, ...)
│   └─ theme.js            # createTheme (light only)
├─ App.jsx                 # ThemeProvider + RouterProvider + Toaster
└─ main.jsx
```

## 5. Design system → MUI theme

- **palette.js**: `primary.main #2563EB`, `success.main #0F9F8A`, `warning.main #D88A12`, `error.main #D14343`, `secondary.main #7C5CE0`, `info.main #0DA6D6`, `background.default #F7F9FC`, `background.paper #FFFFFF`, `divider #E3E8EF`, `text.primary #172033`, `text.secondary #687386`; Aurora-style `neutral` + `chGrey/chRed/chBlue/chGreen/chOrange/chLightBlue` chart scales.
- **typography.js**: Inter — page title 28/36 700, section 18/26 700, body 14/21 400, meta 13/18, KPI number 32–36 700.
- **components/*.js** (Aurora mirror): Paper (outline 1px divider, rounded 8–14), Button (radius 8, weight 600, `soft` variants), AppBar (no shadow, bottom border), Drawer (no shadow when docked), List/ListItemButton (active = `primary.lighter` bg + `primary` text), Chip, DataGrid, Tabs, TextField, Tooltip, Breadcrumbs, Dialog, Pagination.
- **Layout**: fixed MUI `AppBar` (72px) + permanent `Drawer` (248px desktop) / temporary mobile + `Box`/`Grid`/`Stack` for layout. Content max-width 1440, outer padding 28–32px.

## 6. Components (MUI-based)

Use MUI directly with Aurora theme overrides — no custom Button/Table/Input/Tabs/Menu/Dialog. App-specific MUI compositions:
`MetricCard`, `StatusBadge` (icon + label, never color-only), `InsightCard`, `ChartCard` (Recharts legend + View-data-table + drill-down), `EvidenceDrawer`, `EmptyState`, `LoadingState` (Skeleton), `ErrorState`, `CommandPalette` (⌘K), `DateRangePicker`, `NotificationBell`, `AvatarMenu`, `PageHeader`, `FilterBar` (chips + Clear all), `DataTable` (MUI X DataGrid: sticky header, sort, selection, pagination, row click, responsive cards).

## 7. Routes & pages (12)

| Route | Page | Key content |
|---|---|---|
| `/` | Overview | Header+date+Export; 5 MetricCards; 8/4 grid (health trend line/area, risk stacked bars); 7/5 grid (projects-needing-attention table, AI insights feed); full-width knowledge concentration card |
| `/projects` | Projects | KPI strip; filter toolbar; table (status, health-ring, risk, trend spark, team, date, driver, updated); health-by-team bars; delivery-confidence donut |
| `/projects/:projectId` | ProjectDetail | Breadcrumb, status badge, owners, date, Watch+overflow; header KPIs; tabs Overview/Risks/Dependencies/Team/Activity; annotated trend; risk drivers; milestone timeline; prevention checklist |
| `/risks` | Risks | Summary counts; filter toolbar; register table (severity badge, title, project, category, confidence, trend, owner, status, signal); row → EvidenceDrawer |
| `/knowledge` | Knowledge | KPI cards; knowledge concentration matrix; critical-systems ranked card; coverage-vs-criticality quadrant; transfer-opportunities list |
| `/knowledge/:systemId` | KnowledgeDetail | Header (critical, coverage, freshness, linked projects); expertise map (Primary/Capable/Learning); dependency graph + list + Focus; doc inventory; mitigation plan + modal |
| `/teams` | Teams | Cards/table; capacity-vs-demand bars + 85% marker; capability heatmap; staffing recommendations |
| `/teams/:teamId` | TeamDetail | Header; tabs Overview/Capacity/Skills/Projects/Members; allocation bars; skills heatmap+gaps; project cards; members |
| `/recognition` | Recognition | KPI strip; impact highlights feed; impact composition bars; collaboration network (desktop); recognition composer modal |
| `/people/:personId` | PersonProfile | Header + expertise chips; tabs Impact/Expertise/Collaborations/Recognition; impact timeline |
| `/insights` | Insights | Grouped Needs review / Saved / Dismissed cards; "Why am I seeing this?" disclosure |
| `/settings` | Settings | Tabs Data sources / Score config / Notifications / Workspace; mock integration cards |

## 8. Behavior, responsive, a11y

- URL query params drive filters/sort/search/date; Zustand handles dismiss/save/watch/recognize with undo toast; forms validate + disable submit until valid + success/cancel.
- Loading (Skeleton), empty, error (retry) states everywhere.
- Responsive: MUI breakpoints — permanent drawer ≥md, temporary mobile; Grid stacking; tables → cards <640px; drawers → full-screen sheets on mobile.
- A11y: MUI a11y + WCAG 2.2 AA; visible focus-visible rings; landmarks; skip-link; reduced-motion; color never the only encoding (icon/label/pattern + accessible chart data tables).

## 9. Quality gates

- `npm run lint` (oxlint) and `npm run build` must pass.
- Verify each route renders, charts have legends + data-table + drill-down, and responsive widths 1280/1024/768/390 have no horizontal overflow.

## 10. Acceptance checklist (from spec)

- [ ] Aurora-inspired shell: light, restrained, spacious, consistent
- [ ] All 12 routes render with realistic fixtures + coherent nav
- [ ] Overview surfaces the four MVP pillars without excessive scroll
- [ ] Risks include evidence, confidence, actionable prevention workflow
- [ ] Knowledge + staffing use interpretable, accessible engineering charts
- [ ] Recognition emphasizes evidence + context, not a leaderboard
- [ ] Loading/empty/error, hover/focus, and mobile states designed
- [ ] Charts have legends, data alternatives, drill-down
- [ ] Controls keyboard-accessible; visual status never color-only
