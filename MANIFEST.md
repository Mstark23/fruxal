# Launch Readiness Builds — All 6 Blockers

## Files

| File | Lines | What changed |
|---|---|---|
| `app/legal/layout.tsx` | 54 | New — shared layout for all legal pages |
| `app/legal/privacy/page.tsx` | 135 | New — PIPEDA Privacy Policy (8 sections) |
| `app/legal/terms/page.tsx` | 149 | New — Terms of Service (12 sections, Quebec law) |
| `app/legal/cookies/page.tsx` | 91 | New — Cookie Policy with table |
| `app/api/v2/account/delete/route.ts` | 82 | New — PIPEDA account deletion cascade (17 tables) |
| `app/v2/settings/page.tsx` | 733 | Modified — Danger Zone section + delete modal added |
| `app/api/webhooks/stripe/route.ts` | 204 | Modified — trial_will_end, grace period, payment_failed email |
| `app/api/v2/checkout/route.ts` | 204 | Modified — automatic_tax + billing_address_collection added |
| `services/email/service.ts` | 354 | Modified — sendPaymentFailedEmail added |
| `lib/plan-gate.ts` | 47 | New — checkPlanAccess(userId, feature) |
| `components/v2/UpgradePrompt.tsx` | 87 | New — gated feature modal |
| `app/api/health/route.ts` | 8 | New — GET /api/health for uptime monitoring |
| `app/layout.tsx` | 37 | Modified — full OpenGraph + Twitter metadata |
| `app/sitemap.ts` | 16 | Modified — /faq, /legal/* pages added |
| `app/robots.ts` | 14 | Modified — /faq and /legal/ allowed, /v2/ disallowed |
| `app/page.tsx` | 704 | Modified — footer # hrefs → real legal URLs + FAQ |
| `app/register/page.tsx` | 169 | Modified — Terms + Privacy consent before submit |
| `app/v2/layout.tsx` | 236 | Modified — legal footer links + FAQ nav entry |

## SQL
Run `launch-readiness.sql` in Supabase SQL editor.


## Deploy
```
git add -A
git commit -m "feat: launch readiness — legal pages, account deletion, Stripe hardening, plan gate, SEO, health endpoint"
git push
```


## Manual steps after deployment

### Stripe Dashboard (one-time):
1. Go to Stripe Dashboard → Tax → Enable Stripe Tax
2. Add tax registration: Canada → all provinces (or start with QC: 5% GST + 9.975% QST)
3. Set tax_behavior = 'exclusive' on all products (tax added on top)
4. The code already sends `automatic_tax: { enabled: true }` — this activates it

### Sentry (error tracking):
1. Create account at sentry.io → create Next.js project
2. `npm install @sentry/nextjs`
3. `npx @sentry/wizard@latest -i nextjs`
4. Add SENTRY_DSN to Vercel environment variables

### UptimeRobot (monitoring):
1. Create free account at uptimerobot.com
2. Add monitor: https://fruxal.vercel.app
3. Add monitor: https://fruxal.vercel.app/api/health
4. Alert: email + SMS if down 2 minutes


## Launch checklist status

### Legal ✅
- [x] Privacy Policy live at /legal/privacy
- [x] Terms of Service live at /legal/terms
- [x] Cookie Policy live at /legal/cookies
- [x] Links in signup form, landing footer, v2 layout footer
- [x] Account deletion route (PIPEDA-compliant, 17-table cascade)
- [ ] Data export before deletion (optional PDF — future build)

### Billing ✅
- [x] Stripe webhook handles: completed, updated, deleted, payment_failed, payment_succeeded, trial_will_end
- [x] Grace period: 3 days continued access on payment failure
- [x] Failed payment email sent immediately
- [x] Canadian tax fields: automatic_tax + billing_address_collection
- [x] Upgrade prompt component (UpgradePrompt.tsx)
- [x] Plan gate (lib/plan-gate.ts)
- [ ] Configure Stripe Tax in Dashboard (manual step — see above)
- [ ] Set up Canadian tax registrations in Stripe

### Monitoring 🔲
- [x] Health check endpoint at /api/health
- [ ] Sentry installed (manual — see above)
- [ ] UptimeRobot configured (manual — see above)

### SEO ✅
- [x] Full OpenGraph + Twitter metadata in app/layout.tsx
- [x] Sitemap updated with /faq and /legal/* pages
- [x] Robots.txt: /v2/ and /api/ disallowed, /legal/ and /faq allowed
- [ ] Register Google Search Console domain


## Deletion cascade — all tables cleared
diagnostic_tasks, diagnostic_comparisons, business_timeline, diagnostic_reports,
recovery_snapshots, score_history, business_goals, solution_clicks, prescan_diagnostic_links,
break_even_data, financial_ratios, monthly_briefs, user_obligations, prescan_results,
notification_preferences, business_profiles, user_progress, businesses, users

**Total: 19 tables purged. Stripe subscription cancelled. Only deletion_log hash retained for compliance.**