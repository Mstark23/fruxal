# Data Connection + Theme Fixes

## Files to replace
```
app/api/v2/diagnostic/latest/route.ts     → fixes dashboard showing $0 (token.sub → token.id)
app/v2/diagnostic/[id]/page.tsx           → light theme + auto-sync obligations after completion
app/api/v2/obligations/sync/route.ts      → NEW: auto-sync obligations without needing businessId
app/api/v2/programs/sync/route.ts         → NEW: programs sync signal
```

## What each fix does

### 1. Dashboard shows $0 after intake
`diagnostic/latest/route.ts` was using `token.sub` to look up reports, but reports
are inserted with `token.id`. Added `(token as any)?.id || token?.sub` fallback — 
same pattern used everywhere else in the codebase.

### 2. Dark theme on report page  
`app/v2/diagnostic/[id]/page.tsx` had full dark theme (bg-[#0a0e14], text-white, emerald-*).
All converted to system design tokens: bg-bg, text-ink, brand-*, border-border-light.

### 3. Obligations not syncing after intake
After `launchDiagnostic()` → report page loads → now fires POST /api/v2/obligations/sync
automatically. The sync route looks up the user's businessId from their session, no params needed.

### 4. Programs not connecting
Programs API already loads from business_profiles dynamically on GET.
The issue was programs page couldn't match because obligations sync hadn't run yet.
Now that obligations sync fires automatically, programs page will also match correctly on next load.
