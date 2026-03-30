// =============================================================================
// lib/plan-gate.ts
// checkPlanAccess(userId, feature) — feature gating by plan tier
// =============================================================================
import { supabaseAdmin } from "@/lib/supabase-admin";

type Feature = "diagnostic" | "pdf_export" | "monthly_brief" | "advisor_chat" | "solutions_browse";
type Plan    = "free" | "solo" | "business" | "advisor" | "enterprise";

// Contingency model — all features are free. Revenue comes from 12% of recovered savings.
const GATES: Record<Feature, Plan[]> = {
  diagnostic:       ["free", "solo", "business", "advisor", "enterprise"],
  pdf_export:       ["free", "solo", "business", "advisor", "enterprise"],
  monthly_brief:    ["free", "solo", "business", "advisor", "enterprise"],
  advisor_chat:     ["free", "solo", "business", "advisor", "enterprise"],
  solutions_browse: ["free", "solo", "business", "advisor", "enterprise"],
};

const PLAN_DISPLAY: Record<string, string> = {
  free: "Free", solo: "Solo", business: "Business", advisor: "Advisor", enterprise: "Enterprise",
};

export async function checkPlanAccess(
  userId: string, feature: Feature
): Promise<{ hasAccess: boolean; requiredPlan: string | null; currentPlan: string }> {
  const { data } = await supabaseAdmin
    .from("user_progress")
    .select("paid_plan, payment_status")
    .eq("userId", userId)
    .maybeSingle();

  const currentPlan = (data?.paid_plan || "free") as Plan;
  const isActive = data?.payment_status === "active" || data?.payment_status === "lifetime";
  const effectivePlan: Plan = isActive ? currentPlan : "free";

  const allowed = GATES[feature] ?? [];
  const hasAccess = allowed.includes(effectivePlan);

  if (hasAccess) return { hasAccess: true, requiredPlan: null, currentPlan: effectivePlan };

  // Find cheapest plan that unlocks this feature
  const requiredPlan = (["solo","business","advisor","enterprise"] as Plan[]).find(p => allowed.includes(p));
  return {
    hasAccess: false,
    requiredPlan: requiredPlan ? (PLAN_DISPLAY[requiredPlan] ?? requiredPlan) : "Business",
    currentPlan: effectivePlan,
  };
}
