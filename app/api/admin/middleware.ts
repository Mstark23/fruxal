import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const ADMIN_EMAILS: string[] = (process.env.ADMIN_EMAILS || "admin@fruxal.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function requireAdmin(req: NextRequest): Promise<{
  authorized: boolean;
  userId?: string;
  email?: string;
  error?: NextResponse;
}> {
  // DEV BYPASS — .env.local only, never on Vercel/production
  if (
    process.env.NODE_ENV === "development" &&
    process.env.ADMIN_DEV_BYPASS === "true" &&
    !process.env.VERCEL
  ) {
    return { authorized: true, userId: "dev", email: "dev@localhost" };
  }

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return {
        authorized: false,
        error: NextResponse.json(
          { success: false, error: "Unauthorized — login required" },
          { status: 401 }
        ),
      };
    }

    const email = (session.user.email || "").toLowerCase().trim();
    const userId = (session.user as any).id;

    if (!email || !ADMIN_EMAILS.includes(email)) {
      return {
        authorized: false,
        error: NextResponse.json(
          { success: false, error: "Forbidden — admin access required" },
          { status: 403 }
        ),
      };
    }

    return { authorized: true, userId, email };
  } catch (err: any) {
    return {
      authorized: false,
      error: NextResponse.json(
        { success: false, error: "Auth check failed: " + err.message },
        { status: 500 }
      ),
    };
  }
}
