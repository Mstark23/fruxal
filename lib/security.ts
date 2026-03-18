// =============================================================================
// API SECURITY UTILITIES
// =============================================================================
// Auth check, input sanitization, rate limiting
// Import in any API route: import { requireAuth, sanitize, rateLimit } from "@/lib/security";
// =============================================================================

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// ─── Auth Check ──────────────────────────────────────────────────────────────
// Returns user session or throws 401
export async function requireAuth(): Promise<{
  user: { id: string; email: string; name: string };
}> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new AuthError("Unauthorized");
  }

  return {
    user: {
      id: (session.user as any).id || "",
      email: session.user.email,
      name: session.user.name || "",
    },
  };
}

export class AuthError extends Error {
  status = 401;
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

// ─── Input Sanitization ─────────────────────────────────────────────────────
// Strips HTML tags, trims whitespace, limits length
export function sanitize(input: any): any {
  if (typeof input === "string") {
    return input
      .replace(/<[^>]*>/g, "")           // Strip HTML tags
      .replace(/javascript:/gi, "")       // Strip JS protocol
      .replace(/on\w+\s*=/gi, "")         // Strip event handlers
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "") // Strip control chars
      .trim()
      .slice(0, 10000);                   // Max 10K chars per field
  }
  if (Array.isArray(input)) {
    return input.map(sanitize);
  }
  if (input && typeof input === "object") {
    const clean: any = {};
    for (const [key, value] of Object.entries(input)) {
      clean[sanitize(key)] = sanitize(value);
    }
    return clean;
  }
  return input;
}

// ─── Safe JSON parse from request ────────────────────────────────────────────
export async function safeBody(req: NextRequest): Promise<any> {
  try {
    const raw = await req.json();
    return sanitize(raw);
  } catch {
    return {};
  }
}

// ─── Rate Limiter (in-memory, per-IP) ────────────────────────────────────────
// Simple sliding window: max N requests per window (seconds)
const rateLimitStore: Map<string, { count: number; resetAt: number }> = new Map();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitStore) {
    if (val.resetAt < now) rateLimitStore.delete(key);
  }
}, 300000);

export function rateLimit(
  req: NextRequest,
  options: { max?: number; windowSeconds?: number; key?: string } = {}
): { allowed: boolean; remaining: number } {
  const { max = 60, windowSeconds = 60, key } = options;

  // Use IP + route as key
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
             req.headers.get("x-real-ip") ||
             "unknown";
  const route = req.nextUrl.pathname;
  const limiterKey = key || `${ip}:${route}`;

  const now = Date.now();
  const entry = rateLimitStore.get(limiterKey);

  if (!entry || entry.resetAt < now) {
    // New window
    rateLimitStore.set(limiterKey, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, remaining: max - 1 };
  }

  entry.count++;
  const remaining = Math.max(0, max - entry.count);

  if (entry.count > max) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining };
}

// ─── Rate limit response helper ──────────────────────────────────────────────
export function rateLimitResponse(): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { status: 429 }
  );
}

// ─── Validate businessId ownership ───────────────────────────────────────────
// Ensures the authenticated user actually owns this business
import { prisma } from "@/lib/db/client";

export async function requireBusinessAccess(
  userId: string,
  businessId: string
): Promise<boolean> {
  const membership = await prisma.businessMember.findFirst({
    where: {
      userId,
      businessId,
    },
  });
  return !!membership;
}

// ─── Zod validation helper ───────────────────────────────────────────────────
import { z, ZodSchema } from "zod";

export function validate<T>(schema: ZodSchema<T>, data: unknown): { data: T; error: null } | { data: null; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { data: result.data, error: null };
  }
  return {
    data: null,
    error: result.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(", "),
  };
}

// ─── Common validation schemas ───────────────────────────────────────────────
export const schemas = {
  businessId: z.string().min(1).max(100),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  scan: z.object({
    businessId: z.string().min(1),
    industry: z.string().min(1).max(50),
    dataSource: z.enum(["estimate", "quickbooks", "xero", "csv", "bank"]).optional(),
    answers: z.record(z.union([z.string(), z.number()])).optional(),
  }),
  leakUpdate: z.object({
    leakId: z.string().min(1),
    status: z.enum(["OPEN", "FIXING", "FIXED", "DISMISSED"]),
    owner: z.string().max(100).optional(),
  }),
  fix: z.object({
    leakId: z.string().min(1),
    partnerId: z.string().min(1),
    businessId: z.string().optional(),
    userId: z.string().optional(),
  }),
};
