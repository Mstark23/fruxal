// =============================================================================
// API MIDDLEWARE STACK
// =============================================================================
// LAW 2: Security is every line. LAW 6: Errors are features.
//
// Usage in any route:
//   import { withAuth, withValidation, apiError, apiSuccess } from "@/lib/api/middleware";
//   
//   export async function POST(req: Request) {
//     const auth = await withAuth(req);
//     if (auth.error) return auth.error;
//     
//     const body = await withValidation(req, MyZodSchema);
//     if (body.error) return body.error;
//     
//     // ... business logic
//     return apiSuccess({ data: result });
//   }
// =============================================================================

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z, ZodSchema } from "zod";
import { verifyBusinessOwnership } from "@/lib/db/service";

// ─── Structured Error Response (LAW 6) ───────────────────────────────────────
export interface ApiError {
  error: string;
  code: string;
  details?: any;
}

export function apiError(message: string, code: string, status: number = 400, details?: any): NextResponse<ApiError> {
  return NextResponse.json({ error: message, code, details }, { status });
}

export function apiSuccess<T>(data: T, status: number = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

// ─── Auth Middleware (LAW 2) ─────────────────────────────────────────────────
export interface AuthContext {
  userId: string;
  email: string;
  name?: string;
}

export async function withAuth(req?: Request): Promise<{ ctx: AuthContext | null; error: NextResponse | null }> {
  try {
    // Dynamic import to avoid circular deps
    const { authOptions } = await import("@/lib/auth");
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return { ctx: null, error: apiError("Authentication required", "AUTH_REQUIRED", 401) };
    }

    return {
      ctx: {
        userId: (session.user as any).id || session.user.email,
        email: session.user.email,
        name: session.user.name || undefined,
      },
      error: null,
    };
  } catch {
    return { ctx: null, error: apiError("Authentication failed", "AUTH_FAILED", 401) };
  }
}

// ─── Business Ownership Verification (LAW 2) ────────────────────────────────
export async function withBusinessAuth(req: Request, businessId: string): Promise<{ ctx: AuthContext | null; error: NextResponse | null }> {
  const auth = await withAuth(req);
  if (auth.error) return auth;

  const owns = await verifyBusinessOwnership(auth.ctx!.userId, businessId);
  if (!owns) {
    return { ctx: null, error: apiError("You don't have access to this business", "FORBIDDEN", 403) };
  }

  return auth;
}

// ─── Input Validation (LAW 2 + 6) ───────────────────────────────────────────
export async function withValidation<T extends ZodSchema>(
  req: Request,
  schema: T
): Promise<{ data: z.infer<T> | null; error: NextResponse | null }> {
  try {
    let body: any;
    const contentType = req.headers.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      // Try URL params for GET requests
      const url = new URL(req.url);
      body = Object.fromEntries(url.searchParams);
    }

    const result = schema.safeParse(body);
    if (!result.success) {
      const issues = result.error.issues.map(i => `${i.path.join(".")}: ${i.message}`);
      return { data: null, error: apiError("Invalid input", "VALIDATION_ERROR", 400, issues) };
    }

    return { data: result.data, error: null };
  } catch {
    return { data: null, error: apiError("Could not parse request body", "PARSE_ERROR", 400) };
  }
}

// ─── Rate Limiting (LAW 2) ───────────────────────────────────────────────────
// In-memory rate limiter. For production, use Redis (Upstash).
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function withRateLimit(
  identifier: string,
  maxRequests: number = 60,
  windowMs: number = 60_000
): NextResponse | null {
  const now = Date.now();
  const key = identifier;
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return null; // allowed
  }

  if (entry.count >= maxRequests) {
    return apiError(
      "Too many requests. Please wait a moment.",
      "RATE_LIMITED",
      429,
      { retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
    );
  }

  entry.count++;
  return null; // allowed
}

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of rateLimitStore) {
      if (now > val.resetAt) rateLimitStore.delete(key);
    }
  }, 300_000);
}

// ─── Query Param Helpers ─────────────────────────────────────────────────────
export function getQueryParam(req: Request, key: string): string | null {
  const url = new URL(req.url);
  return url.searchParams.get(key);
}

export function getRequiredParam(req: Request, key: string): { value: string | null; error: NextResponse | null } {
  const val = getQueryParam(req, key);
  if (!val) {
    return { value: null, error: apiError(`Missing required parameter: ${key}`, "MISSING_PARAM", 400) };
  }
  return { value: val, error: null };
}

// ─── Common Zod Schemas ─────────────────────────────────────────────────────
export const BusinessIdSchema = z.object({
  businessId: z.string().min(1, "businessId is required"),
});

export const PaginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

export const LeakFixSchema = z.object({
  leakId: z.string().min(1),
  action: z.enum(["fix", "dismiss", "snooze"]),
  notes: z.string().optional(),
});

export const ScanRequestSchema = z.object({
  businessId: z.string().min(1),
  industry: z.string().min(1),
  scanDepth: z.enum(["quick", "standard", "deep"]).default("standard"),
  answers: z.record(z.any()).optional(),
});

export const PreScanSchema = z.object({
  industry: z.string().min(1, "Select your industry"),
  annualRevenue: z.coerce.number().min(1000, "Revenue must be at least $1,000"),
  employeeCount: z.coerce.number().min(0).default(1),
  yearsInBusiness: z.coerce.number().min(0).default(1),
  province: z.string().optional(),
});

export const AffiliateClickSchema = z.object({
  partnerId: z.string().min(1),
  leakId: z.string().optional(),
  category: z.string().optional(),
  source: z.enum(["dashboard", "intelligence", "prescan", "personal", "industry"]).default("dashboard"),
});
