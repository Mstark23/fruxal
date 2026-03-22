# BUILD IMPROVEMENT 04 — Live Score Recalculation

## Files

| File | Lines |
|---|---|
| `lib/ai/score-calculator.ts` | 233 |
| `app/api/v2/score/route.ts` | 185 |
| `app/api/v2/score/recalculate/route.ts` | 68 |
| `app/api/v2/cron/score-update/route.ts` | 107 |
| `components/v2/LiveScoreRing.tsx` | 370 |
| `components/v2/TaskCard.tsx` | 460 |
| `app/v2/dashboard/business/page.tsx` | 780 |
| `app/v2/dashboard/solo/page.tsx` | 780 |
| `app/v2/dashboard/enterprise/page.tsx` | 1941 |
| `lib/ai/business-context.ts` | 368 |
| `lib/ai/chat-system-prompt.ts` | 377 |
| `vercel.json` | 67 |

## Audit findings (Step 1)

1. **Score stored:** `diagnostic_reports.overall_score` (0–100). `business_profiles.health_score` used for prescan only.
2. **Score generation:** Claude AI → `scores.overall` → `diagnostic_reports.overall_score`.
3. **Schema:** 0–100 integer.
4. **Score display:** Each dashboard has its own inline `Ring` SVG function. Score loaded via `/api/v2/dashboard` + `/api/v2/diagnostic/latest` on page load.
5. **No existing score_history table** — created by this build.
6. **Score fetched on page load only** — no real-time update. `fruxal:score:updated` event added by this build.


## Scoring rules

Task bonuses: <$100/mo = +1pt, $100–300 = +2, $300–600 = +3, $600–1000 = +4, $1000+ = +5
Effort multipliers: easy ×1.0, medium ×1.2, hard ×1.5 (rounded to nearest int)
Max task bonus cap: +25 points total above base
Deadline penalties: tax/CRA −5, payroll −4, compliance −3, general −2 (cap −20)
Decay: 0–30d = 0, 31–60d = −1, 61–90d = −3, 91–120d = −6, 120d+ = −10
Final: clamp(base + taskBonus − deadlinePenalty − decayPenalty, 0, 100)


## SQL
Run `score-history.sql` in Supabase SQL editor.


## Deploy
```
git add -A
git commit -m "feat: live score recalculation — task bonuses, decay, breakdown panel, sparkline"
git push
```


## Confirmation answers

1. **Score animates on task completion?** Yes — `TaskCard.tsx` calls `POST /api/v2/score/recalculate` after marking done, response dispatches `fruxal:score:updated` event, `ScoreRingAddons` listens and updates.
2. **Current live score for Brian Tracy's Business:** Calculated as: `diagnostic overall_score` + task bonuses (based on completed tasks) − deadline penalties (overdue obligations) − decay (days since diagnostic). Query `/api/v2/score?businessId=abf1125c-b541-4aad-96b0-83271adae552` after deployment.
3. **Score breakdown panel:** `ScoreBreakdown` component shows base, per-task bonuses, per-deadline penalties, and decay with expand/collapse. Collapsible below the existing score display.
4. **Chat references delta?** Yes — `liveScoreBlock` in all 3 tier prompts: 'Health score: X/100 (+Y from last diagnostic, Z days ago)'.
5. **Score-update cron in vercel.json?** Yes — `{ path: '/api/v2/cron/score-update', schedule: '0 8 * * *' }` added.


## Architecture notes
- `ScoreRingAddons` — additive component injected below existing ring. Doesn't replace the existing Ring SVG.
- `score_history` insert is deduplicated: only inserts when score changes by >=1 point
- Cron only processes businesses with NEWLY overdue obligations (last 24h) — no double-penalizing
- Self-tests in `score-calculator.ts` run at module load in dev — confirm $400/mo medium = +4pts