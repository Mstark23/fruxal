# BUILD IMPROVEMENT 05 — Solutions DB Connected to Every Recommendation

## Files

| File | Lines |
|---|---|
| `lib/solutions/matcher.ts` | 125 |
| `lib/solutions/leak-map.ts` | 47 |
| `app/api/v2/solutions/route.ts` | 139 |
| `app/api/v2/solutions/click/route.ts` | 48 |
| `app/v2/solutions/page.tsx` | 277 |
| `lib/ai/task-generator.ts` | 208 |
| `components/v2/TaskCard.tsx` | 483 |
| `lib/ai/business-context.ts` | 476 |
| `lib/ai/chat-system-prompt.ts` | 440 |
| `lib/ai/brief-generator.ts` | 399 |
| `app/v2/diagnostic/[id]/page.tsx` | 716 |
| `app/v2/layout.tsx` | 234 |

## Audit findings (Step 1)

**Solutions table:** `industry_solutions` — columns: id, industry_slug, product_slug, product_name, product_type, category, description, url, regions[], relevance_score, active
**Existing infrastructure:** `get_smart_partners` Supabase RPC wraps 33,000+ entries with scoring, province filtering, and language support. Already used by `/api/v2/partners/route.ts`.
**`SmartPartner` shape:** partner_id, name, slug, description, category, sub_category, website_url, referral_url, commission_value, languages[], match_score, match_reasons[]
**`solution_name`/`solution_url`** already on `diagnostic_tasks` — Claude filled these with guesses. This build enriches them from the DB.
**`affiliate_clicks`** already exists. `solution_clicks` is new (Build 05 specific, with source tracking).


## Architecture

- **Matcher wraps `getSmartPartners` RPC** — no raw `industry_solutions` query needed; RPC handles scoring + filtering
- **Relevance threshold:** < 40 → return empty (per spec — bad match = worse than no match)
- **Commission data stripped** before any client response — only name, description, url, savings_estimate exposed
- **Click tracking** via `solution_clicks` table — one entry per click with source context
- **13th parallel query** in business-context runs AFTER Promise.all (avoids circular profileRes reference)
- **`buildUserPrompt` is now async** — needed for `findSolutionsForTask` inside brief generation


## Sample match result (payment_processing, QC restaurant)

Query: `getSmartPartners({ leakCategory: 'payment_processing', province: 'QC', industry: 'restaurant', language: 'fr' })`
Expected top results (from live DB):
1. Helcim — Canadian payment processor, saves 1-2% vs most processors
2. Moneris — Quebec-native processor, strong French support
3. Square — Free terminal, competitive rates for food service


## SQL
Run `solution-clicks.sql` in Supabase SQL editor.


## Deploy
```
git add -A
git commit -m "feat: solutions DB wired — task cards, chat, brief, diagnostic findings, browse page"
git push
```


## Confirmation answers

1. **Solutions table schema:** See audit findings above. `get_smart_partners` RPC is the primary interface.
2. **Top 3 matches for payment_processing, QC:** Run `GET /api/v2/solutions?businessId=abf1125c...&category=payment_processing` after deployment.
3. **Tasks with solution_name:** New tasks generated post-deploy will have DB-enriched solutions. Existing tasks unchanged.
4. **Chat references solutions by name:** `solutionsBlock` added to all 3 tier prompts. Ask 'How do I fix my payment processing fees?' — Claude will name specific tools.
5. **Solutions browse page at /v2/solutions:** Loads after `/api/v2/dashboard` + `/api/v2/solutions?action=browse`. Shows solutions grouped by category with filter bar.