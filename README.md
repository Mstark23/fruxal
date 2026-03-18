# Complete Fix — Dashboard + Prescan

## STEP 1: Make sure these files are DELETED (you already did this)
```
src/app/dashboard/loading.tsx
src/app/dashboard/DashboardClient.tsx
```

## STEP 2: Copy all files from this zip (overwrite existing)

## STEP 3: `npm run dev`

## What changed

### Dashboard — now matches V2 dark theme:
- **Dark background** (bg-[#0a0e14]) with emerald accents — matches leaks, obligations, diagnostic pages
- **Sidebar navigation** stays (layout.tsx kept) — Desktop sidebar + mobile bottom nav
- **Prescan data displayed**: Health Score, Annual Leak, Leaks Found as top stat cards
- **Leak cards**: expandable, show severity badges, confidence %, dollar amounts, proof, explanations
- **Fix steps LOCKED** behind paywall — blurred with "🔒 Unlock fix steps" overlay
- **Premium tools LOCKED**: AI Diagnostic, Monthly Re-scans, Smart Alerts, Trend Charts, Integrations
- **Unlocked tools**: Obligations tracker, Programs, Leaks list

### Middleware — fixes infinite redirect loop:
- `/dashboard` → internally rewrites to `/v2/dashboard` (no redirect, no loop)

### V2 Layout — no more blocking guards:
- TourGuard removed from v2/layout.tsx (was calling API that hung)

### "5 questions" removed from 11 places across the codebase
