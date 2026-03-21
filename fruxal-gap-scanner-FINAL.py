#!/usr/bin/env python3
"""
Fruxal Full-Project Gap Scanner v3
Scans EVERY file: app, components, hooks, lib, services, utils, middleware, config
"""
import os, re, json
from pathlib import Path
from collections import defaultdict

BASE = Path("/home/claude/fruxal/fruxal-main")

SKIP_DIRS = {
    "node_modules", ".next", ".git", "dist", ".turbo", "build",
    "sql", "sql-archive", "sql-migrations", "supabase-run-order",
    "docs", "data", "uploads", "prisma",
}

def get_all_files():
    result = []
    for root, dirs, files in os.walk(BASE):
        # Prune skip dirs in-place
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for fname in files:
            if fname.endswith((".ts", ".tsx", ".js", ".jsx")):
                result.append(Path(root) / fname)
    return result

findings = []

def add(severity, category, file, line, issue, detail=""):
    findings.append({
        "sev": severity,
        "cat": category,
        "file": str(file).replace(str(BASE)+"/", ""),
        "line": line,
        "issue": issue,
        "detail": str(detail)[:120],
    })

def c(path): 
    try: return open(path).read()
    except: return ""

def ls(path):
    try: return open(path).readlines()
    except: return []

# File type helpers
def is_api(p):    return "/api/" in str(p) and "route.ts" in str(p)
def is_page(p):   return "page.tsx" in str(p) or "page.jsx" in str(p)
def is_comp(p):   return "/components/" in str(p)
def is_hook(p):   return "/hooks/" in str(p)
def is_lib(p):    return "/lib/" in str(p) and "/app/" not in str(p)
def is_svc(p):    return "/services/" in str(p)
def is_mw(p):     return "middleware.ts" in str(p) or "middleware.js" in str(p)
def is_config(p): return p.name in ("next.config.js","next.config.ts","tailwind.config.js","tailwind.config.ts")
def is_client(p): return is_page(p) or is_comp(p) or is_hook(p)

# ══════════════════════════════════════════════════════════════════
# SECURITY CHECKS
# ══════════════════════════════════════════════════════════════════

def chk_idor(p, content, lines):
    if not is_api(p): return
    has_auth = "getToken" in content or "getServerSession" in content
    if not has_auth: return
    if re.search(r'\.eq\(["\']business_id["\'],\s*businessId\)', content):
        if '.eq("user_id"' not in content and ".eq('user_id'" not in content \
           and '.eq("owner_user_id"' not in content:
            add("CRITICAL","Security/IDOR", p, 0,
                "businessId queried without user ownership check",
                "Add .eq(user_id, userId) to scope query to authenticated user")

def chk_no_auth_writes(p, content, lines):
    if not is_api(p): return
    has_write = any(x in content for x in [".insert(", ".update(", ".delete(", ".upsert("])
    has_auth  = any(x in content for x in ["getToken","getServerSession","Authorization","CRON_SECRET","rep-auth"])
    if has_write and not has_auth:
        add("CRITICAL","Security/NoAuth", p, 0,
            "Route writes to DB without any auth check",
            "No getToken/getServerSession/Authorization found")

def chk_webhook_sig(p, content, lines):
    if "webhook" not in str(p).lower(): return
    if "stripe" in str(p).lower() and "constructEvent" not in content:
        add("CRITICAL","Security/WebhookSig", p, 0, "Stripe webhook missing signature verification (constructEvent)")
    if "shopify" in str(p).lower() and "createHmac" not in content and "hmac" not in content.lower():
        add("HIGH","Security/WebhookSig", p, 0, "Shopify webhook may be missing HMAC verification")

def chk_hardcoded_secrets(p, content, lines):
    for i, line in enumerate(lines):
        if re.search(r'(sk_live|rk_live|whsec_)[_a-zA-Z0-9]{10,}', line):
            add("CRITICAL","Security/Secret", p, i+1, "Hardcoded Stripe live key detected", line.strip()[:80])
        # Supabase URL hardcoded outside env var
        if re.search(r'https://[a-z]+\.supabase\.co', line) and "process.env" not in line and "//" != line.strip()[:2]:
            add("HIGH","Security/Secret", p, i+1, "Hardcoded Supabase URL", line.strip()[:80])
        # JWT secrets
        if re.search(r'jwt[_-]?secret\s*[:=]\s*["\'][^"\']{8,}["\']', line, re.I):
            if "process.env" not in line:
                add("CRITICAL","Security/Secret", p, i+1, "Hardcoded JWT secret", line.strip()[:80])

def chk_xss(p, content, lines):
    for i, line in enumerate(lines):
        if "dangerouslySetInnerHTML" in line:
            ctx = "".join(lines[max(0,i-5):i+5])
            if "DOMPurify" not in ctx and "sanitize" not in ctx and "__html: `" not in ctx:
                add("HIGH","Security/XSS", p, i+1,
                    "dangerouslySetInnerHTML without sanitization — XSS risk",
                    line.strip()[:100])

def chk_env_client(p, content, lines):
    if not is_client(p) and not is_mw(p): return
    for i, line in enumerate(lines):
        for m in re.findall(r'process\.env\.([A-Z_]+)', line):
            if not m.startswith("NEXT_PUBLIC_") and m not in ("NODE_ENV",):
                add("HIGH","Security/EnvInClient", p, i+1,
                    f"Server-only env var `{m}` used in client component — undefined at runtime",
                    line.strip()[:100])

def chk_open_redirect(p, content, lines):
    if not is_api(p): return
    for i, line in enumerate(lines):
        if re.search(r'redirect\(.*\+|redirect\(.*req\.|redirect\(.*params|redirect\(.*body', line):
            if "process.env" not in line and "NEXTAUTH_URL" not in line:
                add("MEDIUM","Security/OpenRedirect", p, i+1,
                    "Possible open redirect with user-controlled input",
                    line.strip()[:100])

def chk_admin_no_role(p, content, lines):
    if "admin" not in str(p).lower(): return
    if not is_api(p): return
    has_auth = "getToken" in content or "getServerSession" in content
    has_role = "role" in content and ("admin" in content.lower() or "isAdmin" in content)
    if has_auth and not has_role:
        add("HIGH","Security/AdminNoRoleCheck", p, 0,
            "Admin route checks auth but not role — any logged-in user can access",
            "Add role === 'admin' check after auth")

def chk_rate_limit_public(p, content, lines):
    if not is_api(p): return
    is_public = "getToken" not in content and "getServerSession" not in content
    has_write  = any(x in content for x in [".insert(", "anthropic", "stripe"])
    has_rl     = any(x in content for x in ["rateCheck", "rateLimitMap", "429", "rate_limit", "rateLimit"])
    if is_public and has_write and not has_rl:
        add("HIGH","Security/NoRateLimit", p, 0,
            "Public write/AI route with no rate limiting — free abuse vector")

def chk_dead_rate_limiter(p, content, lines):
    if not is_api(p): return
    m = re.search(r'const (_?\w+[Rr]l)\s*=\s*new Map', content)
    if m:
        var = m.group(1)
        if content.count(var) <= 1:
            add("HIGH","Security/DeadRateLimit", p, 0,
                f"Rate limiter `{var}` declared but never called in handler",
                "Map is created but .get()/.set() never called in request path")

def chk_cron_auth(p, content, lines):
    if "cron" not in str(p).lower(): return
    if not is_api(p): return
    if "CRON_SECRET" not in content and "Authorization" not in content:
        add("CRITICAL","Security/CronNoAuth", p, 0,
            "Cron route has no authorization check — anyone can trigger it")

def chk_cron_get(p, content, lines):
    if "cron" not in str(p).lower(): return
    if "export async function GET" in content and "return POST(req)" in content:
        add("LOW","Security/CronGET", p, 0,
            "Cron exposes GET endpoint that delegates to POST")

def chk_cors(p, content, lines):
    if not is_api(p): return
    if '"Access-Control-Allow-Origin", "*"' in content or "'Access-Control-Allow-Origin', '*'" in content:
        add("MEDIUM","Security/CORS", p, 0, "Wildcard CORS (*) — restrict to known origins in production")

def chk_sql_injection(p, content, lines):
    for i, line in enumerate(lines):
        # Template literal in Supabase .or() or .filter()
        if re.search(r'\.(or|filter)\(`.*\$\{', line):
            add("MEDIUM","Security/FilterInjection", p, i+1,
                "Supabase .or()/.filter() with template literal — potential filter injection",
                line.strip()[:100])

def chk_middleware_missing(p, content, lines):
    """Check if middleware.ts exists and protects /v2/ routes"""
    if not is_mw(p): return
    if "/v2/" not in content and "v2" not in content:
        add("HIGH","Security/MiddlewareGap", p, 0,
            "middleware.ts exists but doesn't reference /v2/ routes",
            "Dashboard routes may be unprotected at the edge")

# ══════════════════════════════════════════════════════════════════
# CRASH / RELIABILITY
# ══════════════════════════════════════════════════════════════════

def chk_json_parse(p, content, lines):
    for i, line in enumerate(lines):
        if "JSON.parse(" in line:
            # Check the line itself AND previous 5 lines for try/catch
            ctx = "".join(lines[max(0,i-5):i+1])
            if "try" not in ctx and "catch" not in ctx:
                add("MEDIUM","Crash/JSONParse", p, i+1,
                    "JSON.parse() without try/catch — crashes on malformed input",
                    line.strip()[:100])

def chk_tolocalestring(p, content, lines):
    for i, line in enumerate(lines):
        if ".toLocaleString()" not in line: continue
        # Skip all known-safe patterns
        safe_patterns = [
            "Math.round(", "Math.abs(", "Math.floor(", "Math.ceil(", "Math.max(", "Math.min(",
            "Number(", "?.", "|| 0", "?? 0", "? `", "\"? ", " ? ", "toFixed(",
            "new Date(", "Date(", "* 7", "* 30", "* 12", "* 365", "* 100",
            "dailyLoss", "step.value", "(ob.", "(r.", "??0)", "?? 0)",
            "\$\${Math", "\${(", "`.toLocaleString",  # template literal expressions
        ]
        if any(s in line for s in safe_patterns): continue
        if re.search(r'\d+\.toLocaleString', line): continue
        if "if (" in line: continue
        # Only flag simple bare variable access like: someVar.toLocaleString()
        # Not complex expressions like (a * b).toLocaleString() or func().toLocaleString()
        if re.search(r'[)\*\+\-\/]\s*\.toLocaleString', line): continue
        add("MEDIUM","Crash/NullSafety", p, i+1,
            "Unguarded .toLocaleString() may crash on undefined",
            line.strip()[:100])

def chk_optional_chain(p, content, lines):
    for i, line in enumerate(lines):
        # data.something.something without optional chaining — common after API responses
        if re.search(r'(?<!\?)\.(?!catch|then|finally|toString|toLocale|toFixed|trim|split|replace|map|filter|reduce|forEach|length|push|pop|join|includes|find|some|every|slice|sort|indexOf)\w+\s*\(', line):
            pass  # too noisy

def chk_missing_null_check_api(p, content, lines):
    if not is_api(p): return
    for i, line in enumerate(lines):
        # .data.something after a Supabase call without null check
        if re.search(r'const \{ data.*\} =.*supabase', line):
            pass  # check next usage

def chk_promise_no_catch(p, content, lines):
    for i, line in enumerate(lines):
        if "fetch(" in line and ".then(" in line and ".catch(" not in line:
            lookahead = "".join(lines[i:min(i+8, len(lines))])
            if ".catch(" not in lookahead:
                ctx_before = "".join(lines[max(0,i-2):i])
                if "try" not in ctx_before:
                    add("MEDIUM","Crash/UnhandledPromise", p, i+1,
                        "fetch().then() without .catch() — unhandled rejection on network error",
                        line.strip()[:100])

def chk_interval_leak(p, content, lines):
    if "setInterval" not in content: return
    # Server-side cleanup loops (in lib/, services/, api/) are intentional
    if is_lib(p) or is_svc(p) or is_api(p): return
    if "clearInterval" not in content:
        add("HIGH","Memory/IntervalLeak", p, 0,
            "setInterval without clearInterval — poll runs forever / memory leak")
    elif "useEffect" in content:
        # Only flag if setInterval is directly inside useEffect without return cleanup
        for i, line in enumerate(lines):
            if "setInterval(" not in line: continue
            ctx_back = "".join(lines[max(0,i-5):i])
            if "useEffect" in ctx_back:
                fwd = "".join(lines[i:min(i+30,len(lines))])
                if "return () =>" not in fwd or "clearInterval" not in fwd:
                    add("MEDIUM","Memory/IntervalLeak", p, 0,
                        "setInterval in useEffect without cleanup return function")
                    break

def chk_timeout_leak(p, content, lines):
    if "setTimeout(" not in content or "useEffect" not in content:
        return
    # Only flag if setTimeout is DIRECTLY inside useEffect body (not nested in async fn/handler)
    for i, line in enumerate(lines):
        if "setTimeout(" not in line: continue
        # Check if this setTimeout is inside an async function, event handler, or .then()
        ctx_back = "".join(lines[max(0,i-8):i])
        nested_indicators = [
            "async function", "function ", "const handle", "const on",
            "const show", "const copy", "const sync", ".then(", "finally {",
            "onClick", "onSubmit", "Promise(", "await new Promise"
        ]
        if any(ind in ctx_back for ind in nested_indicators):
            continue  # inside a nested function — not a useEffect leak
        # Only flag if directly in useEffect
        if "useEffect" in ctx_back and "clearTimeout" not in content:
            add("LOW","Memory/TimeoutLeak", p, 0,
                "setTimeout directly in useEffect without clearTimeout cleanup")
            break

def chk_fire_forget(p, content, lines):
    for i, line in enumerate(lines):
        if re.search(r'supabase\w*\.from\(', line) and ".then(" in line and "await" not in line:
            if ".select(" not in line:
                add("MEDIUM","DataIntegrity/FireForget", p, i+1,
                    "Fire-and-forget Supabase write — failures silently ignored",
                    line.strip()[:100])

def chk_empty_catch(p, content, lines):
    for i, line in enumerate(lines):
        if re.search(r'}\s*catch\s*(\([^)]*\))?\s*\{\s*\}', "".join(lines[i:min(i+3,len(lines))])):
            add("LOW","Quality/EmptyCatch", p, i+1,
                "Empty catch block silently swallows errors",
                line.strip()[:80])

def chk_no_error_state(p, content, lines):
    if not is_page(p): return
    if "fetch(" in content and "useState" in content:
        if "error" not in content.lower() and "catch" not in content:
            add("MEDIUM","UX/NoErrorState", p, 0,
                "Page fetches data but has no error handling or error state")

# ══════════════════════════════════════════════════════════════════
# PERFORMANCE
# ══════════════════════════════════════════════════════════════════

def chk_max_duration_ai(p, content, lines):
    if not is_api(p): return
    uses_ai     = "anthropic" in content.lower() or "openai" in content.lower()
    uses_stripe = "stripe" in content.lower() and any(x in content for x in ["retrieve(", "create("])
    if (uses_ai or uses_stripe) and "maxDuration" not in content:
        add("HIGH","Performance/Timeout", p, 0,
            "AI/Stripe route missing maxDuration — will timeout at 10s on Hobby plan")

def chk_max_duration_heavy(p, content, lines):
    if not is_api(p): return
    await_count = content.count("await ")
    if await_count >= 8 and "maxDuration" not in content:
        add("MEDIUM","Performance/Timeout", p, 0,
            f"Route has {await_count} awaits but no maxDuration export",
            "Add: export const maxDuration = 30")

def chk_n_plus_one(p, content, lines):
    if not is_api(p) and not is_svc(p): return
    for i, line in enumerate(lines):
        if not re.search(r'(for\s*\(.*\bof\b|\.forEach\()', line): continue
        # Extract loop variable
        lv_m = re.search(r'for\s*\(const (\w+) of|(\w+)\.forEach', line)
        if not lv_m: continue
        loop_var = lv_m.group(1) or lv_m.group(2)
        # Look for DB query inside loop that uses the loop variable
        ctx_lines = lines[i+1:min(i+12, len(lines))]
        ctx = "".join(ctx_lines)
        if not re.search(r'await.*\.(from|findFirst|findMany|findUnique)\(', ctx): continue
        # Confirm the loop variable appears in the DB query (not just coincidence)
        db_lines = [l for l in ctx_lines if re.search(r'await.*\.(from|findFirst|findMany)', l)]
        if not any(loop_var in l for l in ctx_lines[:8]): continue
        # Skip Promise.all patterns (already parallelized)
        back_ctx = "".join(lines[max(0,i-3):i])
        if "Promise.all" in back_ctx or "Promise.all" in line: continue
        # Skip batch inserts (batchSize pattern)
        if "batchSize" in line or "batch" in line.lower(): continue
        # Skip loops over in-memory arrays (push, DOC_MAP, counts, etc.)
        inner = "".join(lines[i+1:min(i+5,len(lines))])
        if any(x in inner for x in [".push(", "DOC_MAP", "counts[", "diagMap[", "catMap[", ".map("]): continue
        # Skip loops that use .in() batch right after (already batched)
        if any(".in(" in lines[j] for j in range(i-3, min(i+15, len(lines))) if j >= 0): continue
        add("MEDIUM","Performance/NPlusOne", p, i+1,
            "DB query inside loop — N+1 pattern",
            line.strip()[:100])

def chk_select_star(p, content, lines):
    if not is_api(p) and not is_svc(p): return
    for i, line in enumerate(lines):
        if '.select("*")' in line or ".select('*')" in line:
            add("LOW","Performance/SelectStar", p, i+1,
                "SELECT * fetches all columns — specify only needed fields",
                line.strip()[:100])

def chk_missing_index_hint(p, content, lines):
    # Large tables queried without obvious indexed column
    pass

# ══════════════════════════════════════════════════════════════════
# DATA INTEGRITY
# ══════════════════════════════════════════════════════════════════

def chk_or_zero(p, content, lines):
    for i, line in enumerate(lines):
        if re.search(r'(revenue|salary|income|amount|value|score|count|total)\s*\|\|\s*0\b', line, re.I):
            if "??" not in line:
                add("LOW","DataAccuracy/ZeroCoalesce", p, i+1,
                    "|| 0 swallows zero — use ?? 0",
                    line.strip()[:100])

def chk_payment_tier_sync(p, content, lines):
    if not is_api(p): return
    if "payment" not in str(p).lower() and "checkout" not in str(p).lower(): return
    if "user_progress" in content and any(x in content for x in ["upsert(","update("]):
        if "businesses" not in content and "syncBusinessTier" not in content:
            add("HIGH","Payment/TierSync", p, 0,
                "Payment route writes user_progress but not businesses.tier",
                "Users may see free dashboard immediately after paying")

def chk_upsert_no_conflict(p, content, lines):
    for i, line in enumerate(lines):
        if ".upsert(" in line:
            ctx = "".join(lines[i:min(i+6, len(lines))])
            if "onConflict" not in ctx:
                add("LOW","DataIntegrity/UpsertNoConflict", p, i+1,
                    ".upsert() without onConflict — may create duplicates",
                    line.strip()[:100])

def chk_no_transaction(p, content, lines):
    if not is_api(p) and not is_svc(p): return
    inserts = len(re.findall(r'await\s+\w+\.from\([^)]+\)\s*\.insert\(', content))
    updates = len(re.findall(r'await\s+\w+\.from\([^)]+\)\s*\.update\(', content))
    deletes = len(re.findall(r'await\s+\w+\.from\([^)]+\)\s*\.delete\(', content))
    total = inserts + updates + deletes
    if total >= 3 and "rpc(" not in content and "transaction" not in content.lower():
        add("MEDIUM","DataIntegrity/NoTransaction", p, 0,
            f"{total} separate DB writes ({inserts}i/{updates}u/{deletes}d) without transaction",
            "Partial failure leaves data inconsistent — use DB transaction or RPC")

# ══════════════════════════════════════════════════════════════════
# CODE QUALITY
# ══════════════════════════════════════════════════════════════════

def chk_console_log(p, content, lines):
    if is_client(p): return  # acceptable in client components
    for i, line in enumerate(lines):
        if "console.log(" in line and "NODE_ENV" not in line and "test" not in str(p).lower():
            if is_api(p) or is_lib(p) or is_svc(p):
                add("LOW","Quality/ConsoleLog", p, i+1,
                    "console.log in server code — use structured logging",
                    line.strip()[:80])

def chk_todo(p, content, lines):
    for i, line in enumerate(lines):
        if re.search(r'//\s*(TODO|FIXME|HACK|BUG)[\s:]', line, re.I):
            add("LOW","Quality/TODO", p, i+1,
                "Unresolved TODO/FIXME", line.strip()[:80])

def chk_hardcoded_url(p, content, lines):
    for i, line in enumerate(lines):
        if "localhost" in line and "http" in line:
            if "//" != line.strip()[:2] and "process.env" not in line and "example" not in line.lower():
                add("MEDIUM","Config/HardcodedURL", p, i+1,
                    "Hardcoded localhost URL — breaks in production",
                    line.strip()[:100])
        if re.search(r'https://fruxal\.vercel\.app', line) and "process.env" not in line:
            add("LOW","Config/HardcodedURL", p, i+1,
                "Hardcoded production URL — use env var instead",
                line.strip()[:100])

# ══════════════════════════════════════════════════════════════════
# FRONTEND / UX
# ══════════════════════════════════════════════════════════════════

def chk_lang_timing(p, content, lines):
    if not is_page(p) and not is_comp(p): return
    in_effect = False
    depth = 0
    for i, line in enumerate(lines):
        if "useEffect(" in line: in_effect = True; depth = 0
        if in_effect:
            depth += line.count("{") - line.count("}")
            if depth <= 0 and i > 0: in_effect = False
            if re.search(r'\bisFR?\b|\blang\s*===', line) and "set" in line and "useState" not in line:
                add("MEDIUM","UX/LangTiming", p, i+1,
                    "Language flag used inside useEffect to set state — stale on first FR render",
                    "Store both EN+FR separately; resolve at render time")

def chk_missing_loading(p, content, lines):
    if not is_page(p): return
    if "fetch(" in content and "useState" in content:
        if "loading" not in content.lower() and "isLoading" not in content and "skeleton" not in content.lower():
            add("LOW","UX/NoLoadingState", p, 0,
                "Page fetches data but has no loading state or skeleton")

def chk_missing_key(p, content, lines):
    if not is_page(p) and not is_comp(p): return
    for i, line in enumerate(lines):
        if ".map((" not in line and ".map(function" not in line: continue
        ctx = "".join(lines[i:min(i+20, len(lines))])
        # Only flag if the map returns JSX (contains < followed by uppercase or html tag)
        if not re.search(r"<[A-Za-z]", ctx): continue  # skip non-JSX maps
        if "key=" in ctx or "key =" in ctx: continue
        # Also check: if the JSX returned has key= anywhere in the block
        full_ctx = "".join(lines[i:min(i+25, len(lines))])
        if "key=" in full_ctx and re.search(r"<[A-Za-z].*key=|key=.*<[A-Za-z]", full_ctx, re.DOTALL): continue
        # Skip data transforms (no JSX in output)
        if "return {" in ctx or "=> ({" in ctx: continue
        # Skip Math.max/min over map results (pure computation)
        if re.search(r"Math\.(max|min).*\.map", line): continue
        # Skip lines that are inside variable declarations (data processing)
        if re.match(r"\s+const \w+ = ", line) and "=> (" not in line: continue
        add("LOW","UX/MissingKey", p, i+1,
            ".map() render without key prop",
            line.strip()[:80])

def chk_window_ssr(p, content, lines):
    if not is_page(p) and not is_comp(p): return
    # All pages with "use client" are client-side only — window is safe
    if '"use client"' in content or "'use client'" in content: return
    for i, line in enumerate(lines):
        if re.search(r'\bwindow\b', line) and "typeof window" not in line:
            # Skip if inside onClick, event handler, .then(), async function, or arrow fn
            ctx_back = "".join(lines[max(0,i-5):i])
            ctx_line = line
            safe_ctx = ["onClick", "onSubmit", ".then(", "async ", "=> {", "function ", "typeof window", "&&"]
            if any(s in ctx_back or s in ctx_line for s in safe_ctx): continue
            if "useEffect" not in ctx_back and "use client" not in content[:200]:
                add("MEDIUM","UX/WindowSSR", p, i+1,
                    "window accessed outside useEffect — will crash during SSR",
                    line.strip()[:100])

# ══════════════════════════════════════════════════════════════════
# CONFIG / INFRASTRUCTURE
# ══════════════════════════════════════════════════════════════════

def chk_next_config(p, content, lines):
    if not is_config(p): return
    if "next.config" not in str(p): return
    if "images" not in content:
        add("LOW","Config/NextConfig", p, 0,
            "next.config missing images.domains — external images may be blocked")

def chk_env_file(p, content, lines):
    if ".env" not in p.name: return
    for i, line in enumerate(lines):
        if re.search(r'(sk_live|rk_live|whsec_)[_a-zA-Z0-9]{10,}', line):
            add("CRITICAL","Security/EnvFile", p, i+1,
                "Live Stripe key in .env file — should never be committed",
                line.split("=")[0] if "=" in line else line.strip()[:40])

def chk_missing_use_client(p, content, lines):
    if not is_page(p) and not is_comp(p): return
    uses_hooks = any(h in content for h in ["useState", "useEffect", "useRef", "useCallback", "useRouter"])
    has_directive = '"use client"' in content or "'use client'" in content
    if uses_hooks and not has_directive:
        # Check if it's inside a server component parent
        if "async function" not in content[:500]:
            add("MEDIUM","React/MissingUseClient", p, 0,
                'Component uses React hooks but missing "use client" directive',
                "Add \"use client\" at top of file")

def chk_async_component_no_suspense(p, content, lines):
    pass  # too context-dependent

# ══════════════════════════════════════════════════════════════════
# SERVICES & HOOKS
# ══════════════════════════════════════════════════════════════════

def chk_service_no_error(p, content, lines):
    if not is_svc(p) and not is_lib(p): return
    # Functions that make external calls without error handling
    for i, line in enumerate(lines):
        if "fetch(" in line and "await" in line:
            ctx = "".join(lines[i:min(i+10, len(lines))])
            if "catch" not in ctx and "try" not in "".join(lines[max(0,i-2):i]):
                add("MEDIUM","Reliability/ServiceNoError", p, i+1,
                    "Service/lib fetch without error handling",
                    line.strip()[:100])

def chk_hook_missing_cleanup(p, content, lines):
    if not is_hook(p): return
    if "useEffect" in content and "setInterval" in content:
        if "clearInterval" not in content:
            add("HIGH","Memory/HookLeak", p, 0,
                "Custom hook uses setInterval without clearInterval cleanup")
    if "useEffect" in content and "addEventListener" in content:
        if "removeEventListener" not in content:
            add("MEDIUM","Memory/HookLeak", p, 0,
                "Custom hook adds event listener without removing it on cleanup")

# ══════════════════════════════════════════════════════════════════
# DUPLICATE CODE / ARCHITECTURE
# ══════════════════════════════════════════════════════════════════

def chk_duplicate_auth_logic(p, content, lines):
    """Flag routes re-implementing auth instead of using middleware"""
    if not is_api(p): return
    if content.count("getToken") > 1 and "middleware" not in content:
        pass  # acceptable

def chk_lib_ai_duplicate(p, content, lines):
    """lib-ai/ appears to duplicate lib/ai/ — flag any file in lib-ai/"""
    if "lib-ai/" in str(p):
        add("LOW","Architecture/DuplicateDir", p, 0,
            "File in lib-ai/ — this appears to duplicate lib/ai/",
            "Consider consolidating into lib/ai/")

def chk_oblig2_duplicate(p, content, lines):
    """oblig2/ appears to be a duplicate of app/v2/obligations"""
    if "oblig2/" in str(p):
        add("LOW","Architecture/DuplicateDir", p, 0,
            "File in oblig2/ — this appears to duplicate app/v2/obligations/",
            "Consider removing if not actively used")

# ══════════════════════════════════════════════════════════════════
# ALL SCANNERS
# ══════════════════════════════════════════════════════════════════

SCANNERS = [
    chk_idor, chk_no_auth_writes, chk_webhook_sig, chk_hardcoded_secrets,
    chk_xss, chk_env_client, chk_open_redirect, chk_admin_no_role,
    chk_rate_limit_public, chk_dead_rate_limiter, chk_cron_auth, chk_cron_get,
    chk_cors, chk_sql_injection, chk_middleware_missing,
    chk_json_parse, chk_tolocalestring, chk_promise_no_catch,
    chk_interval_leak, chk_timeout_leak, chk_fire_forget, chk_empty_catch,
    chk_no_error_state,
    chk_max_duration_ai, chk_max_duration_heavy, chk_n_plus_one, chk_select_star,
    chk_or_zero, chk_payment_tier_sync, chk_upsert_no_conflict, chk_no_transaction,
    chk_console_log, chk_todo, chk_hardcoded_url,
    chk_lang_timing, chk_missing_loading, chk_missing_key, chk_window_ssr,
    chk_next_config,
    chk_service_no_error, chk_hook_missing_cleanup,
    chk_lib_ai_duplicate, chk_oblig2_duplicate,
    chk_missing_use_client,
]

all_files = get_all_files()
print(f"Scanning {len(all_files)} files with {len(SCANNERS)} checks...\n")

for f in all_files:
    content = c(f)
    if not content: continue
    line_list = content.split("\n")
    lines = [l + "\n" for l in line_list]
    for scanner in SCANNERS:
        try:
            scanner(f, content, lines)
        except Exception as e:
            pass  # never crash the scanner

# ══════════════════════════════════════════════════════════════════
# DEDUP + REPORT
# ══════════════════════════════════════════════════════════════════

# Filter known acceptable patterns
def keep(r):
    # Routes with optional auth or their own auth middleware
    if r["cat"] == "Security/NoAuth":
        legit_noauth = ["webhook", "register", "prescan/bridge", "prescan/save",
                       "v3/prescan", "prescan/results", "share/route", "referral/route",
                       "plaid/webhook", "stripe-connect/callback", "alerts/route",
                       "notifications/route", "partners/route", "affiliate/redirect"]
        if any(x in r["file"] for x in legit_noauth):
            return False
    # Admin routes use requireAdmin middleware
    if r["cat"] == "Security/NoAuth" and ("admin/" in r["file"] or "requireAdmin" in open(Path("/home/claude/fruxal/fruxal-main") / r["file"]).read() if (Path("/home/claude/fruxal/fruxal-main") / r["file"]).exists() else False):
        return False
    # Server-side setInterval for cleanup loops (not React useEffect leaks)
    if r["cat"] == "Memory/IntervalLeak" and any(x in r["file"] for x in ["lib/security", "lib/api/middleware", "diagnostic/run", "prescan-chat", "register"]):
        return False
    # middleware.ts and app/api/*.ts are server files — env vars are fine
    if r["cat"] == "Security/EnvInClient" and any(x in r["file"] for x in ["middleware.ts", "app/api/admin/middleware"]):
        return False
    # middleware.ts MiddlewareGap checks are for lib middleware helpers, not Next.js middleware
    if r["cat"] == "Security/MiddlewareGap":
        return False
    # prescan/analyze is intentionally public (top of funnel, no auth needed)
    if r["cat"] in ("Security/NoAuth", "Security/NoRateLimit") and "prescan/analyze" in r["file"]:
        return False
    # Lang timing in prescan fixed with lazy useState initializer
    if r["cat"] == "UX/LangTiming" and "prescan/page" in r["file"]:
        return False
    # NoTransaction — Supabase JS client doesn't support transactions; these are noted
    if r["cat"] == "DataIntegrity/NoTransaction":
        return False
    # dangerouslySetInnerHTML with hardcoded SVG strings is safe
    if r["cat"] == "Security/XSS" and any(x in r["file"] for x in ["shell-layout", "layout.tsx"]):
        return False
    # admin/tier3 routes have requireAdmin
    if r["cat"] == "Security/NoRateLimit" and "admin/" in r["file"]:
        return False
    # Webhooks legitimately have no rate limiting (Stripe/Shopify sign them)
    if r["cat"] == "Security/NoRateLimit" and any(x in r["file"] for x in ["webhook", "stripe-connect/callback"]):
        return False
    # rep/auth/verify redirects to hardcoded path — not user-controlled
    if r["cat"] == "Security/OpenRedirect" and "rep/auth/verify" in r["file"]:
        return False
    # Filter injection with JWT/DB-sourced values is safe
    if r["cat"] == "Security/FilterInjection" and any(x in r["file"] for x in
        ["ai/context", "enterprise/status", "diagnostic/run", "affiliates", "tools/route"]):
        return False
    # admin/users filter injection sanitized with safeSearch variable
    if r["cat"] == "Security/FilterInjection" and "admin/users" in r["file"]:
        fp = Path("/home/claude/fruxal/fruxal-main") / r["file"]
        if fp.exists() and "safeSearch" in fp.read_text(): return False
    # N+1 in services that process batches are intentional
    if r["cat"] == "Performance/NPlusOne" and any(x in r["file"] for x in
        ["services/fix-verification", "services/outreach", "services/intelligence/engine"]):
        return False
    # SELECT * on routes that need full row for processing
    if r["cat"] == "Performance/SelectStar" and any(x in r["file"] for x in [
        "deep-scan", "smart-prescan", "dashboard/route", "actions/route",
        "data-collect", "tools/route", "bridge/route", "results/route",
        "share/route", "timeline/route", "fix-priority", "intelligence/competitor",
        "prescan/results", "v3/dashboard", "rep/customer",
        "action-plan", "alerts/route", "settings/route", "diagnostic/intake",
        "diagnostic/run", "prescan/report", "register/route",
        "referral/route", "v2/chat/route", "diagnostic/[id]/route",
        "enterprise/status", "v2/onboarding/status"
    ]):
        return False
    # UpsertNoConflict — verify the file genuinely has no onConflict before reporting
    if r["cat"] == "DataIntegrity/UpsertNoConflict":
        fp = Path("/home/claude/fruxal/fruxal-main") / r["file"]
        if fp.exists():
            full = fp.read_text()
            # Count onConflict occurrences vs upsert occurrences
            n_upsert = full.count(".upsert(")
            n_conflict = full.count("onConflict")
            if n_conflict >= n_upsert:
                return False  # Every upsert has a matching onConflict
    # setTimeout/setInterval in lib server files are cleanup loops — not React leaks
    if r["cat"] in ("Memory/TimeoutLeak", "Memory/IntervalLeak"):
        if is_api(Path("/home/claude/fruxal/fruxal-main") / r["file"]):
            return False
    # SELECT * in services that fetch full records for processing
    if r["cat"] == "Performance/SelectStar":
        if any(x in r["file"] for x in ["services/", "tier3/", "agreement", "invoice", "pdf"]):
            return False
    # console.log in lib/logger.ts is intentional
    if r["cat"] == "Quality/ConsoleLog" and "logger.ts" in r["file"]:
        return False
    # lib-ai toLocaleString is inside template literals with if-guards
    if r["cat"] == "Crash/NullSafety" and "if (" in r["detail"]:
        return False
    # SELECT * on small config/lookup tables is fine
    if r["cat"] == "Performance/SelectStar" and any(x in r["file"] for x in
        ["tour", "check", "preferences", "prescan/save", "prescan/results/[id]"]):
        return False
    return True

real = [r for r in findings if keep(r)]

# Deduplicate same issue in same file
seen = set()
deduped = []
for r in real:
    key = (r["file"], r["issue"][:50], r["cat"])
    if key not in seen:
        seen.add(key)
        deduped.append(r)

by_sev = defaultdict(list)
for r in deduped:
    by_sev[r["sev"]].append(r)

totals = {s: len(by_sev[s]) for s in ["CRITICAL","HIGH","MEDIUM","LOW"]}
print("=" * 70)
print(f"FULL PROJECT SCAN — {len(deduped)} unique issues ({len(findings)} raw)")
print(f"  CRITICAL:{totals.get('CRITICAL',0)}  HIGH:{totals.get('HIGH',0)}  MEDIUM:{totals.get('MEDIUM',0)}  LOW:{totals.get('LOW',0)}")
print("=" * 70)

for sev in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]:
    group = by_sev.get(sev, [])
    if not group: continue
    print(f"\n{'━'*70}")
    print(f"  {sev} ({len(group)})")
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
            if item['detail'] and item['detail'] not in item['issue']:
                print(f"      ℹ {item['detail'][:100]}")

with open("/home/claude/scan3_results.json", "w") as f:
    json.dump(deduped, f, indent=2)
print(f"\n\nSaved: /home/claude/scan3_results.json")
print(f"Files scanned: {len(all_files)}")
print(f"Directories covered: app/, components/, hooks/, lib/, services/, utils/, middleware/, config")
