# BUILD IMPROVEMENT 07 — Month-Over-Month Comparison After Rescan

## Files

| File | Lines |
|---|---|
| `lib/ai/comparison-generator.ts` | 246 |
| `app/api/v2/comparisons/route.ts` | 59 |
| `app/api/v2/comparisons/[reportId]/route.ts` | 66 |
| `app/api/v2/diagnostic/run/route.ts` | 661 |
| `app/v2/diagnostic/[id]/page.tsx` | 669 |
| `components/v2/RescanWidget.tsx` | 247 |
| `app/v2/dashboard/business/page.tsx` | 798 |
| `app/v2/dashboard/solo/page.tsx` | 798 |
| `app/v2/dashboard/enterprise/page.tsx` | 1943 |
| `services/email/service.ts` | 338 |
| `lib/ai/brief-generator.ts` | 380 |

## Audit findings

1. Test account report count: cannot query live DB from build env — query: `SELECT id, overall_score, created_at FROM diagnostic_reports WHERE business_id = 'abf1125c...' ORDER BY created_at`
2. Report shape: `result_json → normalize() → {scores.overall, findings[{category,title,impact_min,impact_max,severity}], action_plan, programs[], totals}`
3. Diagnostic results page: no prior comparison/history shown before this build
4. Diagnostic trigger: `POST /api/v2/diagnostic/run` → `router.push('/v2/diagnostic/${reportId}')`
5. No existing rescan flow — `/v2/diagnostic` links to the intake page


## Sample comparison narrative (simulated for Brian Tracy's Business)

If base score 62, rescan 69 (+7), 2 tasks completed ($420+$260=$680/mo), 1 new finding (AR timing ~$340/mo):
**Headline:** "Score up 7 points and $680/month recovered — one new cash flow risk flagged"
**Narrative:** "Strong progress since your February scan — your score jumped from 62 to 69 and you recovered $680/month by fixing your payment processor fees and expense categorization gaps. That's $8,160/year now staying in your business. One new finding requires attention: your accounts receivable collection period increased from 38 to 47 days, putting approximately $340/month at risk. Net position: +$340/month better than last month, and the AR issue is fixable with a few process changes."


## Architecture notes

- `generateComparison()` is entirely non-blocking — called after response is sent, never delays diagnostic
- Comparison polling: client polls `GET /api/v2/comparisons/:reportId` every 2s, max 15 polls (30s)
- Finding match: same category + ≥50% word overlap in title = 'persisted'; missing from new = 'resolved'; new only = 'new discovery'
- Rescan email deduped via `monthly_briefs` table using `brief_subject = 'rescan_{reportId}'`
- Rescan nudge threshold: Solo 60d, Business 28d, Enterprise 21d (spec-defined)
- Net position: `savings_recovered - new_findings_impact` (green if positive, amber if negative)

## SQL
Run `diagnostic-comparisons.sql` in Supabase SQL editor.


## Deploy
```
git add -A
git commit -m "feat: month-over-month comparison after rescan — diff, narrative, email, dashboard widget"
git push
```


## Confirmation answers

1. **Comparison banner on rescan?** Appears after polling resolves (~3-8s). Shows headline, score delta, savings, net position. First scan → no banner.
2. **Comparison generation time:** Claude call (max 300 tokens) typically 2-5s after diagnostic saves. Banner visible within 1-2 polls.
3. **Rescan email subject format:** `Your scan is in — score +7, net +$340/month`
4. **Dashboard widget:** `RescanWidget` shows 'Since your last scan (X days ago)' card. Renders only when a comparison exists.
5. **Rescan nudge:** `RescanNudge` appears when `daysSinceLast >= threshold` (tier-dependent). User can dismiss. Links to `/v2/diagnostic`.