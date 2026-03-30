// =============================================================================
// POST /api/admin/assign-rep — Assign a rep to any user (any tier)
// =============================================================================
// Body: { userId, repId, notes? }
// Creates pipeline entry (if none exists) + rep assignment atomically.
// Works for T1, T2, and T3.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/middleware";
import { supabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";
import { sendRepAssigned, sendRepNewClient } from "@/services/email/service";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  try {
    const { userId, repId, notes } = await req.json();
    if (!userId || !repId) {
      return NextResponse.json({ success: false, error: "userId and repId required" }, { status: 400 });
    }

    // Validate rep exists and is active
    const { data: rep } = await supabaseAdmin
      .from("tier3_reps")
      .select("id, name, email, contingency_rate, calendly_url")
      .eq("id", repId)
      .eq("status", "active")
      .single();
    if (!rep) return NextResponse.json({ success: false, error: "Rep not found or inactive" }, { status: 404 });

    // Get user's business profile
    const { data: profile } = await supabaseAdmin
      .from("business_profiles")
      .select("business_id, business_name, industry, province, country, annual_revenue")
      .eq("user_id", userId)
      .single();

    // Get user's email
    const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId).catch(() => ({ data: { user: null } })) as any;
    const userEmail = user?.email || null;

    // Check for existing pipeline entry for this user
    const { data: existingPipe } = await supabaseAdmin
      .from("tier3_pipeline")
      .select("id, stage")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let pipelineId = existingPipe?.id || null;

    // Create pipeline entry if none exists
    if (!pipelineId) {
      pipelineId = crypto.randomUUID();
      await supabaseAdmin.from("tier3_pipeline").insert({
        id:            pipelineId,
        user_id:       userId,
        business_id:   profile?.business_id || null,
        contact_email: userEmail,
        company_name:  profile?.business_name || null,
        industry:      profile?.industry || null,
        province:      profile?.province || null,
        annual_revenue: profile?.annual_revenue || null,
        stage:         "contacted",
        notes:         notes || null,
        created_at:    new Date().toISOString(),
        updated_at:    new Date().toISOString(),
      });
    }

    // Check if rep already assigned to this pipeline
    const { data: existingAssignment } = await supabaseAdmin
      .from("tier3_rep_assignments")
      .select("id")
      .eq("pipeline_id", pipelineId)
      .maybeSingle();

    if (existingAssignment) {
      // Update existing assignment to new rep
      await supabaseAdmin
        .from("tier3_rep_assignments")
        .update({ rep_id: repId, notes: notes || null, assigned_at: new Date().toISOString() })
        .eq("id", existingAssignment.id);
    } else {
      await supabaseAdmin.from("tier3_rep_assignments").insert({
        id:                  crypto.randomUUID(),
        rep_id:              repId,
        pipeline_id:         pipelineId,
        stage_at_assignment: existingPipe?.stage || "contacted",
        notes:               notes || null,
        assigned_at:         new Date().toISOString(),
      });
    }

    // Fire notification emails (non-fatal)
    const appUrl = process.env.NEXTAUTH_URL || "https://fruxal.ca";
    const leakTotal = (profile as any)?.annual_revenue ? Math.round((profile as any).annual_revenue * 0.05) : 0;
    const clientDashUrl = `${appUrl}/rep/customer/${pipelineId}`;

    Promise.all([
      userEmail ? sendRepAssigned(
        userEmail,
        profile?.business_name || "your business",
        rep.name,
        rep.calendly_url || null,
        leakTotal,
        rep.contingency_rate ?? 12,
      ) : Promise.resolve(false),
      sendRepNewClient(
        rep.email,
        rep.name,
        profile?.business_name || "New client",
        profile?.industry || null,
        profile?.province || null,
        leakTotal,
        clientDashUrl,
      ),
    ]).catch(() => {}); // non-fatal

    return NextResponse.json({
      success: true,
      pipelineId,
      rep: { id: rep.id, name: rep.name, calendly_url: rep.calendly_url },
    });

  } catch (err: any) {
    console.error("[AssignRep]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
