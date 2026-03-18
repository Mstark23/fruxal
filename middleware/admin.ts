// =============================================================================
// src/middleware/admin.ts
// =============================================================================
// Middleware to protect admin routes.
// Checks session for role === "admin".
//
// Usage in Next.js middleware.ts:
//   import { adminMiddleware } from "./middleware/admin";
//   if (req.nextUrl.pathname.startsWith("/admin")) return adminMiddleware(req);
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function adminMiddleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // No session → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login?redirect=/admin", req.url));
  }

  // Not admin → 403
  if (token.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Admin → allow through
  return NextResponse.next();
}

// =============================================================================
// Helper: check admin in API routes
// =============================================================================

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "admin") {
    throw new Error("Unauthorized: admin access required");
  }
  return session;
}
