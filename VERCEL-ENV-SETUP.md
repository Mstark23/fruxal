# CRITICAL: Set NEXTAUTH_URL in Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these if not already set:

| Variable | Value | Environments |
|----------|-------|-------------|
| `NEXTAUTH_URL` | `https://leakandgrow.com` (your actual domain) | Production |
| `NEXTAUTH_URL` | `https://your-preview-url.vercel.app` | Preview (optional) |
| `NEXTAUTH_SECRET` | (same value as in .env) | All |

**Why this matters:**
Without NEXTAUTH_URL set to the actual production domain, JWT session cookies
may not persist properly. The auto-detect in auth.ts uses VERCEL_PROJECT_PRODUCTION_URL
as fallback, but explicitly setting it is more reliable.

After adding, trigger a new deployment (Settings → Deployments → Redeploy).
