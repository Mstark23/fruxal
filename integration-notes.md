# Integration Notes — Prompt Builders v2

## What changed and why

### 1. Persona is now specific to the business
Before: "You are a Canadian small business advisor"
After:  "You are analyzing [Business Name], a [industry] business in [province] earning $[revenue]"

Claude is forced to reason about THIS business, not the generic case.
Output quality improves because the framing is concrete from token 1.

### 2. THINK BEFORE YOU WRITE JSON
Each tier now has a structured pre-reasoning block that forces Claude to walk through
the highest-leverage questions before touching the JSON schema.

Enterprise: 10 specific CCPC tax checks (salary mix, RDTOH, CDA, LCGE, passive grind, IPP, holdco, SR&ED, estate freeze, compliance)
Business: 7 checks (T4/dividend split, payroll compliance, HST, AR, insurance, SR&ED, biggest opportunity)
Solo: 5 checks (HST threshold, structure, deductions, programs, biggest opportunity)

This eliminates the main failure mode: Claude jumping to fill the schema without first
figuring out what the real issues are.

### 3. Finding quality bar
Added an explicit great vs. mediocre example per tier.
The bad example is deliberately included so Claude knows what NOT to do.
This alone improves finding specificity substantially.

### 4. Solutions — reasoning from context, not DB lookup
Replaced `affiliateList` injection with a structured `buildSolutionsBlock()` that:
- Maps province-specific compliance context (QST, WSIB, EHT, PST by province)
- Lists real Canadian tools Claude knows by tier
- Gives explicit rules: "payroll finding + has_payroll = YES → always include payroll solution"
- Instructs Claude to explain WHY in the `why` field (province + industry + what the finding is)

### 5. solutions[] replaces partner_slugs[]
Schema change: `partner_slugs: []` → `solutions: [{name, url, why, price_approx, category}]`
Data is now self-contained in the report JSON.
No DB lookup needed on render. No resolve API call per finding.

### 6. DiagCtx — remove affiliateList
Remove `affiliateList: string` from the interface.
Remove the affiliate DB fetch block (~lines 584-591 in run/route.ts).
Remove affiliateList from diagCtx object and from all three tier prompt calls.

## How to deploy

1. Replace buildSoloPrompts(), buildBusinessPrompts(), buildEnterprisePrompts() 
   with the versions in prompt-builders.ts

2. Replace buildJSONSchema() with buildJSONSchemaV2() from prompt-builders.ts
   (update the call sites in the three tier functions too)

3. Remove affiliateList from DiagCtx interface and diagCtx object

4. Delete the affiliate DB fetch block

5. In the result normalizer (~line 695), add solutions passthrough:
   findings already contain solutions[] — no extra mapping needed.

6. In detected_leaks insert (~line 735), no change needed.
   solutions[] is stored inside result_json as part of each finding.

## What stays the same
- programList (government programs still fetched from DB — this is correct)
- leakList (provincial leak detectors still fetched — good context signal)
- benchmarkList (industry benchmarks still fetched — good context)
- All JSON field names except partner_slugs → solutions
- Token budget / maxDuration unchanged
- Error handling unchanged
- Result normalization unchanged
