# Launch Setup Guide — Fruxal

## Step 1: Environment Variables

Add these to **Vercel Dashboard** (Settings > Environment Variables):

### Required (app won't work without these)

```bash
# Already set:
ANTHROPIC_API_KEY=sk-ant-...         # Claude AI — prescan + diagnostics
NEXTAUTH_SECRET=<random-string>       # Session encryption
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhb...

# MUST ADD:
NEXTAUTH_URL=https://fruxal.ca       # CHANGE FROM localhost!

# Google OAuth (sign in with Google):
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
```

### Required for payments (can skip for soft launch)

```bash
STRIPE_SECRET_KEY=sk_live_xxx         # From stripe.com/dashboard/apikeys
STRIPE_WEBHOOK_SECRET=whsec_xxx       # From stripe.com webhook endpoint config
```

### Required for emails (notifications, rep assignment, agreements)

```bash
RESEND_API_KEY=re_xxx                 # From resend.com/api-keys
RESEND_FROM_EMAIL=Fruxal <noreply@fruxal.com>  # Must verify domain in Resend
```

### Optional (can add later)

```bash
PLAID_CLIENT_ID=xxx                   # Bank data integration
PLAID_SECRET=xxx
PLAID_ENV=production

QUICKBOOKS_CLIENT_ID=xxx              # Accounting integration
QUICKBOOKS_CLIENT_SECRET=xxx
QUICKBOOKS_REDIRECT_URI=https://fruxal.ca/api/quickbooks/callback

CRON_SECRET=xxx                       # For Vercel cron jobs
ENCRYPTION_KEY=xxx                    # For Plaid/QB token encryption
FMP_API_KEY=xxx                       # Financial Modeling Prep (public companies)
ADMIN_EMAILS=you@email.com            # Comma-separated admin emails

STRIPE_CONNECT_CLIENT_ID=ca_xxx       # For Stripe Connect integration
```

---

## Step 2: Google OAuth Setup

1. Go to https://console.cloud.google.com/apis/credentials
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Application type: **Web application**
4. Name: "Fruxal"
5. Authorized JavaScript origins:
   - `https://fruxal.ca`
   - `https://fruxal.com`
   - `http://localhost:3000` (for local dev)
6. Authorized redirect URIs:
   - `https://fruxal.ca/api/auth/callback/google`
   - `https://fruxal.com/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google`
7. Copy Client ID and Client Secret to Vercel env vars

---

## Step 3: Resend Email Setup

1. Go to https://resend.com and create account
2. Add domain: `fruxal.com` (verify DNS)
3. Get API key from https://resend.com/api-keys
4. Add to Vercel:
   - `RESEND_API_KEY=re_xxx`
   - `RESEND_FROM_EMAIL=Fruxal <noreply@fruxal.com>`

---

## Step 4: Run US Seed Data in Supabase

Go to Supabase Dashboard > SQL Editor and run these in order:

1. `sql/us-obligation-rules.sql` — 25 US obligation rules (IRS deadlines, state filings)
2. `sql/us-leak-detectors.sql` — 28 US leak patterns (S-corp, QBI, R&D credit, etc.)
3. `sql/us-programs.sql` — 22 US government programs (SBA, SBIR, WOTC, etc.)

---

## Step 5: Verify Database Tables

These tables must exist. If any are missing, check the SQL migration files in the root directory.

**Core tables (check these first):**
- `business_profiles` — Most-used table (100 references)
- `users` — Auth users
- `businesses` — Business entities
- `prescan_results` — Prescan data
- `prescan_runs` — Prescan history
- `diagnostic_reports` — AI diagnostics
- `user_progress` — User state tracking

**Recovery pipeline:**
- `tier3_pipeline` — Sales pipeline
- `tier3_reps` — Sales reps
- `tier3_rep_assignments` — Rep-to-client assignments
- `tier3_engagements` — Active recovery engagements
- `tier3_confirmed_findings` — Confirmed savings
- `execution_playbooks` — Accountant work queue
- `accountants` — Accountant records

**Leak detection:**
- `obligation_rules` — Compliance obligations
- `provincial_leak_detectors` — Leak patterns
- `affiliate_partners` — Programs + partners
- `detected_leaks` — User's detected leaks
- `user_obligations` — User's tracked obligations

---

## Step 6: Vercel Domain Setup

1. In Vercel project settings > Domains:
   - Add `fruxal.ca` (primary — CA customers)
   - Add `fruxal.com` (US customers)
2. DNS: Point both domains to Vercel (CNAME or A record)
3. The middleware automatically:
   - `fruxal.com/` → rewrites to `/us` page
   - Sets `fruxal_country=US` cookie
   - `fruxal.ca/` → serves CA homepage with FR auto-detect

---

## Step 7: Stripe Setup (when ready for invoicing)

1. Create Stripe account at stripe.com
2. Get keys from Dashboard > Developers > API keys
3. Add webhook endpoint:
   - URL: `https://fruxal.ca/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
4. Add keys to Vercel env vars

---

## Step 8: Test Flows

```
[ ] fruxal.ca — CA prescan chat works (French auto-detect)
[ ] fruxal.com — US prescan chat works (English only, IRS terms)
[ ] Google sign-in works on both domains
[ ] Email/password register works
[ ] Dashboard loads with correct country
[ ] Admin panel accessible (/admin)
[ ] Admin can see users with country badges
[ ] Admin can assign rep to a user
[ ] Rep can log in and see pipeline
[ ] Agreement signing flow works
```
