// =============================================================================
// lib/ai/comparison-generator.ts
// generateComparison(businessId, userId, newReportId, previousReportId)
// Diffs two diagnostic reports, generates a Claude narrative, sends rescan email.
// ENTIRELY non-blocking — never throws, never delays the diagnostic response.
// =============================================================================

import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendRescanEmail } from "@/services/email/service";

// ── Fuzzy finding match ───────────────────────────────────────────────────────
// Two findings match if same category AND >60% word overlap in title
function wordsOf(s: string): Set<string> {
  return new Set(s.toLowerCase().split(/\W+/).filter(w => w.length > 3));
}

function findingsMatch(a: any, b: any): boolean {
  if (!a || !b) return false;
  const catMatch = a.category && b.category &&
    a.category.toLowerCase() === b.category.toLowerCase();
  if (!catMatch) return false;
  const aWords = wordsOf(a.title ?? "");
  const bWords = wordsOf(b.title ?? "");
  if (aWords.size === 0 || bWords.size === 0) return catMatch;
  const shared = [...aWords].filter(w => bWords.has(w)).length;
  const overlap = shared / Math.max(aWords.size, bWords.size);
  return overlap >= 0.5;  // 50% word overlap + same category = match
}

function fmt(n: number) { return "$" + Math.round(n ?? 0).toLocaleString(); }

// ── Main export ───────────────────────────────────────────────────────────────
export async function generateComparison(
  businessId:     string,
  userId:         string,
  newReportId:    string,
  previousReportId: string,
  country:        string = "CA"
): Promise<void> {
  try {
    // ── 1. Fetch both reports ─────────────────────────────────────────────
    const [newRow, prevRow] = await Promise.all([
      supabaseAdmin
        .from("diagnostic_reports")
        .select("overall_score, result_json, created_at, completed_at")
        .eq("id", newReportId)
        .maybeSingle()
        .then(r => r.data),
      supabaseAdmin
        .from("diagnostic_reports")
        .select("overall_score, result_json, created_at, completed_at")
        .eq("id", previousReportId)
        .maybeSingle()
        .then(r => r.data),
    ]);

    if (!newRow || !prevRow) return;

    const newScore  = newRow.overall_score  ?? 0;
    const prevScore = prevRow.overall_score ?? 0;
    const scoreDelta = newScore - prevScore;

    const newDate  = new Date(newRow.completed_at  ?? newRow.created_at);
    const prevDate = new Date(prevRow.completed_at ?? prevRow.created_at);
    const daysBetween = Math.floor((newDate.getTime() - prevDate.getTime()) / 86400000);

    // ── 2. Tasks completed between scans ─────────────────────────────────
    const { data: completedTasks } = await supabaseAdmin
      .from("diagnostic_tasks")
      .select("title, savings_monthly, completed_at, category")
      .eq("business_id", businessId)
      .eq("status", "done")
      .gte("completed_at", prevDate.toISOString())
      .lte("completed_at", newDate.toISOString())
      .order("savings_monthly", { ascending: false });

    const tasks = completedTasks ?? [];
    const savingsRecovered = tasks.reduce((s, t) => s + (t.savings_monthly ?? 0), 0);

    // ── 3. Compare findings ───────────────────────────────────────────────
    const newFindings  = (newRow.result_json  as any)?.findings ?? [];
    const prevFindings = (prevRow.result_json as any)?.findings ?? [];

    const resolved:  any[] = [];
    const persisted: any[] = [];
    const newDisc:   any[] = [];

    for (const pf of prevFindings) {
      const stillPresent = newFindings.some((nf: any) => findingsMatch(pf, nf));
      if (stillPresent) persisted.push(pf);
      else resolved.push(pf);
    }

    for (const nf of newFindings) {
      const wasInPrev = prevFindings.some((pf: any) => findingsMatch(pf, nf));
      if (!wasInPrev) newDisc.push(nf);
    }

    const newLeaksMonthlyImpact = newDisc.reduce(
      (s, f) => s + Math.round(((f.impact_min ?? 0) + (f.impact_max ?? 0)) / 2 / 12),
      0
    );
    const netMonthlyImprovement = Math.round(savingsRecovered - newLeaksMonthlyImpact);

    // ── 4. Claude narrative ───────────────────────────────────────────────
    let headline  = "";
    let narrative = "";

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      const taskLines = tasks.slice(0, 5)
        .map(t => `- ${t.title}: +${fmt(t.savings_monthly ?? 0)}/month`)
        .join("\n");
      const newLines = newDisc.slice(0, 3)
        .map((f: any) => `- ${f.title} (${f.category}): ~${fmt(Math.round(((f.impact_min ?? 0) + (f.impact_max ?? 0)) / 2 / 12))}/month`)
        .join("\n");

      const userPrompt = `Previous scan (${daysBetween} days ago): Score ${prevScore}/100
New scan: Score ${newScore}/100 — change: ${scoreDelta >= 0 ? "+" : ""}${scoreDelta}

Fixes made between scans: ${tasks.length}
Monthly savings recovered: ${fmt(Math.round(savingsRecovered))}/month
${taskLines || "(none)"}

Findings resolved (no longer present): ${resolved.length}
New findings discovered: ${newDisc.length}
${newLines || "(none)"}

Net monthly position change: ${netMonthlyImprovement >= 0 ? "+" : ""}${fmt(netMonthlyImprovement)}/month

Write a brief, specific comparison summary. Lead with the score change and biggest win. End by flagging the most important new finding if any exist. If score improved AND savings recovered: be celebratory but brief. If new leaks found that outweigh recoveries: be honest about it.`;

      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 300,
            system: `You are summarizing the difference between two financial diagnostic scans for a ${country === "US" ? "US" : "Canadian"} SMB owner. Be specific with numbers. Write in a direct, encouraging tone. Respond with JSON only, no preamble, no markdown:
{"headline":"...","narrative":"..."}
headline: max 12 words, starts with a specific win or finding.
narrative: 3-4 sentences, dollar amounts throughout.`,
            messages: [{ role: "user", content: userPrompt }],
          }),
        });
        if (res.ok) {
          const d = await res.json().catch(() => null);
          const raw = (d?.content?.[0]?.text ?? "").replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
          try {
            const parsed = JSON.parse(raw);
            headline  = String(parsed.headline ?? "").slice(0, 100);
            narrative = String(parsed.narrative ?? "").slice(0, 600);
          } catch { /* use fallback */ }
        }
      } catch { /* non-fatal */ }
    }

    // Fallback narrative
    if (!headline) {
      headline = scoreDelta > 0
        ? `Score up ${scoreDelta} points — ${fmt(Math.round(savingsRecovered))}/month recovered`
        : newDisc.length > 0
        ? `${newDisc.length} new issue${newDisc.length > 1 ? "s" : ""} found — review recommended`
        : `Scan comparison: ${daysBetween} days, ${tasks.length} fix${tasks.length !== 1 ? "es" : ""} completed`;
    }

    // ── 5. Insert comparison record ───────────────────────────────────────
    const { data: inserted } = await supabaseAdmin
      .from("diagnostic_comparisons")
      .insert({
        business_id:              businessId,
        new_report_id:            newReportId,
        previous_report_id:       previousReportId,
        previous_score:           prevScore,
        new_score:                newScore,
        score_delta:              scoreDelta,
        leaks_fixed_count:        tasks.length,
        savings_recovered_monthly: Math.round(savingsRecovered),
        findings_resolved_count:  resolved.length,
        findings_new_count:       newDisc.length,
        findings_persisted_count: persisted.length,
        net_monthly_improvement:  netMonthlyImprovement,
        comparison_narrative:     narrative,
        comparison_headline:      headline,
        days_between_scans:       daysBetween,
        generated_at:             new Date().toISOString(),
      })
      .select("id")
      .single();

    if (!inserted) return;

    // ── 6. Update diagnostic_reports ─────────────────────────────────────
    await supabaseAdmin
      .from("diagnostic_reports")
      .update({ comparison_id: inserted.id, is_rescan: true } as any)
      .eq("id", newReportId);

    // ── 7. Send rescan email (deduped) ────────────────────────────────────
    // Get user email
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("email, name")
      .eq("id", userId)
      .maybeSingle();

    if (user?.email) {
      // Dedup check: one rescan email per report
      const { data: existingLog } = await supabaseAdmin
        .from("monthly_briefs")
        .select("id")
        .eq("user_id", userId)
        .eq("brief_subject", `rescan_${newReportId}`)
        .maybeSingle();

      if (!existingLog) {
        await sendRescanEmail({
          to:               user.email,
          headline,
          narrative,
          scoreDelta,
          prevScore,
          newScore,
          savingsRecovered: Math.round(savingsRecovered),
          newIssuesCount:   newDisc.length,
          netMonthly:       netMonthlyImprovement,
          daysBetween,
          newReportId,
        });

        // Log send to prevent duplicates
        await supabaseAdmin.from("monthly_briefs").insert({
          business_id:   businessId,
          user_id:       userId,
          brief_content: narrative,
          brief_subject: `rescan_${newReportId}`,
          sent_at:       new Date().toISOString(),
          tier:          "rescan",
        });
      }
    }
  } catch (err: any) {
    console.error("[generateComparison] Error:", err?.message);
    // Never re-throw — must be non-blocking
  }
}
