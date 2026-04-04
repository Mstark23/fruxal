// =============================================================================
// app/api/v2/team/route.ts
// GET    — list all BusinessMembers for the current user's business
// POST   — invite a new member (by email + role)
// DELETE — remove a member (owner only)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 15;

/** Resolve the caller's businessId + role from business_members */
async function resolveCallerBusiness(userId: string) {
  const { data: membership } = await supabaseAdmin
    .from("business_members")
    .select("businessId, role")
    .eq("userId", userId)
    .order("createdAt", { ascending: false })
    .limit(1)
    .single();

  if (membership) return membership;

  // Fallback: check businesses.owner_user_id
  const { data: biz } = await supabaseAdmin
    .from("businesses")
    .select("id")
    .eq("owner_user_id", userId)
    .limit(1)
    .maybeSingle();

  if (biz) return { businessId: biz.id, role: "OWNER" };
  return null;
}

// ── GET — list members ───────────────────────────────────────────────────────
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id as string;

    const caller = await resolveCallerBusiness(userId);
    if (!caller) return NextResponse.json({ error: "No business found" }, { status: 404 });

    const { data: members, error } = await supabaseAdmin
      .from("business_members")
      .select("id, userId, role, createdAt")
      .eq("businessId", caller.businessId)
      .order("createdAt", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Enrich with user info
    const userIds = (members ?? []).map((m: any) => m.userId);
    const { data: users } = await supabaseAdmin
      .from("users")
      .select("id, name, email")
      .in("id", userIds);

    const userMap = new Map((users ?? []).map((u: any) => [u.id, u]));

    const enriched = (members ?? []).map((m: any) => {
      const u = userMap.get(m.userId) as any;
      return {
        id: m.id,
        userId: m.userId,
        name: u?.name || null,
        email: u?.email || "Unknown",
        role: m.role,
        joined_at: m.createdAt,
      };
    });

    return NextResponse.json({
      members: enriched,
      callerRole: caller.role,
      businessId: caller.businessId,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── POST — invite a member ───────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id as string;

    const caller = await resolveCallerBusiness(userId);
    if (!caller) return NextResponse.json({ error: "No business found" }, { status: 404 });

    // Only OWNER or ADMIN can invite
    if (!["OWNER", "ADMIN"].includes(caller.role)) {
      return NextResponse.json({ error: "Only owners and admins can invite members" }, { status: 403 });
    }

    const { email, role } = await req.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const validRoles = ["OWNER", "ADMIN", "VIEWER"];
    const normalizedRole = (role || "VIEWER").toUpperCase();
    if (!validRoles.includes(normalizedRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Look up user by email
    const { data: targetUser } = await supabaseAdmin
      .from("users")
      .select("id, email, name")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (!targetUser) {
      return NextResponse.json(
        { error: "User must register first. Ask them to create a Fruxal account, then try again." },
        { status: 404 }
      );
    }

    // Check if already a member
    const { data: existing } = await supabaseAdmin
      .from("business_members")
      .select("id")
      .eq("businessId", caller.businessId)
      .eq("userId", targetUser.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "This user is already a team member" }, { status: 409 });
    }

    // Create membership
    const { data: created, error } = await supabaseAdmin
      .from("business_members")
      .insert({
        businessId: caller.businessId,
        userId: targetUser.id,
        role: normalizedRole,
        createdAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      member: {
        id: created.id,
        userId: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: normalizedRole,
        joined_at: created.createdAt,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── DELETE — remove a member ─────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id as string;

    const caller = await resolveCallerBusiness(userId);
    if (!caller) return NextResponse.json({ error: "No business found" }, { status: 404 });

    if (caller.role !== "OWNER") {
      return NextResponse.json({ error: "Only the owner can remove members" }, { status: 403 });
    }

    const { memberId } = await req.json();
    if (!memberId) return NextResponse.json({ error: "memberId is required" }, { status: 400 });

    // Fetch the member to remove
    const { data: member } = await supabaseAdmin
      .from("business_members")
      .select("id, userId, businessId")
      .eq("id", memberId)
      .eq("businessId", caller.businessId)
      .maybeSingle();

    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

    // Can't remove yourself
    if (member.userId === userId) {
      return NextResponse.json({ error: "You cannot remove yourself" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("business_members")
      .delete()
      .eq("id", memberId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
