import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED_PAGES = [
  "/v2/dashboard", "/v2/diagnostic", "/v2/obligations", "/v2/leaks",
  "/v2/settings", "/v2/onboarding", "/v2/checkout",
  "/v2/chat", "/v2/programs", "/v2/integrations", "/v2/tour",
  "/v2/collect", "/v2/tier3", "/v2/business",
  "/v2/history", "/v2/solutions", "/v2/faq",
  "/dashboard", "/scan", "/settings", "/stats", "/personal",
  "/intelligence-hub", "/industry", "/analytics", "/trending",
  "/exports", "/integrations", "/contracts", "/tasks",
  "/benchmarks", "/clients", "/recovery", "/tier3", "/admin",
];

const PUBLIC_API = [
  "/api/register", "/api/auth", "/api/debug", "/api/webhooks",
  "/api/cron", "/api/prescan", "/api/demo",
  "/api/v1/partner", "/api/share", "/api/v3",
  "/api/v2/prescan",
  "/api/rep/client-access",
  "/join",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // ── Country detection — fruxal.com = US, fruxal.ca = CA ──────────────────
  const host = req.headers.get("host") || "";
  const isUSPlatform = host.includes("fruxal.com") && !host.includes("fruxal.ca");
  const country = isUSPlatform ? "US" : "CA";

  // ── Rep portal — completely bypass ALL middleware logic, pass through raw ──
  // Must return NextResponse.next() with NO additional headers so Set-Cookie
  // from the verify route handler is never stripped.
  if (pathname.startsWith("/rep") || pathname.startsWith("/api/rep")) {
    return NextResponse.next();
  }

  // ── Accountant portal — same bypass pattern as rep ───────────────────────
  if (pathname.startsWith("/accountant") || pathname.startsWith("/api/accountant")) {
    return NextResponse.next();
  }

  // /dashboard → rewrite to /v2/dashboard
  if (pathname.startsWith("/dashboard")) {
    const url = req.nextUrl.clone();
    url.pathname = "/v2" + pathname;
    return NextResponse.rewrite(url);
  }

  const isProtectedPage = PROTECTED_PAGES.some(p => pathname.startsWith(p));
  const isJoinPage = pathname.startsWith("/join");
  const isApiRoute      = pathname.startsWith("/api/");
  const isPublicApi     = PUBLIC_API.some(p => pathname.startsWith(p));
  const isProtectedApi  = isApiRoute && !isPublicApi;

  if (!isProtectedPage && !isProtectedApi || isJoinPage) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // Set country cookie so client components and API routes can read it
  response.cookies.set("fruxal_country", country, {
    httpOnly: false,  // readable by client JS
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/scan/:path*",
    "/settings/:path*",
    "/stats/:path*",
    "/personal/:path*",
    "/intelligence-hub/:path*",
    "/industry/:path*",
    "/analytics/:path*",
    "/trending/:path*",
    "/exports/:path*",
    "/integrations/:path*",
    "/contracts/:path*",
    "/tasks/:path*",
    "/tier3/:path*",
    "/admin/:path*",
    "/v2/:path*",
    "/api/:path*",
    "/rep/:path*",
    "/accountant/:path*",
    "/rep",
  ],
};
