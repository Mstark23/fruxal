// =============================================================================
// lib/rep-picker.ts — Load-balanced rep assignment
// =============================================================================
// Picks the best available rep for a new lead.
// Priority:
//   1. Active rep in same province with fewest active clients
//   2. Active rep in any province with fewest active clients
//   3. First active rep (fallback)
// =============================================================================
import { supabaseAdmin } from "@/lib/supabase-admin";

const ACTIVE_STAGES = [
  "lead","contacted","called","diagnostic_sent",
  "agreement_out","signed","in_engagement","recovery_tracking",
];

export async function pickBestRep(province: string | null): Promise<{ id: string; name: string; email: string; calendly_url: string | null; contingency_rate: number } | null> {
  try {
    // Get all active reps with their current active client count
    const { data: reps } = await supabaseAdmin
      .from("tier3_reps")
      .select("id, name, email, province, status, calendly_url, contingency_rate")
      .eq("status", "active");

    if (!reps?.length) return null;

    // Count active clients per rep
    const { data: assignments } = await supabaseAdmin
      .from("tier3_rep_assignments")
      .select("rep_id, tier3_pipeline(stage)")
      .in("rep_id", reps.map(r => r.id)) as any;

    const loadMap: Record<string, number> = {};
    for (const r of reps) loadMap[r.id] = 0;
    for (const a of assignments || []) {
      const stage = (a.tier3_pipeline as any)?.stage;
      if (stage && ACTIVE_STAGES.includes(stage)) {
        loadMap[a.rep_id] = (loadMap[a.rep_id] ?? 0) + 1;
      }
    }

    // Sort reps by load (ascending)
    const sorted = [...reps].sort((a, b) => (loadMap[a.id] ?? 0) - (loadMap[b.id] ?? 0));

    // 1. Province match with lowest load
    const provinceMatch = province
      ? sorted.find(r => r.province === province)
      : null;
    if (provinceMatch) return provinceMatch;

    // 2. Any rep with lowest load
    return sorted[0] || null;
  } catch (err: any) {
    console.error("[RepPicker]", err.message);
    return null;
  }
}
