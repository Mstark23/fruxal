# BUILD IMPROVEMENT 142 — Financial Ratio Intelligence Engine

## Files

| File | Lines |
|---|---|
| `lib/ai/ratio-calculator.ts` | 349 |
| `app/api/v2/ratios/route.ts` | 116 |
| `app/api/v2/ratios/calculate/route.ts` | 82 |
| `app/api/v2/ratios/extract/route.ts` | 173 |
| `app/api/v2/ratios/narrative/route.ts` | 134 |
| `app/v2/ratios/page.tsx` | 381 |
| `components/v2/RatioWidget.tsx` | 190 |
| `app/v2/dashboard/business/page.tsx` | 764 |
| `app/v2/dashboard/solo/page.tsx` | 767 |
| `app/v2/dashboard/enterprise/page.tsx` | 1938 |
| `lib/ai/business-context.ts` | 310 |
| `lib/ai/chat-system-prompt.ts` | 326 |
| `app/api/v2/diagnostic/run/route.ts` | 560 |
| `app/api/cron/monthly-report/route.ts` | 124 |

## SQL
Run `financial-ratios.sql` in Supabase SQL editor.
Handles both fresh install and upgrade (narrative columns added via `IF NOT EXISTS`).


## Deploy
```
git add -A
git commit -m "feat: financial ratio intelligence engine — calculator, dashboard, chat context"
git push
```


## Answers to spec questions

**1. data_completeness_pct for tracubrain test account?**
Depends on what the diagnostic extracted. From profile revenue alone: ~13%.
With break_even_data (revenue + fixed + variable): ~27-40%.
Full balance sheet from accounting sync needed for >80%. Current state shows
exactly which data points are missing in Section 4 of the ratios page.

**2. DSCR for test business?**
DSCR requires monthly debt service (`fixed_loan_payments` from break_even_data).
If no loan payments recorded: DSCR = null → shown as '—' in UI.
To populate: enter loan payments in the break-even setup form → auto-flows to DSCR.

**3. Ratio cards show '--' gracefully for null?**
Yes — `fmtRatio(null)` returns '—'. Status icon hidden when null.
Progress bar shows 0% when null. 'Score' formula uses neutral 50 for null ratios.

**4. Advisor chat references ratios?**
Yes — 8th parallel query in `buildBusinessContext()` pulls latest ratio row.
Tier 2 and 3 system prompts include a KEY FINANCIAL RATIOS block.
Example: 'Ask what is my current ratio?' → chat answers from the stored value.

**5. Claude narrative section caching?**
Narrative stored in `financial_ratios.narrative` column.
Cache check: if `narrative_generated_at` is within 24h, return cached.
Regeneration trigger: any ratio page load fetches narrative if cache is stale.
One Claude call per 24h per business — very low cost.


## Architecture notes
- `ratio-calculator.ts` is pure functions, zero deps, self-testing in dev
- DSCR uses standard banker formula: annual EBITDA / annual debt service
- Industry-aware gross margin benchmarks via `getGrossMarginBenchmark(industrySlug)`
- Extract route queries break_even_data + diagnostic_reports + business_profiles in parallel
- Narrative cached 24h in DB — never regenerated more than once per day per business
- Sparklines use pure SVG (no chart library) — 64×24px, 3 data points
- Bank qualifying check: DSCR >1.25×, Current ratio >1.2×, Interest coverage >2.0×