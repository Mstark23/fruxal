// =============================================================================
// PATCH /api/admin/users/[id] — Admin user actions
// =============================================================================
// Actions: upgrade, downgrade, update province/industry, add note
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/middleware";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  const { id } = params;
  if (!id) return NextResponse.json({ success: false, error: "User ID required" }, { status: 400 });

  try {
    const body = await req.json();
    const { action, province, industry, note, planName } = body;
    const changes: string[] = [];

    // ─── Upgrade / Downgrade ───
    if (action === "upgrade" || action === "downgrade") {
      const newPlan = action === "upgrade" ? (planName || "solo") : "free";
      await supabaseAdmin.from("user_progress").upsert(
        { userId: id, paid_plan: newPlan },
        { onConflict: "userId" }
      );
      changes.push(`Plan → ${newPlan}`);
    }

    // ─── Update province/state ───
    if (province) {
      const CA_PROVINCES = ["ON","QC","BC","AB","MB","SK","NB","NS","PE","NL","NT","YT","NU"];
      const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];
      if (!CA_PROVINCES.includes(province) && !US_STATES.includes(province)) {
        return NextResponse.json({ success: false, error: "Invalid province/state code" }, { status: 400 });
      }
      const country = US_STATES.includes(province) ? "US" : "CA";
      await supabaseAdmin.from("business_profiles").update({ province, country }).eq("user_id", id);
      changes.push(`Province/State → ${province} (${country})`);
    }

    // ─── Update industry ───
    if (industry) {
      await supabaseAdmin.from("business_profiles").update({ industry, industry_label: industry }).eq("user_id", id);
      changes.push(`Industry → ${industry}`);
    }

    // ─── Add note ───
    if (note && typeof note === "string" && note.trim()) {
      // Get existing notes
      const { data: existing } = await supabaseAdmin
        .from("user_progress")
        .select("admin_notes")
        .eq("userId", id)
        .single();

      const existingNotes = existing?.admin_notes || [];
      const newNote = {
        text: note.trim(),
        by: auth.email,
        at: new Date().toISOString(),
      };

      await supabaseAdmin.from("user_progress").upsert(
        { userId: id, admin_notes: [...existingNotes, newNote] },
        { onConflict: "userId" }
      );
      changes.push("Note added");
    }

    if (changes.length === 0) {
      return NextResponse.json({ success: false, error: "No valid action provided" }, { status: 400 });
    }

    process.env.NODE_ENV !== "production" && console.log(`[Admin:Users] ${auth.email} updated user ${id}: ${changes.join(", ")}`);

    return NextResponse.json({ success: true, changes });

  } catch (error: any) {
    console.error("[Admin:Users:PATCH]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
