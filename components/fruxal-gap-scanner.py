#!/usr/bin/env python3
"""
Fruxal Codebase Gap Scanner
Checks all API routes and pages for known bug classes systematically.
"""

import os, re, json
from pathlib import Path
from collections import defaultdict

BASE = Path("/home/claude/fruxal/fruxal-main")
API  = BASE / "app/api"
PAGES = BASE / "app"
LIB  = BASE / "lib"

findings = []

def add(severity, category, file, line, issue, detail=""):
    findings.append({
        "sev": severity,   # CRITICAL / HIGH / MEDIUM / LOW
        "cat": category,
        "file": str(file).replace(str(BASE)+"/", ""),
        "line": line,
        "issue": issue,
        "detail": detail,
    })

def read(path):
    try:
        with open(path) as f:
            return f.read(), f.readlines() if False else open(path).readlines()
    except:
        return "", []

def lines_of(path):
    try:
        with open(path) as f:
            return f.readlines()
    except:
        return []

def content_of(path):
    try:
        return open(path).read()
    except:
        return ""

# ═══════════════════════════════════════════════════════════════════
# SCANNER 1 — Security: Missing ownership/auth checks in API routes
# ═══════════════════════════════════════════════════════════════════
def scan_auth(path):
    c = content_of(path)
    rel = str(path).replace(str(BASE)+"/", "")

    # Route has auth token check
    has_auth = "getToken" in c or "getServerSession" in c
    if not has_auth:
        return  # public route — skip

    # Checks businessId in body but doesn't verify ownership
    if "businessId" in c and ".eq(\"business_id\", businessId)" in c:
        if ".eq(\"user_id\"" not in c and ".eq(\"owner_user_id\"" not in c:
            add("CRITICAL", "Security/IDOR",
                rel, 0,
                "businessId used in DB query without ownership check",
                "eq(business_id, businessId) but no eq(user_id, ...) guard")

    # Route reads a UUID param without tying to authenticated user
    if "[id]" in str(path):
        if ".eq(\"id\"" in c or ".eq('id'" in c:
            if ".eq(\"user_id\"" not in c and ".eq(\"owner_user_id\"" not in c:
                add("HIGH", "Security/IDOR",
                    rel, 0,
                    "Dynamic [id] route fetches record without user ownership check",
                    "Consider adding .eq(user_id, userId) to the query")

# ═══════════════════════════════════════════════════════════════════
# SCANNER 2 — Security: Webhook signature verification
# ═══════════════════════════════════════════════════════════════════
def scan_webhooks(path):
    c = content_of(path)
    rel = str(path).replace(str(BASE)+"/", "")
    if "webhook" not in rel.lower():
        return
    if "stripe" in rel.lower():
        if "constructEvent" not in c:
            add("CRITICAL", "Security/Webhook",
                rel, 0,
                "Stripe webhook missing signature verification",
                "stripe.webhooks.constructEvent() not found")
    if "shopify" in rel.lower():
        if "hmac" not in c.lower() and "createHmac" not in c:
            add("HIGH", "Security/Webhook",
                rel, 0,
                "Shopify webhook may be missing HMAC verification")

# ═══════════════════════════════════════════════════════════════════
# SCANNER 3 — Security: Exposed secrets / env vars
# ═══════════════════════════════════════════════════════════════════
def scan_secrets(path):
    c = content_of(path)
    rel = str(path).replace(str(BASE)+"/", "")
    lines = c.split("\n")
    for i, line in enumerate(lines):
        # Hardcoded secrets (not env vars)
        if re.search(r'(sk_live|rk_live|whsec_|sk_test)[_a-zA-Z0-9]{10,}', line):
            add("CRITICAL", "Security/Secret", rel, i+1,
                "Hardcoded Stripe key detected", line.strip()[:80])
        if re.search(r'(password|secret|api_key)\s*[:=]\s*["\'][^"\']{8,}["\']', line, re.I):
            if "process.env" not in line and "NEXT_PUBLIC" not in line:
                add("HIGH", "Security/Secret", rel, i+1,
                    "Potential hardcoded credential", line.strip()[:80])

# ═══════════════════════════════════════════════════════════════════
# SCANNER 4 — API: Missing maxDuration on AI/long routes
# ═══════════════════════════════════════════════════════════════════
def scan_max_duration(path):
    c = content_of(path)
    rel = str(path).replace(str(BASE)+"/", "")
    uses_ai = "anthropic" in c.lower() or "openai" in c.lower()
    uses_stripe = "stripe" in c.lower() and ("retrieve" in c or "create" in c)
    uses_supabase_heavy = c.count("await supabaseAdmin") > 5
    has_duration = "maxDuration" in c

    if (uses_ai or uses_stripe) and not has_duration:
        add("HIGH", "Performance/Timeout",
            rel, 0,
            "AI or Stripe route missing maxDuration export",
            "Will hit Vercel's default 10s limit on Hobby plan")

# ═══════════════════════════════════════════════════════════════════
# SCANNER 5 — API: Unguarded .toLocaleString() / crashes
# ═══════════════════════════════════════════════════════════════════
def scan_null_crashes(path):
    c = content_of(path)
    rel = str(path).replace(str(BASE)+"/", "")
    lines = c.split("\n")
    for i, line in enumerate(lines):
        # .toLocaleString() on potentially undefined value without null guard
        if ".toLocaleString()" in line:
            # Check if it's guarded
            if "?." not in line and "|| 0" not in line and "?? 0" not in line:
                # Skip if it's on a literal number
                if not re.search(r'\d+\.toLocaleString', line):
                    add("MEDIUM", "Crash/NullSafety", rel, i+1,
                        "Unguarded .toLocaleString() may crash on undefined",
                        line.strip()[:100])
        # Direct array access without length check
        if re.search(r'\w+\[0\]\.([\w]+)', line) and "?.length" not in line and "if (" not in line:
            pass  # too noisy, skip

# ═══════════════════════════════════════════════════════════════════
# SCANNER 6 — Frontend: isFR / lang used in useEffect (timing bug)
# ═══════════════════════════════════════════════════════════════════
def scan_lang_timing(path):
    c = content_of(path)
    rel = str(path).replace(str(BASE)+"/", "")
    if "page.tsx" not in str(path):
        return
    lines = c.split("\n")
    in_effect = False
    depth = 0
    for i, line in enumerate(lines):
        if "useEffect(" in line:
            in_effect = True
            depth = 0
        if in_effect:
            depth += line.count("{") - line.count("}")
            if depth <= 0 and i > 0:
                in_effect = False
            # isFR or isFR used inside useEffect to set state
            if ("isFR" in line or "lang ===" in line) and ("set" in line) and "useState" not in line:
                add("MEDIUM", "UX/LangTiming", rel, i+1,
                    "isFR/lang used inside useEffect to set state — stale on first render",
                    "Store both EN+FR versions; resolve at render time using isFR")

# ═══════════════════════════════════════════════════════════════════
# SCANNER 7 — Frontend: setInterval never cleared (memory leak)
# ═══════════════════════════════════════════════════════════════════
def scan_interval_leak(path):
    c = content_of(path)
    rel = str(path).replace(str(BASE)+"/", "")
    if "page.tsx" not in str(path) and "route.ts" not in str(path):
        return
    if "setInterval" in c:
        if "clearInterval" not in c:
            add("HIGH", "Memory/Leak", rel, 0,
                "setInterval used but clearInterval never called",
                "Add cleanup: return () => clearInterval(intervalId)")
        if "return () =>" not in c and "useEffect" in c:
            add("MEDIUM", "Memory/Leak", rel, 0,
                "useEffect with setInterval has no cleanup return function",
                "Missing: return () => { if (poll) clearInterval(poll); }")

# ═══════════════════════════════════════════════════════════════════
# SCANNER 8 — API: Rate limiter declared but not called
# ═══════════════════════════════════════════════════════════════════
def scan_dead_rate_limiter(path):
    c = content_of(path)
    rel = str(path).replace(str(BASE)+"/", "")
    # Declared with a Map
    if re.search(r'const \w+Rl\s*=\s*new Map', c) or re.search(r'const _\w+Rl\s*=\s*new Map', c):
        # Check if it's actually used
        rl_var = re.search(r'const (_?\w+[Rr]l)\s*=\s*new Map', c)
        if rl_var:
            var_name = rl_var.group(1)
            # Count uses beyond declaration
            uses = len(re.findall(re.escape(var_name), c))
            if uses <= 1:
                add("HIGH", "Security/RateLimit", rel, 0,
                    f"Rate limiter `{var_name}` declared but never called",
                    "Map is created but .get()/.set() never called in request handler")

# ═══════════════════════════════════════════════════════════════════
# SCANNER 9 — API: Fire-and-forget DB writes (.then() without await)
# ═══════════════════════════════════════════════════════════════════
def scan_fire_forget(path):
    c = content_of(path)
    rel = str(path).replace(str(BASE)+"/", "")
    lines = c.split("\n")
    for i, line in enumerate(lines):
        # supabase insert/update followed by .then() without await
        if re.search(r'supabase\w*\.(from|rpc)\(', line) and ".then(" in line:
            if "await" not in line:
                add("MEDIUM", "DataIntegrity/FireForget", rel, i+1,
                    "Fire-and-forget Supabase write — failures silently ignored",
                    line.strip()[:100])

# ═══════════════════════════════════════════════════════════════════
# SCANNER 10 — Payment: syncBusinessTier missing from payment routes
# ═══════════════════════════════════════════════════════════════════
def scan_payment_tier_sync(path):
    c = content_of(path)
    rel = str(path).replace(str(BASE)+"/", "")
    if "payment" not in rel.lower() and "checkout" not in rel.lower():
        return
    # If route writes to user_progress (payment confirmation) but not businesses.tier
    if "user_progress" in c and ("upsert" in c or "update" in c):
        if "businesses" not in c and "syncBusinessTier" not in c:
            add("HIGH", "Payment/TierSync", rel, 0,
                "Payment route updates user_progress but not businesses.tier",
                "Dashboard tier resolver reads businesses.tier first — user may see wrong dashboard")

# ═══════════════════════════════════════════════════════════════════
# SCANNER 11 — Cron: GET endpoint on cron (wider attack surface)
# ═══════════════════════════════════════════════════════════════════
def scan_cron_get(path):
    c = content_of(path)
    rel = str(path).replace(str(BASE)+"/", "")
    if "cron" not in rel.lower():
        return
    if "export async function GET" in c:
        if "return POST(req)" in c or "POST(req)" in c:
            add("LOW", "Security/Cron", rel, 0,
                "Cron route exposes GET endpoint (GET delegates to POST)",
                "Remove GET handler — Vercel crons use POST; GET widens attack surface")

# ═══════════════════════════════════════════════════════════════════
# SCANNER 12 — Frontend: process.env used directly without NEXT_PUBLIC
# ═══════════════════════════════════════════════════════════════════
def scan_env_client(path):
    c = content_of(path)
    rel = str(path).replace(str(BASE)+"/", "")
    if "page.tsx" not in str(path) and "layout.tsx" not in str(path):
        return
    lines = c.split("\n")
    for i, line in enumerate(lines):
        if "process.env." in line:
            # Find the env var name
            matches = re.findall(r'process\.env\.([A-Z_]+)', line)
            for m in matches:
                if not m.startswith("NEXT_PUBLIC_") and m not in ("NODE_ENV",):
                    add("HIGH", "Config/EnvVar", rel, i+1,
                        f"Server-only env var `{m}` used in client component",
                        "Will be undefined at runtime — use NEXT_PUBLIC_ prefix or move to API route")

# ═══════════════════════════════════════════════════════════════════
# SCANNER 13 — API: JSON.parse without try/catch
# ═══════════════════════════════════════════════════════════════════
def scan_json_parse(path):
    c = content_of(path)
    rel = str(path).replace(str(BASE)+"/", "")
    lines = c.split("\n")
    for i, line in enumerate(lines):
        if "JSON.parse(" in line and "try" not in line:
            # Check if previous 3 lines have try
            context = "".join(lines[max(0,i-3):i])
            if "try" not in context and "catch" not in context:
                add("MEDIUM", "Crash/JsonParse", rel, i+1,
                    "JSON.parse() without try/catch — will crash on malformed input",
                    line.strip()[:100])

# ═══════════════════════════════════════════════════════════════════
# SCANNER 14 — Frontend: || instead of ?? for zero-value guards
# ═══════════════════════════════════════════════════════════════════
def scan_zero_coalesce(path):
    c = content_of(path)
    rel = str(path).replace(str(BASE)+"/", "")
    if "page.tsx" not in str(path):
        return
    lines = c.split("\n")
    for i, line in enumerate(lines):
        # Pattern: someRevenue || 0 where 0 is a valid value
        if re.search(r'(revenue|salary|income|amount|value|score|count)\s*\|\|\s*0', line, re.I):
            if "??" not in line:
                add("LOW", "DataAccuracy/ZeroCoalesce", rel, i+1,
                    "|| 0 swallows legitimate zero values — use ?? 0",
                    line.strip()[:100])

# ═══════════════════════════════════════════════════════════════════
# SCANNER 15 — API: Missing CRON_SECRET check
# ═══════════════════════════════════════════════════════════════════
def scan_cron_auth(path):
    c = content_of(path)
    rel = str(path).replace(str(BASE)+"/", "")
    if "cron" not in rel.lower():
        return
    if "CRON_SECRET" not in c and "Authorization" not in c:
        add("CRITICAL", "Security/CronAuth", rel, 0,
            "Cron route has no authorization check",
            "Anyone can trigger this cron endpoint")

# ═══════════════════════════════════════════════════════════════════
# RUN ALL SCANNERS
# ═══════════════════════════════════════════════════════════════════
api_routes = list(API.rglob("route.ts"))
page_files = list(PAGES.rglob("page.tsx"))
lib_files  = list(LIB.rglob("*.ts"))
all_files  = api_routes + page_files + lib_files

print(f"Scanning {len(api_routes)} API routes, {len(page_files)} pages, {len(lib_files)} lib files...")
print(f"Total: {len(all_files)} files\n")

for f in all_files:
    scan_auth(f)
    scan_webhooks(f)
    scan_secrets(f)
    scan_max_duration(f)
    scan_null_crashes(f)
    scan_lang_timing(f)
    scan_interval_leak(f)
    scan_dead_rate_limiter(f)
    scan_fire_forget(f)
    scan_payment_tier_sync(f)
    scan_cron_get(f)
    scan_env_client(f)
    scan_json_parse(f)
    scan_zero_coalesce(f)
    scan_cron_auth(f)

# ═══════════════════════════════════════════════════════════════════
# REPORT
# ═══════════════════════════════════════════════════════════════════
by_sev = defaultdict(list)
for f in findings:
    by_sev[f["sev"]].append(f)

totals = {s: len(by_sev[s]) for s in ["CRITICAL","HIGH","MEDIUM","LOW"]}
print("=" * 70)
print(f"SCAN COMPLETE — {len(findings)} issues found")
print(f"  CRITICAL: {totals.get('CRITICAL',0)}  HIGH: {totals.get('HIGH',0)}  MEDIUM: {totals.get('MEDIUM',0)}  LOW: {totals.get('LOW',0)}")
print("=" * 70)

for sev in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]:
    group = by_sev.get(sev, [])
    if not group:
        continue
    print(f"\n{'━'*70}")
    print(f"  {sev} ({len(group)} issues)")
    print(f"{'━'*70}")
    by_cat = defaultdict(list)
    for item in group:
        by_cat[item["cat"]].append(item)
    for cat, items in sorted(by_cat.items()):
        print(f"\n  [{cat}]")
        for item in items:
            loc = f"{item['file']}:{item['line']}" if item['line'] else item['file']
            print(f"    • {item['issue']}")
            print(f"      → {loc}")
            if item['detail']:
                print(f"      ℹ {item['detail'][:120]}")

# Save JSON for further processing
with open("/home/claude/scan_results.json", "w") as f:
    json.dump(findings, f, indent=2)
print(f"\n\nFull results saved to /home/claude/scan_results.json")
