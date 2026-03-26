// =============================================================================
// GET/POST /api/admin/tier3/pipeline — Tier 3 Pipeline CRM
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/middleware";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { scoreLeadQuality, scoreToPriority } from "@/lib/lead-score";
import crypto from "crypto";

export const maxDuration = 30; // Vercel function timeout (seconds)

const STAGES = ["lead","contacted","called","diagnostic_sent","agreement_out","signed","in_engagement","fee_collected","lost"];

async function safe<T>(fn: () => Promise<T>, fb: T): Promise<T> {
  try { return await fn(); } catch { return fb; }
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  const { searchParams } = new URL(req.url);
  const stage = searchParams.get("stage") || "all";
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 50));

  try {
    const [diagnostics, pipelineRows, agreements, reports, profiles] = await Promise.all([
      safe(async () => { const { data } = await supabaseAdmin.from("tier3_diagnostics").select("id, company_name, industry, province, revenue_bracket, result, status, created_at, user_id"); return data || []; }, [] as any[]),
      safe(async () => { const { data } = await supabaseAdmin.from("tier3_pipeline").select("*").order("created_at", { ascending: false }); return data || []; }, [] as any[]),
      safe(async () => { const { data } = await supabaseAdmin.from("tier3_agreements").select("diagnostic_id, status, contact_name, contact_title, fee_percentage"); return data || []; }, [] as any[]),
      // v2 flow: diagnostic_reports
      safe(async () => { const { data } = await supabaseAdmin.from("diagnostic_reports").select("id, business_id, user_id, tier, status, total_annual_leaks, total_potential_savings, ebitda_impact, enterprise_value_impact, overall_score, findings_count, critical_findings, completed_at, created_at").eq("tier", "enterprise").eq("status", "completed").order("created_at", { ascending: false }); return data || []; }, [] as any[]),
      safe(async () => { const { data } = await supabaseAdmin.from("business_profiles").select("business_id, business_name, industry, province, exact_annual_revenue, employee_count"); return data || []; }, [] as any[]),
    ]);

    // Build profile lookup by business_id
    const profileMap: Record<string, any> = {};
    for (const p of profiles) profileMap[p.business_id] = p;

    const pipeMap: Record<string, any> = {};
    for (const p of pipelineRows) pipeMap[p.diagnostic_id] = p;
    const agMap: Record<string, any> = {};
    for (const a of agreements) agMap[a.diagnostic_id] = a;

    // Entries from tier3_diagnostics (existing flow)
    let entries = diagnostics.map((d: any) => {
      const pipe = pipeMap[d.id];
      const ag = agMap[d.id];
      const summary = d.result?.summary || {};
      const estLow = summary.totalEstimatedLow ?? 0;
      const estHigh = summary.totalEstimatedHigh ?? 0;
      const highConf = summary.highConfidenceCount ?? 0;

      let derivedStage = "contacted";
      if (d.status === "sent") derivedStage = "diagnostic_sent";
      if (ag?.status === "pending") derivedStage = "agreement_out";
      if (ag?.status === "signed" || d.status === "signed") derivedStage = "signed";

      const pipeStage = pipe?.stage || derivedStage;
      const pipeUpdated = pipe?.updated_at || d.created_at;
      const daysInStage = Math.max(0, Math.floor((Date.now() - new Date(pipeUpdated).getTime()) / 86400000));

      return {
        pipelineId: pipe?.id || null,
        diagnosticId: d.id,
        companyName: d.company_name,
        industry: d.industry,
        province: d.province,
        revenueBracket: d.revenue_bracket,
        estimatedLow: estLow,
        estimatedHigh: estHigh,
        highConfidenceCount: highConf,
        stage: pipeStage,
        notes: pipe?.notes || null,
        followUpDate: pipe?.follow_up_date || null,
        lostReason: pipe?.lost_reason || null,
        daysInStage,
        createdAt: d.created_at,
        updatedAt: pipeUpdated,
        agreementStatus: ag?.status || null,
        agreementContact: ag?.contact_name || null,
      };
    });

    // Also include standalone enterprise leads (no diagnostic_id)
    const standaloneLeads = pipelineRows.filter((p: any) => !p.diagnostic_id && p.company_name);
    for (const p of standaloneLeads) {
      const pipeUpdated = p.updated_at || p.created_at;
      const daysInStage = Math.max(0, Math.floor((Date.now() - new Date(pipeUpdated).getTime()) / 86400000));
      entries.push({
        pipelineId: p.id,
        diagnosticId: null,
        companyName: p.company_name || "—",
        industry: p.industry || null,
        province: p.province || null,
        revenueBracket: p.annual_revenue || null,
        estimatedLow: 0,
        estimatedHigh: 0,
        highConfidenceCount: 0,
        stage: p.stage || "lead",
        notes: p.notes || null,
        followUpDate: p.follow_up_date || null,
        lostReason: p.lost_reason || null,
        daysInStage,
        createdAt: p.created_at,
        updatedAt: pipeUpdated,
        agreementStatus: null,
        agreementContact: p.contact_name || null,
        contactEmail: (p as any).contact_email || null,
        contactPhone: (p as any).contact_phone || null,
        source: p.source || "enterprise_page",
      } as any);
    }

    // Also include T1/T2 pipeline entries (created by prescan save or direct rep assignment)
    // These have user_id but no diagnostic_id and no company_name (anonymous prescan leads)
    const t1t2Leads = pipelineRows.filter((p: any) => !p.diagnostic_id && !p.company_name && p.user_id);
    if (t1t2Leads.length > 0) {
      const userIds = t1t2Leads.map((p: any) => p.user_id).filter(Boolean);
      const { data: t1t2Profiles } = await supabaseAdmin
        .from("business_profiles")
        .select("user_id, business_name, industry, province, annual_revenue")
        .in("user_id", userIds);
      const pm2: Record<string,any> = {};
      for (const prof of t1t2Profiles || []) pm2[prof.user_id] = prof;

      for (const p of t1t2Leads) {
        const prof = pm2[p.user_id] || {};
        const pipeUpdated = p.updated_at || p.created_at;
        const daysInStage = Math.max(0, Math.floor((Date.now() - new Date(pipeUpdated).getTime()) / 86400000));
        const rev = prof.annual_revenue || 0;
        const estLeak = Math.round(rev * 0.05); // ~5% revenue estimate

        // Skip if already in entries (avoid duplicates from previous loops)
        if (entries.find((e: any) => e.pipelineId === p.id)) continue;

        entries.push({
          pipelineId: p.id,
          diagnosticId: null,
          companyName: prof.business_name || `User ${p.user_id?.slice(0,8)}`,
          industry: prof.industry || null,
          province: prof.province || null,
          revenueBracket: rev ? `$${Math.round(rev/1000)}K/yr` : null,
          estimatedLow: estLeak * 0.7,
          estimatedHigh: estLeak * 1.3,
          highConfidenceCount: 0,
          stage: p.stage || "lead",
          notes: p.notes || null,
          followUpDate: p.follow_up_date || null,
          lostReason: p.lost_reason || null,
          daysInStage,
          createdAt: p.created_at,
          updatedAt: pipeUpdated,
          agreementStatus: null,
          agreementContact: null,
          contactEmail: p.contact_email || null,
          source: "prescan",
          userId: p.user_id,
        } as any);
      }
    }

    // Compute lead score for every entry
    for (const entry of entries as any[]) {
      const rev = typeof entry.revenueBracket === "number" ? entry.revenueBracket : 0;
      const { score, reasons } = scoreLeadQuality({
        annualRevenue:  rev,
        estimatedLeak:  entry.estimatedHigh || (rev * 0.05),
        province:       entry.province,
        hasAccountant:  null,
        lastTaxReview:  null,
        doesRd:         null,
        employeeCount:  null,
        industry:       entry.industry,
        daysInPipeline: entry.daysInStage || 0,
      });
      entry.leadScore    = score;
      entry.leadPriority = scoreToPriority(score);
      entry.scoreReasons = reasons;
    }

    if (stage !== "all") entries = entries.filter((e: any) => e.stage === stage);
    if (search) { const s = search.toLowerCase(); entries = entries.filter((e: any) => e.companyName.toLowerCase().includes(s)); }

    if (sort === "oldest") entries.sort((a: any, b: any) => +new Date(a.createdAt) - +new Date(b.createdAt));
    else if (sort === "value_high") entries.sort((a: any, b: any) => b.estimatedHigh - a.estimatedHigh);
    else if (sort === "value_low") entries.sort((a: any, b: any) => a.estimatedHigh - b.estimatedHigh);
    else entries.sort((a: any, b: any) => +new Date(b.createdAt) - +new Date(a.createdAt));

    const byStage: Record<string, { count: number; value: number }> = {};
    for (const st of STAGES) byStage[st] = { count: 0, value: 0 };
    let totalPipelineValue = 0, activeEngagements = 0, diagSentCount = 0, signedCount = 0;
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    let feesThisMonth = 0;

    // Use ALL entries (not filtered) for stats
    const allEntries = diagnostics.map((d: any) => {
      const pipe = pipeMap[d.id]; const ag = agMap[d.id]; const summary = d.result?.summary || {};
      let ds = "contacted"; if (d.status === "sent") ds = "diagnostic_sent"; if (ag?.status === "pending") ds = "agreement_out"; if (ag?.status === "signed" || d.status === "signed") ds = "signed";
      return { stage: pipe?.stage || ds, estHigh: summary.totalEstimatedHigh ?? 0, updatedAt: pipe?.updated_at || d.created_at };
    });

    for (const e of allEntries) {
      if (byStage[e.stage]) { byStage[e.stage].count++; byStage[e.stage].value += e.estHigh; }
      if (e.stage !== "lost") totalPipelineValue += e.estHigh;
      if (e.stage === "in_engagement") activeEngagements++;
      if (e.stage === "diagnostic_sent") diagSentCount++;
      if (["signed","in_engagement","fee_collected"].includes(e.stage)) signedCount++;
      if (e.stage === "fee_collected" && e.updatedAt >= monthStart) feesThisMonth += e.estHigh * 0.12;
    }

    const conversionRate = diagSentCount > 0 ? Math.round((signedCount / diagSentCount) * 100) : 0;
    const total = entries.length;
    const totalPages = Math.ceil(total / limit);
    const paged = entries.slice((page - 1) * limit, (page - 1) * limit + limit);

    return NextResponse.json({ success: true, entries: paged, stats: { totalPipelineValue, activeEngagements, feesCollectedThisMonth: Math.round(feesThisMonth), conversionRate, byStage }, pagination: { page, limit, total, totalPages } });
  } catch (err: any) {
    console.error("[Pipeline:GET]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  try {
    const { diagnosticId, reportId, stage, notes, followUpDate } = await req.json();

    if (!diagnosticId && !reportId) {
      return NextResponse.json({ success: false, error: "diagnosticId or reportId required" }, { status: 400 });
    }
    if (stage && !STAGES.includes(stage)) {
      return NextResponse.json({ success: false, error: "Invalid stage" }, { status: 400 });
    }

    // ── v2 flow: reportId-based pipeline entry ─────────────────────────
    if (reportId && !diagnosticId) {
      // Check if already exists
      const { data: existing } = await supabaseAdmin
        .from("tier3_pipeline")
        .select("id")
        .eq("report_id", reportId)
        .maybeSingle();

      if (existing) {
        const update: any = { updated_at: new Date().toISOString() };
        if (stage) update.stage = stage;
        if (notes !== undefined) update.notes = notes;
        if (followUpDate !== undefined) update.follow_up_date = followUpDate || null;
        // NOTE: Multi-step write — not atomic. Partial failure leaves inconsistent state.
    await supabaseAdmin.from("tier3_pipeline").update(update).eq("id", existing.id);
        return NextResponse.json({ success: true, id: existing.id, action: "updated" });
      }

      // Fetch business_id from the report
      const { data: report } = await supabaseAdmin
        .from("diagnostic_reports")
        .select("business_id, user_id")
        .eq("id", reportId)
        .single();

      const id = crypto.randomUUID();
      await supabaseAdmin.from("tier3_pipeline").insert({
        id,
        report_id:   reportId,
        business_id: report?.business_id || null,
        stage:       stage || "lead",
        notes:       notes || null,
        follow_up_date: followUpDate || null,
        created_at:  new Date().toISOString(),
        updated_at:  new Date().toISOString(),
      });
      return NextResponse.json({ success: true, id, action: "created" });
    }

    // ── Old flow: diagnosticId-based pipeline entry ────────────────────
    const { data: diag } = await supabaseAdmin
      .from("tier3_diagnostics")
      .select("id, user_id")
      .eq("id", diagnosticId)
      .single();
    if (!diag) return NextResponse.json({ success: false, error: "Diagnostic not found" }, { status: 404 });

    const { data: existing } = await supabaseAdmin
      .from("tier3_pipeline")
      .select("id")
      .eq("diagnostic_id", diagnosticId)
      .maybeSingle();

    if (existing) {
      const update: any = { updated_at: new Date().toISOString() };
      if (stage) update.stage = stage;
      if (notes !== undefined) update.notes = notes;
      if (followUpDate !== undefined) update.follow_up_date = followUpDate || null;
      await supabaseAdmin.from("tier3_pipeline").update(update).eq("id", existing.id);
      return NextResponse.json({ success: true, id: existing.id, action: "updated" });
    } else {
      const id = crypto.randomUUID();
      await supabaseAdmin.from("tier3_pipeline").insert({
        id, diagnostic_id: diagnosticId,
        stage: stage || "lead", notes: notes || null,
        follow_up_date: followUpDate || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return NextResponse.json({ success: true, id, action: "created" });
    }
  } catch (err: any) {
    console.error("[Pipeline:POST]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
