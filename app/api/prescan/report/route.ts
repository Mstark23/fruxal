// =============================================================================
// app/api/prescan/report/route.ts — FREE PRESCAN HTML REPORT
// Shows 5 leaks fully, redacts the rest with a signup CTA.
// No auth required — accessed via prescanRunId.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const prescanRunId = searchParams.get("prescanRunId");
    const lang = searchParams.get("lang") || "en";
    const isFR = lang === "fr";
    const t = (en: string, fr: string) => isFR ? fr : en;

    if (!prescanRunId) {
      return NextResponse.json({ error: "Missing prescanRunId" }, { status: 400 });
    }

    // Strategy 1: prescan_results.id directly (from /v2/prescan form flow)
    let data: any = null;
    const { data: byId } = await supabaseAdmin
      .from("prescan_results")
      .select("id, user_id, prescan_run_id, analysis, input_snapshot, created_at")
      .eq("id", prescanRunId)
      .maybeSingle();

    if (byId) {
      data = byId;
    } else {
      // Strategy 2: prescan_results where input_snapshot.prescan_run_id matches
      // (landing page chat flow stores run ID inside the JSON)
      const { data: bySnap } = await supabaseAdmin
        .from("prescan_results")
        .select("*")
        .contains("input_snapshot", { prescan_run_id: prescanRunId })
        .order("created_at", { ascending: false })
        .limit(1);

      if (bySnap && bySnap.length > 0) {
        data = bySnap[0];
      } else {
        // Strategy 3: prescan_runs table directly — build a minimal result
        const { data: run } = await supabaseAdmin
          .from("prescan_runs")
          .select("*")
          .eq("id", prescanRunId)
          .maybeSingle();

        if (run) {
          // Find associated prescan_results by user_id + created_at proximity
          const { data: byUser } = await supabaseAdmin
            .from("prescan_results")
            .select("*")
            .eq("user_id", run.user_id)
            .order("created_at", { ascending: false })
            .limit(1);
          data = byUser?.[0] || null;
        }
      }
    }

    if (!data) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    const snap      = data.input_snapshot || {};
    const summary   = data.summary || {};
    const allLeaks  = (data.teaser_leaks || []) as any[];
    const VISIBLE   = 5;
    const visible   = allLeaks.slice(0, VISIBLE);
    const hidden    = allLeaks.slice(VISIBLE);
    const hiddenCount = Math.max(0, (summary.total_leaks || allLeaks.length) - VISIBLE);
    const hiddenValue = hidden.reduce((s: number, l: any) => s + (l.impact_min ?? 0), 0);
    const leakMin   = summary.leak_range_min || allLeaks.reduce((s: number, l: any) => s + (l.impact_min ?? 0), 0);
    const leakMax   = summary.leak_range_max || Math.round(leakMin * 1.3);
    const health    = summary.health_score || 50;
    const province  = snap.province || "CA";
    const industry  = (snap.industry || "Business").replace(/_/g, " ");
    const baseUrl   = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://fruxal.ca";
    const registerUrl = `${baseUrl}/register?prescanRunId=${prescanRunId}`;
    const date      = new Date().toLocaleDateString(isFR ? "fr-CA" : "en-CA", { year: "numeric", month: "long", day: "numeric" });

    const SEV_COLOR: Record<string, string> = {
      critical: "#DC2626", high: "#EA580C", medium: "#D97706", low: "#2563EB",
    };

    const leakCard = (leak: any) => {
      const sev = (leak.severity || "medium").toLowerCase();
      const color = SEV_COLOR[sev] || SEV_COLOR.medium;
      const title = isFR ? (leak.title_fr || leak.title) : leak.title;
      const desc  = isFR ? (leak.description_fr || leak.description || "") : (leak.description || "");
      const proof = isFR ? (leak.proof_fr || leak.proof || "") : (leak.proof || "");
      const action = isFR ? (leak.action_fr || leak.action || "") : (leak.action || "");
      const affiliates = (leak.affiliates || []).filter((a: any) => a.url && a.url !== "undefined");

      return `
      <div class="lc">
        <div class="lh">
          <div>
            <span class="lb" style="background:${color}">${sev.toUpperCase()}</span>
            <span class="cat">${(leak.category || "").toUpperCase()}</span>
          </div>
          <div class="li">
            <span class="lr">$${(leak.impact_min ?? 0).toLocaleString()} — $${((leak.impact_max || leak.impact_min) ?? 0).toLocaleString()}</span>
            <span class="lp">${t("/yr", "/an")}</span>
          </div>
        </div>
        <div class="lt">${title}</div>
        ${desc ? `<div class="ld">${desc}</div>` : ""}
        ${proof ? `<div class="pb"><b>${t("How we calculated this", "Comment nous avons calculé ceci")}</b> · ${proof}</div>` : ""}
        ${action ? `<div class="sb"><b>${t("What you can do:", "Ce que vous pouvez faire :")}</b><p style="margin-top:4px">${action}</p></div>` : ""}
        ${affiliates.length > 0 ? `
          <div style="margin-top:8px">
            <b style="font-size:10px;color:#1B4D3E;text-transform:uppercase;letter-spacing:0.5px">${t("Recommended partners", "Partenaires recommandés")}</b>
            <div style="margin-top:4px">${affiliates.map((a: any) => `<a href="${a.url}" target="_blank" rel="noopener" style="display:inline-block;padding:4px 10px;margin:3px 4px 3px 0;background:#1B4D3E;color:#fff;border-radius:4px;font-size:10px;font-weight:600;text-decoration:none">${a.name} →</a>`).join("")}</div>
          </div>` : ""}
      </div>`;
    };

    const ghostCard = (i: number) => `
      <div class="lc ghost" style="opacity:${0.5 - i * 0.12}">
        <div style="display:flex;justify-content:space-between;margin-bottom:10px">
          <div style="display:flex;gap:8px">
            <div class="bar" style="width:52px;height:14px;background:#d1d5db;border-radius:3px"></div>
            <div class="bar" style="width:70px;height:14px;background:#e5e7eb;border-radius:3px"></div>
          </div>
          <div class="bar" style="width:90px;height:14px;background:#fecaca;border-radius:3px"></div>
        </div>
        <div class="bar" style="width:75%;height:16px;background:#d1d5db;border-radius:3px;margin-bottom:8px"></div>
        <div class="bar" style="width:55%;height:12px;background:#e5e7eb;border-radius:3px"></div>
        <div style="text-align:center;margin-top:12px">
          <span style="font-size:11px;font-weight:700;color:#9ca3af;letter-spacing:1px">${t("LOCKED", "VERROUILLÉ")}</span>
        </div>
      </div>`;

    const scoreColor = health >= 70 ? "#16a34a" : health >= 40 ? "#D97706" : "#DC2626";

    const html = `<!DOCTYPE html>
<html lang="${isFR ? "fr" : "en"}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Fruxal — ${t("Free Leak Report", "Rapport de fuites gratuit")}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a2e;line-height:1.6;background:#fff}
  .pg{max-width:800px;margin:0 auto;padding:40px}
  .hd{border-bottom:3px solid #1B4D3E;padding-bottom:20px;margin-bottom:30px}
  .hd h1{font-size:26px;color:#1B4D3E}
  .hd .s{color:#666;font-size:14px}
  .hd .d{color:#999;font-size:12px;margin-top:6px}
  .sg{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:30px}
  .sc{background:#f8f9fa;border-radius:8px;padding:14px;text-align:center}
  .sc .v{font-size:22px;font-weight:800}
  .sc .l{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#888;margin-top:4px}
  .lc{border:1px solid #e5e7eb;border-radius:12px;padding:18px;margin-bottom:14px;page-break-inside:avoid}
  .lh{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px}
  .lt{font-size:15px;font-weight:700;margin-bottom:6px}
  .lb{padding:2px 7px;border-radius:4px;font-size:9px;font-weight:700;text-transform:uppercase;color:#fff;margin-right:6px}
  .cat{font-size:9px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.5px}
  .ld{color:#555;font-size:12px;margin-bottom:10px}
  .li{display:flex;align-items:center;gap:6px}
  .lr{font-weight:700;color:#DC2626;font-size:14px}
  .lp{color:#999;font-size:11px}
  .pb{background:#fef2f2;border-radius:6px;padding:8px 12px;margin-bottom:10px;font-size:11px;color:#991b1b}
  .sb{background:#f0fdf4;border-radius:6px;padding:10px 12px;font-size:12px;color:#15803d}
  .ghost{background:#f9fafb;pointer-events:none;user-select:none}
  .gate{background:#111827;border-radius:12px;padding:28px;text-align:center;margin:8px 0 24px}
  .gate h3{color:#fff;font-size:18px;font-weight:800;margin-bottom:8px}
  .gate p{color:#9ca3af;font-size:13px;margin-bottom:20px}
  .gate-badge{display:inline-block;background:#DC262620;border:1px solid #DC262640;color:#f87171;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;margin-bottom:12px;letter-spacing:0.5px}
  .cta-btn{display:inline-block;background:#1B4D3E;color:#fff;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.3px}
  .cta-btn:hover{background:#14382d}
  .cta-note{color:#6b7280;font-size:11px;margin-top:10px}
  .ft{margin-top:36px;padding-top:18px;border-top:2px solid #e5e7eb;text-align:center;color:#999;font-size:10px}
  @media print{
    .pg{padding:20px}
    .lc{break-inside:avoid}
    .gate{break-inside:avoid}
    .cta-btn{background:#1B4D3E!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  }
</style>
</head>
<body>
<div class="pg">

  <div class="hd">
    <h1>Fruxal — ${t("Business Leak Report", "Rapport de fuites d'affaires")}</h1>
    <p class="s">${industry} · ${province}</p>
    <p class="d">${date}</p>
  </div>

  <div class="sg">
    <div class="sc">
      <div class="v" style="color:${scoreColor}">${health}</div>
      <div class="l">${t("Health Score", "Score de santé")}</div>
    </div>
    <div class="sc">
      <div class="v" style="color:#DC2626">$${(leakMin ?? 0).toLocaleString()} — $${(leakMax ?? 0).toLocaleString()}</div>
      <div class="l">${t("Est. Annual Leak", "Fuite annuelle estimée")}</div>
    </div>
    <div class="sc">
      <div class="v" style="color:#1a1a2e">${summary.total_leaks || allLeaks.length}</div>
      <div class="l">${t("Leaks Detected", "Fuites détectées")}</div>
    </div>
  </div>

  <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:0.5px;color:#888;margin-bottom:16px;font-weight:700">
    ${t(`Top 5 leaks (${summary.total_leaks || allLeaks.length} total detected)`, `Top 5 fuites (${summary.total_leaks || allLeaks.length} détectées au total)`)}
  </h2>

  ${visible.map(leakCard).join("")}

  ${hiddenCount > 0 ? `
  <!-- Locked leaks -->
  ${[0, 1, 2].slice(0, Math.min(3, hiddenCount)).map(ghostCard).join("")}

  <div class="gate">
    <div class="gate-badge">${hiddenCount} ${t("MORE LEAKS HIDDEN", "FUITES SUPPLÉMENTAIRES MASQUÉES")}</div>
    <h3>${t(`Unlock ${hiddenCount} more leaks worth $${(hiddenValue ?? 0).toLocaleString()}/yr`, `Débloquer ${hiddenCount} fuites supplémentaires valant $${(hiddenValue ?? 0).toLocaleString()}/an`)}</h3>
    <p>${t("Create a free account to see every leak, get assigned a recovery expert, and access government programs you qualify for.", "Créez un compte gratuit pour voir toutes les fuites, obtenir un expert en récupération et accéder aux programmes gouvernementaux.")}</p>
    <a href="${registerUrl}" class="cta-btn">
      ${t("Create Free Account & Unlock All →", "Créer un compte gratuit et tout débloquer →")}
    </a>
    <p class="cta-note">${t("No credit card required · Takes 30 seconds", "Aucune carte de crédit requise · 30 secondes")}</p>
  </div>
  ` : ""}

  <div class="ft">
    <p>Generated by <a href="${baseUrl}" style="color:#1B4D3E">Fruxal</a> · fruxal.ca</p>
    <p>${t("Results are estimates based on industry benchmarks.", "Les résultats sont des estimations basées sur les références de l'industrie.")}</p>
    <p style="margin-top:6px"><strong>${t("To save as PDF: File → Print → Save as PDF", "Pour sauvegarder en PDF : Fichier → Imprimer → Enregistrer en PDF")}</strong></p>
  </div>

</div>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="fruxal-rapport-${province.toLowerCase()}-${isFR ? "fr" : "en"}.html"`,
        "Cache-Control": "no-store",
      },
    });

  } catch (err: any) {
    console.error("Prescan report error:", err);
    return NextResponse.json({ error: "Report generation failed" }, { status: 500 });
  }
}
