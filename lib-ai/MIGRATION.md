# lib/ai Migration Guide

## File structure to copy into your project

```
lib/
  ai/
    client.ts
    identity.ts
    prompts/
      diagnostic/
        types.ts          ← DiagCtx interface
        schema.ts         ← buildDiagnosticSchema()
        quality-bar.ts    ← buildQualityBar()
        solution-matrix.ts← buildSolutionMatrix()
        solo.ts           ← buildSoloPrompts()
        business.ts       ← buildBusinessPrompts()
        enterprise.ts     ← buildEnterprisePrompts()
        index.ts          ← buildDiagnosticPrompts() dispatcher
      prescan/
        system.ts         ← PRESCAN_SYSTEM_PROMPT + buildPrescanSystemPrompt()
      chat/
        advisor.ts        ← buildAdvisorSystemPrompt()
      documents/
        parse.ts          ← getDocParsePrompt() + DOC_PROMPTS
      analysis/
        action-plan.ts    ← buildActionPlanSystem() + buildActionPlanUser()
        competitor.ts     ← buildCompetitorSystem() + buildCompetitorUser()
```

---

## Route-by-route migration

---

### 1. app/api/v2/diagnostic/run/route.ts
**The main one. Biggest change.**

REMOVE these imports:
```ts
// DELETE the entire local Anthropic instance:
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// DELETE the local buildJSONSchema() function (lines ~41-165)
// DELETE the local buildSoloPrompts() function
// DELETE the local buildBusinessPrompts() function
// DELETE the local buildEnterprisePrompts() function
// DELETE the local DiagCtx interface
// DELETE the local tierMaxTokens() function
// DELETE the affiliateList fetch block (~lines 584-598)
// DELETE affiliateList from diagCtx object
```

ADD these imports at the top:
```ts
import { anthropic, CLAUDE_MODEL }           from "@/lib/ai/client";
import { buildTaxContext }                   from "@/lib/ai/identity";
import { buildDiagnosticPrompts, DIAGNOSTIC_MAX_TOKENS } from "@/lib/ai/prompts/diagnostic";
import type { DiagCtx }                      from "@/lib/ai/prompts/diagnostic";
```

CHANGE the tier-specific prompt call (~line 636):
```ts
// BEFORE:
const { systemPrompt, userPrompt } =
  tier === "enterprise" ? buildEnterprisePrompts(diagCtx) :
  tier === "business"   ? buildBusinessPrompts(diagCtx)   :
                          buildSoloPrompts(diagCtx);

// AFTER:
const { systemPrompt, userPrompt } = buildDiagnosticPrompts(tier, diagCtx);
```

CHANGE tierMaxTokens call (~line 665):
```ts
// BEFORE:
max_tokens: tierMaxTokens(tier),

// AFTER:
max_tokens: DIAGNOSTIC_MAX_TOKENS[tier],
```

CHANGE taxCtx assembly (~line 606) — replace the manual taxCtxLines block with:
```ts
const taxCtx = buildTaxContext({
  province,
  hasHoldco,
  passiveOver50k,
  lcgeEligible,
  rdtohBalance,
  hasCDA,
  sredLastYear,
  employees,
  annualRevenue,
  annualPayroll: estimatedPayroll,
});
```

REMOVE affiliateList from DiagCtx and diagCtx:
```ts
// REMOVE from interface:
affiliateList: string;

// REMOVE from diagCtx object:
affiliateList,

// REMOVE the entire affiliate DB fetch block
```

NOTE: The diagCtx object still needs all other fields. Only affiliateList is removed.

---

### 2. app/api/admin/diagnostic-test/route.ts
**Currently has its own copy of the diagnostic prompt — replace it.**

REMOVE:
```ts
const anthropic = new Anthropic(...)
// The entire inline system prompt
```

ADD:
```ts
import { anthropic, CLAUDE_MODEL, TOKENS }  from "@/lib/ai/client";
import { buildDiagnosticPrompts, DIAGNOSTIC_MAX_TOKENS } from "@/lib/ai/prompts/diagnostic";
import type { DiagCtx }                     from "@/lib/ai/prompts/diagnostic";
```

Build a diagCtx from the test params, call buildDiagnosticPrompts(), pass to anthropic.messages.create().
This ensures the test harness runs the EXACT same prompt as production.

---

### 3. app/api/v3/prescan-chat/route.ts
**Replace inline buildSystemPrompt() with the lib version.**

REMOVE:
```ts
import { PRESCAN_SYSTEM_PROMPT } from '@/services/prescan-ai-prompt';
// The inline buildSystemPrompt() function
```

ADD:
```ts
import { buildPrescanSystemPrompt } from "@/lib/ai/prompts/prescan/system";
```

CHANGE:
```ts
// BEFORE:
system: buildSystemPrompt(lang || "en"),

// AFTER:
system: buildPrescanSystemPrompt(lang || "en"),
```

ALSO: update model string from 'claude-sonnet-4-20250514' to CLAUDE_MODEL from lib/ai/client.

---

### 4. app/api/v2/prescan-chat/route.ts
No change to prompt logic needed — it already uses services/v2/prescan-prompt.ts.
Only change: import anthropic from lib/ai/client instead of creating its own instance.

---

### 5. app/api/v2/chat/route.ts
**Replace inline/imported system prompt with lib version.**

ADD:
```ts
import { buildAdvisorSystemPrompt } from "@/lib/ai/prompts/chat/advisor";
```

Build an AdvisorContext from the business data you already fetch, pass to buildAdvisorSystemPrompt().
Replace the buildSystemPrompt() import from services/v2/prompt-builder.

---

### 6. app/api/v2/diagnostic/parse-doc/route.ts
**Replace inline DOC_PROMPTS dict.**

REMOVE:
```ts
const DOC_PROMPTS: Record<string, string> = { ... };
```

ADD:
```ts
import { getDocParsePrompt } from "@/lib/ai/prompts/documents/parse";
```

CHANGE:
```ts
// BEFORE:
const systemPrompt = DOC_PROMPTS[docType] || DOC_PROMPTS.financials;

// AFTER:
const systemPrompt = getDocParsePrompt(docType);
```

---

### 7. app/api/action-plan/route.ts
**Replace raw fetch + inline prompt with SDK + lib prompt.**

REMOVE:
```ts
const res = await fetch("https://api.anthropic.com/v1/messages", {...})
// The inline prompt string
```

ADD:
```ts
import { callClaudeJSON, TOKENS }            from "@/lib/ai/client";
import { buildActionPlanSystem, buildActionPlanUser } from "@/lib/ai/prompts/analysis/action-plan";
```

CHANGE:
```ts
const plan = await callClaudeJSON({
  system:    buildActionPlanSystem(),
  user:      buildActionPlanUser({ businessName: biz?.name, industry: biz?.industry, province: biz?.province || "ON", totalLeaking, findings: sorted }),
  maxTokens: TOKENS.action_plan,
});
```

---

### 8. app/api/intelligence/competitor/route.ts
**Same pattern as action-plan — replace raw fetch with SDK + lib.**

ADD:
```ts
import { callClaudeJSON, TOKENS }               from "@/lib/ai/client";
import { buildCompetitorSystem, buildCompetitorUser } from "@/lib/ai/prompts/analysis/competitor";
```

CHANGE:
```ts
const analysis = await callClaudeJSON({
  system:    buildCompetitorSystem(),
  user:      buildCompetitorUser({ businessName: biz?.name, industry: biz?.industry, province: biz?.province || "ON", annualRevenue: biz?.annual_revenue || 0, healthScore: snapshot?.healthScore || 0, totalLeaking, openFindings: open, competitors }),
  maxTokens: TOKENS.competitor,
});
```

---

## What NOT to change
- services/v2/prescan-prompt.ts — keep for prescan-chat v2 until both prescan versions are unified
- services/prescan-ai-prompt.ts — keep for now (v3 imports it; migration above handles it)
- All DB query logic in run/route.ts — stays exactly as-is
- All result normalization in run/route.ts — stays exactly as-is
- All Stripe/NextAuth/Supabase logic — unchanged

## Deployment order
1. Copy lib/ai/ into project
2. Run `tsc --noEmit` to check for type errors
3. Migrate run/route.ts (most critical)
4. Migrate diagnostic-test/route.ts (ensures test = production)
5. Migrate prescan v3
6. Migrate action-plan + competitor (quick wins)
7. Migrate chat + parse-doc
