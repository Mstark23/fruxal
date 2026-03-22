# BUILD IMPROVEMENT 15 — Diagnostic History Timeline

## Files

| File | Lines |
|---|---|
| `lib/ai/timeline-builder.ts` | 280 |
| `app/api/v2/history/route.ts` | 120 |
| `app/v2/history/page.tsx` | 371 |
| `app/v2/layout.tsx` | 233 |
| `components/v2/JourneyWidget.tsx` | 111 |
| `app/v2/dashboard/business/page.tsx` | 805 |
| `app/v2/dashboard/solo/page.tsx` | 805 |
| `app/v2/dashboard/enterprise/page.tsx` | 1944 |
| `lib/ai/business-context.ts` | 443 |
| `lib/ai/chat-system-prompt.ts` | 404 |
| `app/api/v2/diagnostic/run/route.ts` | 665 |
| `app/api/v2/tasks/[id]/route.ts` | 101 |
| `app/api/v2/goals/[id]/route.ts` | 58 |

## Audit findings (Step 1)

1. Test account diagnostic count: cannot query live DB from build env — query: `SELECT id, overall_score, created_at FROM diagnostic_reports WHERE business_id='abf1125c...' ORDER BY created_at ASC`
2. Prescan: check `prescan_results WHERE user_id = '<userId>'`
3. Completed tasks: check `diagnostic_tasks WHERE business_id='...' AND status='done'`
4. Score history: check `score_history WHERE business_id='...' ORDER BY calculated_at ASC`
5. No history/timeline page existed before this build
6. Nav: `NAV_STANDARD` and `NAV_ENTERPRISE` arrays in `app/v2/layout.tsx` — History added after Dashboard


## What events would be generated for a test account with 2 diagnostics + 3 completed tasks

Based on typical test account data, timeline would contain:
1. `prescan` — 🔍 Initial scan completed (if prescan exists)
2. `diagnostic` — 🩺 First full diagnostic — Score X/100 [milestone=true]
3. `task_completed` × 3 — ✅ Fixed: [task title] +$X/month
4. `score_milestone` — ⭐ Score milestone: 60/100 reached (if applicable)
5. `rescan` — 🔄 Monthly scan — Score Y/100 (if second diagnostic is_rescan=true)
6. `goal_set` — 🎯 Goal set: [title] (if goal exists)
7. `milestone_reached` — 💰 Recovery milestone: $100/month (if cumulative ≥ $100)


## Score chart data points format

Each `score_history` record maps to: `{ date: calculated_at, score: score, type: trigger_type }`
Chart renders as SVG polyline — no library. Y-axis 0–100, reference line at 70.


## Architecture notes

- `buildTimeline()` is idempotent — UNIQUE(source_id, source_type) prevents duplicates on upsert
- History page calls `buildTimeline()` synchronously on first load (stale = >24h or no events)
- Subsequent loads use cached `business_timeline` rows — fast
- Score projection: last-60-day rate × days-to-80 — capped at 365 days, hidden if rate ≤ 0
- Month narrative (Step 10) skipped per spec guidance — timeline is valuable without it
- `JourneyWidget` renders null if no timeline events exist (safe empty state)
- Nav: `/v2/history` added to both NAV_STANDARD and NAV_ENTERPRISE, and ALL_SHELL whitelist
- 12th parallel query in business-context uses computed aggregation (no extra roundtrip)

## SQL
Run `business-timeline.sql` in Supabase SQL editor.


## Deploy
```
git add -A
git commit -m "feat: diagnostic history timeline — /v2/history page, score chart, journey widget, nav entry"
git push
```


## Confirmation answers

1. **`/v2/history` loads?** Yes — first load triggers `buildTimeline()` synchronously, then renders events grouped by month. Skeleton shown during load.
2. **Timeline events generated:** Depends on live data. After first diagnostic, minimum 1 diagnostic event + any tasks. Run `SELECT * FROM business_timeline WHERE business_id='abf1...' ORDER BY event_date`.
3. **Score chart renders?** Only if ≥2 `score_history` records exist. SVG polyline with dots, 70-point reference line.
4. **History nav link:** Yes — clock/history icon, label 'My Journey', position 2 in both nav arrays.
5. **Dashboard journey widget:** `JourneyWidget` renders after `/api/v2/history` resolves stats. Shows total days, score improvement, savings.
6. **Chat 'How long have I been using Fruxal?':** `journeyBlock` in all 3 tier prompts: 'Platform history: X days on Fruxal | Y scans | Z tasks completed | Total confirmed savings: $X/month'