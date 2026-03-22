# BUILD IMPROVEMENT 03 — MANIFEST

## Files

| `app/api/v2/recovery/route.ts` | 107 lines |
| `app/api/v2/recovery/snapshot/route.ts` | 150 lines |
| `components/v2/RecoveryCounter.tsx` | 355 lines |
| `components/v2/TaskCard.tsx` | 440 lines |
| `app/v2/dashboard/business/page.tsx` | 748 lines |
| `app/v2/dashboard/solo/page.tsx` | 751 lines |
| `app/v2/dashboard/enterprise/page.tsx` | 1936 lines |
| `app/v2/tasks/page.tsx` | 225 lines |
| `app/v2/layout.tsx` | 231 lines |
| `services/email/service.ts` | 172 lines |
| `app/api/cron/monthly-report/route.ts` | 115 lines |

## SQL
Run `recovery-snapshots.sql` in Supabase SQL editor.

## Deploy
```
git add -A
git commit -m "feat: running recovery counter — persistent savings tracker with milestone emails"
git push
```

## Answers to spec questions

**1. What happens when a task is un-done (reverted to open)?**
TaskCard fires `fruxal:task:completed` with `savings_monthly: 0` (not the amount).
RecoveryCounter catches this, busts its cache, and refetches live totals.
The snapshot route recalculates from scratch on every PATCH — so the number
decreases immediately and accurately. No stale data.

**2. Is recovery_snapshots necessary, or calculate live always?**
Kept for two reasons: (a) monthly delta needs last month's number, which requires
a historical record; (b) milestone deduplication uses `milestone_sent` stored per
month-row. Live calculation is always used for accuracy on the dashboard. The
snapshot is written on task completion but never used as the source of truth for
the displayed number — only for delta + milestone tracking.