# BUILD IMPROVEMENT 02 — MANIFEST

## Files

| `lib/ai/task-generator.ts` | 204 lines |
| `app/api/v2/tasks/route.ts` | 90 lines |
| `app/api/v2/tasks/[id]/route.ts` | 100 lines |
| `components/v2/TaskCard.tsx` | 416 lines |
| `app/v2/tasks/page.tsx` | 217 lines |
| `app/api/v2/diagnostic/run/route.ts` | 546 lines |
| `app/v2/dashboard/business/page.tsx` | 740 lines |
| `app/v2/dashboard/solo/page.tsx` | 750 lines |
| `app/v2/dashboard/enterprise/page.tsx` | 1935 lines |

## SQL

Run `diagnostic-tasks.sql` in Supabase SQL editor first.


## Deploy

```powershell
git add -A
git commit -m "feat: diagnostic task cards — auto-generate action plan after every diagnostic"
git push
```


## How it works

1. User runs diagnostic → main Claude call generates findings

2. Background Claude call (non-blocking) converts findings → task cards

3. Tasks saved to `diagnostic_tasks` table

4. Dashboard fetches tasks on load, shows TaskList with savings counter

5. User checks off tasks → `completed_at` set, recovery total updates

6. Full task management at `/v2/tasks`


## Timeout risk

Task generation is **fire-and-forget** — it runs via `.catch()` outside
the await chain, so it NEVER adds to the diagnostic route's wall time.
The diagnostic responds in ~30-90s as before. Task generation runs in
parallel (~5-15s) and logs silently if it fails. Vercel's 120s `maxDuration`
on the diagnostic route is not affected. The task generator itself has no
explicit maxDuration because it's not a separate route.
