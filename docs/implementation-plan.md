# Implementation Plan: 5 Issues Fixed

## 1. ErrorState — Themed Failure Screen
**File:** `frontend/src/components/common/ErrorState.jsx`
- Brand-matched error screen using new theme tokens
- AI-EIP sparkle brand mark (gradient box + SparkleIcon, like Login/Sidebar)
- "Couldn't load data" heading + custom message
- Themed contained Retry button
- Centered card on background.default with subtle gradient blobs
- Works in both moss & classic themes via CSS vars

## 2. Retry Logic — 2 Retries (3 Total Attempts)
**Files:**
- `frontend/src/api/client.js` → `withRetry` default: `retries = 2` (3 attempts total)
- `frontend/src/hooks/useData.js` → Auto-retry on failure using `withRetry` with exponential backoff (1s, 2s, 4s); exposes retry for manual trigger; adds `retryCount` state
- Pages using `useData` get automatic retries transparently

## 3. ProjectDetail Risk Tab → EvidenceDrawer
**File:** `frontend/src/pages/ProjectDetail/index.jsx`
- Risk tab: add local state `selectedRisk`, `drawerOpen`
- DataTable row click → set `selectedRisk`, open drawer (no navigation)
- Pass risk to existing `EvidenceDrawer` component
- Remove `<Link>` from title column, add clickable row styling

## 4. Risk Drawer Width
**File:** `frontend/src/components/ui/EvidenceDrawer.jsx` (line 34)
- Change: `width: { xs: '100%', sm: 400 }` → `width: { xs: '100%', sm: 560 }`

## 5. RequireAuth — Branded Session Check
**File:** `frontend/src/components/auth/RequireAuth.jsx`
- Replace spinner + "Checking session…" with:
- Full-screen centered card on `background.default`
- AI-EIP sparkle brand mark (gradient box + SparkleIcon)
- "AI-EIP" / "Engineering Intelligence Platform"
- "Verifying your session…" message + CircularProgress
- Subtle gradient background blobs (like Login page)
- Matches both moss & classic themes

## Implementation Order
1. ErrorState (independent)
2. Retry logic (client.js + useData.js)
3. Drawer width (one-liner)
4. ProjectDetail Risk tab → Drawer
5. RequireAuth branded loading

## Files Touched Summary

| Issue | Files |
|-------|-------|
| 1 | ErrorState.jsx |
| 2 | client.js, useData.js |
| 3 | ProjectDetail/index.jsx |
| 4 | EvidenceDrawer.jsx |
| 5 | RequireAuth.jsx |

All changes use the new theme tokens (moss/classic) — no hardcoded colors.