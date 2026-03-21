// =============================================================================
// FIX VERIFICATION — Did the fix actually work?
// =============================================================================
// After each scan, compare "FIXED" leaks against new scan results.
// If the metric improved → send "it worked!" notification
// If still bad → reopen leak + send "still leaking" alert
// =============================================================================
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

interface VerificationResult {
  leakId: string;
  title: string;
  verified: boolean;
  previousAmount: number;
  newAmount: number;
  improvement: number;
}

export async function verifyFixes(businessId: string, newLeaks: any[]): Promise<VerificationResult[]> {
  const results: VerificationResult[] = [];

  // Get all "FIXED" leaks for this business
  const { data: fixedLeaks } = await supabase
    .from("leaks")
    .select("*")
    .eq("businessId", businessId)
    .in("status", ["FIXED", "fixed"]);

  if (!fixedLeaks || fixedLeaks.length === 0) return results;

  for (const fixed of fixedLeaks) {
    // Find matching leak in new scan by category + title similarity
    const match = newLeaks.find(nl =>
      nl.category === fixed.category &&
      (nl.title === fixed.title || nl.detectorId === fixed.detectorId)
    );

    if (!match) {
      // Leak not detected in new scan → fix confirmed!
      results.push({
        leakId: fixed.id,
        title: fixed.title,
        verified: true,
        previousAmount: fixed.annualImpact,
        newAmount: 0,
        improvement: 100,
      });
      continue;
    }

    // Compare amounts
    const improvement = fixed.annualImpact > 0
      ? Math.round(((fixed.annualImpact - match.annualImpact) / fixed.annualImpact) * 100)
      : 0;

    if (improvement >= 50) {
      // Significant improvement → verified
      results.push({
        leakId: fixed.id,
        title: fixed.title,
        verified: true,
        previousAmount: fixed.annualImpact,
        newAmount: match.annualImpact,
        improvement,
      });
    } else {
      // Not enough improvement → reopen
      results.push({
        leakId: fixed.id,
        title: fixed.title,
        verified: false,
        previousAmount: fixed.annualImpact,
        newAmount: match.annualImpact,
        improvement,
      });

      // Reopen the leak
      await supabase.from("leaks").update({ status: "OPEN" }).eq("id", fixed.id);
    }
  }

  // Send notifications for verified/unverified
  const { generateNotification } = await import("@/services/notifications/engine");

  for (const r of results) {
    const notif = generateNotification(
      r.verified ? "leak_fixed" : "leak_worsened",
      businessId,
      { fixedMetric: r.title, fixedSavings: r.previousAmount, roi: r.improvement }
    );
    await supabase.from("notifications").insert({
      id: notif.id, businessId, type: notif.type, priority: r.verified ? "routine" : "important",
      title: r.verified ? `✅ ${r.title} — fix confirmed!` : `⚠️ ${r.title} — still leaking`,
      body: r.verified
        ? `Your fix saved $${(r.previousAmount ?? 0).toLocaleString()}/yr (${r.improvement}% improvement)`
        : `Despite marking as fixed, this leak is still at $${(r.newAmount ?? 0).toLocaleString()}/yr. We've reopened it.`,
      cta: r.verified ? "See progress" : "Review leak",
      ctaUrl: r.verified ? "/dashboard?tab=trends" : "/dashboard?tab=leaks",
      channel: "push", createdAt: new Date().toISOString(),
    }).then(null, () => {});
  }

  // Send emails for verified fixes
  try {
    const { data: member } = await supabase.from("business_members").select("userId, users(email)").eq("businessId", businessId).limit(1).single();
    if (member?.users) {
      const { sendLeakFixed } = await import("@/services/email/service");
      for (const r of results.filter(r => r.verified)) {
        await sendLeakFixed((member.users as any).email, r.title, r.previousAmount);
      }
    }
  } catch (e) { /* non-fatal */ }

  return results;
}
