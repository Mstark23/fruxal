# BUILD IMPROVEMENT 112 — Break-Even Intelligence Engine

## Files

| File | Lines |
|---|---|
| `lib/ai/break-even-calculator.ts` | 175 |
| `app/api/v2/breakeven/route.ts` | 144 |
| `app/api/v2/breakeven/model/route.ts` | 121 |
| `app/api/v2/breakeven/extract/route.ts` | 113 |
| `app/v2/breakeven/page.tsx` | 524 |
| `components/v2/BreakEvenWidget.tsx` | 192 |
| `app/v2/dashboard/business/page.tsx` | 756 |
| `app/v2/dashboard/solo/page.tsx` | 759 |
| `app/v2/dashboard/enterprise/page.tsx` | 1937 |
| `lib/ai/business-context.ts` | 277 |
| `lib/ai/chat-system-prompt.ts` | 304 |
| `app/api/v2/diagnostic/run/route.ts` | 553 |
| `app/prescan/page.tsx` | 359 |

## SQL
Run `break-even-data.sql` in Supabase SQL editor.
GENERATED ALWAYS AS columns require PostgreSQL 12+ (Supabase supports this).
Fallback trigger is included as comments if GENERATED columns fail.


## Deploy
```
git add -A
git commit -m "feat: break-even intelligence engine — calculator, modeller, dashboard widget, chat context"
git push
```


## Confirmation answers

**1. Break-even widget on all 3 dashboards?**
Yes — `BreakEvenWidget` injected before the Action Plan section on solo, business, and enterprise.
Solo shows simple version (break-even + safety amount).
Business shows full version with safety % and 'Model a decision →' link.
Enterprise adds annualized safety buffer.

**2. Decision modeller shows instant calculations?**
Yes — `modelDecision()` from `break-even-calculator.ts` runs client-side immediately.
Numbers appear instantly. Claude narrative fetches from `/api/v2/breakeven/model` in background (~1-2s).
The before/after table is visible before the narrative arrives.

**3. Advisor chat references break-even position?**
Yes — `buildBusinessContext()` now runs a 7th parallel query against `break_even_data`.
All three tier system prompts include a BREAK-EVEN POSITION block when data exists.
Format: `Monthly break-even: $X | Current revenue: $X | Safety margin: $X (X%) — comfortable/thin/below`

**4. Dashboard when no break-even data exists?**
Shows a dashed 'Know your break-even point — 2-minute setup →' card that links to `/v2/breakeven`.
The full break-even page shows the 3-step setup wizard (Section 4).
After setup, widget and analysis appear immediately with no page reload needed.


## Architecture notes
- `break-even-calculator.ts` is pure functions, zero deps, runs client-side
- GENERATED ALWAYS columns (`fixed_total`, `variable_total_pct`) are read-only — upsert only writes the component columns
- Extract route called non-blocking after every diagnostic run via fire-and-forget fetch
- Prescan teaser uses a conservative estimate formula (35% of annual leak as fixed cost proxy)
- `data_source` field tracks origin: `manual` | `diagnostic` | `accounting_sync`