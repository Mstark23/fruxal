// =============================================================================
// lib/ai/prescan-linker.ts
// linkPrescanToDiagnostic(prescanRunId, businessId, reportId, reportData)
// Runs non-blocking after diagnostic completes. Never throws.
// =============================================================================

import { supabaseAdmin } from "@/lib/supabase-admin";
import type { PrescanContext } from "./prescan-context";

interface LinkResult {
  leaksConfirmed:  number;
  leaksNew:        number;
  leaksNotFound:   number;
  narrative:       string;
}

// ── Match prescan leak to a diagnostic finding ────────────────────────────────
function matchesPrescanLeak(finding: any, prescanLeak: any): boolean {
  const fTitle    = String(finding?.title ?? "").toLowerCase();
  const fCat      = String(finding?.category ?? "").toLowerCase();
  const pTitle    = String(prescanLeak?.title ?? "").toLowerCase();
  const pCat      = String(prescanLeak?.category ?? "").toLowerCase();
  const pSlug     = String(prescanLeak?.slug ?? "").toLowerCase();

  // Direct category match
  if (fCat && pCat && fCat === pCat) return true;
  // Slug match
  if (pSlug && (fTitle.includes(pSlug) || fCat.includes(pSlug))) return true;
  // Title word overlap (3+ shared significant words)
  const fWords = fTitle.split(/\W+/).filter(w => w.length > 3);
  const pWords = pTitle.split(/\W+/).filter(w => w.length > 3);
  const shared = fWords.filter(w => pWords.includes(w));
  return shared.length >= 2;
}

export async function linkPrescanToDiagnostic(
  prescanRunId:  string,
  businessId:    string,
  reportId:      string,
  reportData:    any,
  prescanCtx:    PrescanContext
): Promise<void> {
  try {
    if (!prescanRunId || !businessId || !reportId) return;

    const findings: any[] = Array.isArray(reportData?.findings) ? reportData.findings : [];
    const prescanLeaks = prescanCtx.topLeaks ?? [];

    // Count confirmed, new, not-found
    let leaksConfirmed = 0;
    let leaksNotFound  = 0;

    const confirmedPrescanSlugs = new Set<string>();

    for (const leak of prescanLeaks) {
      const confirmed = findings.some(f =>
        f?.confirmed_from_prescan === true || matchesPrescanLeak(f, leak)
      );
      if (confirmed) {
        leaksConfirmed++;
        confirmedPrescanSlugs.add(leak.slug ?? leak.category ?? "");
      } else {
        leaksNotFound++;
      }
    }

    // New findings = ones not matched to any prescan leak
    const leaksNew = findings.filter(f =>
      !prescanLeaks.some(pl => matchesPrescanLeak(f, pl))
    ).length;

    // ── Generate short narrative via Claude ───────────────────────────────
    let narrative = "";
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey) {
      const prompt = `Write ONE sentence (max 30 words) summarizing the relationship between a prescan and full diagnostic for a business owner.

Prescan found: ${prescanLeaks.length} potential issues (~$${(prescanCtx.totalEstimatedLoss ?? 0).toLocaleString()}/month)
Full diagnostic confirmed: ${leaksConfirmed} of those issues
New discoveries: ${leaksNew} additional findings
Not confirmed: ${leaksNotFound} prescan items

Write as: "Your initial scan [result] — the full diagnostic [confirmed/found] [specific numbers]."
No markdown. No quotes around the sentence.`;

      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 80,
            messages: [{ role: "user", content: prompt }],
          }),
        });
        if (res.ok) {
          const d = await res.json().catch(() => null);
          narrative = d?.content?.[0]?.text?.trim() ?? "";
        }
      } catch { /* non-fatal */ }
    }

    if (!narrative) {
      // Fallback narrative
      if (leaksConfirmed === prescanLeaks.length && leaksNew > 0) {
        narrative = `Your initial scan was accurate — the full diagnostic confirmed all ${leaksConfirmed} findings and uncovered ${leaksNew} additional opportunities.`;
      } else if (leaksConfirmed > 0) {
        narrative = `Your initial scan caught ${leaksConfirmed} of ${prescanLeaks.length} issues — the full diagnostic confirmed these and found ${leaksNew} more.`;
      } else {
        narrative = `The full diagnostic found ${leaksNew} opportunities, some of which align with your initial scan findings.`;
      }
    }

    // ── Insert link record ────────────────────────────────────────────────
    await supabaseAdmin
      .from("prescan_diagnostic_links")
      .upsert({
        prescan_run_id:        prescanRunId,
        business_id:           businessId,
        diagnostic_report_id:  reportId,
        leaks_confirmed:       leaksConfirmed,
        leaks_new:             leaksNew,
        leaks_not_found:       leaksNotFound,
        continuity_narrative:  narrative,
        created_at:            new Date().toISOString(),
      }, { onConflict: "diagnostic_report_id" });

    // ── Update diagnostic_reports with prescan metadata ───────────────────
    await supabaseAdmin
      .from("diagnostic_reports")
      .update({
        prescan_run_id:       prescanRunId,
        prescan_context_used: true,
      } as any)
      .eq("id", reportId);

  } catch (err: any) {
    console.error("[linkPrescanToDiagnostic] Error:", err?.message ?? "unknown");
    // Never throw — linker failure must never surface to user
  }
}
