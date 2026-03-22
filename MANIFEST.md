# BUILD IMPROVEMENT 01 — MANIFEST

## Files

| `lib/ai/business-context.ts` | 252 lines |
| `lib/ai/chat-system-prompt.ts` | 294 lines |
| `app/api/v2/chat/route.ts` | 314 lines |
| `app/v2/chat/page.tsx` | 469 lines |

## What changed in the chat route

BEFORE (old system prompt — client-assembled, fragile):
  You are the Fruxal AI Business Advisor — a no-BS financial advisor for Canadian SMBs.
  Business: {businessName from client}
  Industry: {industry from client}
  Province: {province from client}
  Financial Health Score: {score from client}
  Annual Revenue at Risk: {totalLeak from client}
  [Context sent only on FIRST message. No tasks. No recovery. No deadlines. No tier.]

AFTER: Context built server-side from 6 parallel DB queries.
System prompt is now ~600-900 tokens, tier-aware (solo/business/enterprise).
See lib/ai/chat-system-prompt.ts for full prompt content by tier.


## Model string

Hardcoded to `claude-sonnet-4-20250514` in both POST and GET handlers.


## Streaming

The original chat route did NOT use streaming (plain fetch, not SSE).
This build also uses plain fetch — streaming can be added later without breaking context injection.


## Confirm after deployment

Test with tracubrain@gmail.com — welcome message should reference 'Brian Tracy's Business'
and cite specific tasks/recovery numbers from the account.


## Deploy

```
git add -A
git commit -m "feat: advisor chat context injection — full business intelligence in every conversation"
git push
```

## Answers to spec questions

1. **Old system prompt:** Inline stub, client-assembled, sent only on first message.
   No tasks, no recovery, no deadlines, no tier. See BEFORE above.

2. **New system prompt (Tier 2 Business):** See lib/ai/chat-system-prompt.ts `buildBusinessPrompt()`.
   Includes: health score, top 5 findings with amounts, action plan status, completed fixes,
   open tasks with ROI, upcoming obligations with dates and risk levels.

3. **Token count:** Solo ~400 tokens, Business ~700 tokens, Enterprise ~900 tokens.
   Well under the 2,000 target. Findings are capped at 5, tasks at 8, deadlines at 5.

4. **Streaming:** Not implemented in the original — still not streaming. Plain JSON response.
   Context injection is fully compatible with streaming if added later.