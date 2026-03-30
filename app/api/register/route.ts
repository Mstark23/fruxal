// =============================================================================
// POST /api/register — Create account + bridge prescan data
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/services/email/service";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { scoreLeadQuality, scoreToPriority } from "@/lib/lead-score";
import { notifyAdmin } from "@/lib/admin-notify";
import { pickBestRep } from "@/lib/rep-picker";

export const maxDuration = 30; // Vercel function timeout (seconds)

// Rate limiter: 5 registrations per IP per hour — prevents account spam
const _regRl = new Map<string, { c: number; r: number }>();
function regRateCheck(ip: string): boolean {
  const now = Date.now();
  const entry = _regRl.get(ip);
  if (!entry || entry.r < now) { _regRl.set(ip, { c: 1, r: now + 3_600_000 }); return true; }
  entry.c++;
  return entry.c <= 5;
}
setInterval(() => { const now = Date.now(); for (const [k,v] of _regRl) if (v.r < now) _regRl.delete(k); }, 1_800_000);

export async function POST(request: NextRequest) {
  // Rate limit
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!regRateCheck(ip)) {
    return NextResponse.json({ error: "Too many registration attempts. Try again later." }, { status: 429 });
  }

  try {
    const { email: rawEmail, password, name, prescanRunId, referralCode, utm_source, utm_medium, utm_campaign } = await request.json();

    if (!rawEmail || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const email = rawEmail.toLowerCase().trim();
    const sb = supabaseAdmin;

    const { data: existing } = await sb
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = crypto.randomUUID();
    const { data: user, error } = await sb
      .from("users")
      .insert({ id: userId, email, name: name || null, password_hash: hashedPassword, utm_source: utm_source || null, utm_medium: utm_medium || null, utm_campaign: utm_campaign || null })
      .select("id")
      .single();

    if (error || !user) {
      console.error("Register error:", error);
      return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
    }

    let businessId: string | null = null;
    let qualifiedPlan = "solo";

    if (prescanRunId) {
      businessId = crypto.randomUUID();

      let industry = "generic_small_business";
      let province: string | null = null;
      let revenue: number | null = null;
      let employeeCount: number | null = null;
      let prescanRunExists = false;

      try {
        const { data: run } = await sb.from("prescan_runs").select("id, user_id, industry_slug, province, annual_revenue, employee_count, created_at").eq("id", prescanRunId).single();
        if (run) {
          prescanRunExists = true;
          industry = run.industry_slug || industry;
          province = run.province || null;
          revenue = run.annual_revenue || null;
          employeeCount = run.employee_count || null;
          process.env.NODE_ENV !== "production" && console.log("✅ Bridge source A: prescan_runs found");
        }
      } catch (e: any) {
        console.warn("⚠️ Bridge source A (prescan_runs):", e.message);
      }

      if (!prescanRunExists) {
        try {
          // Query top-level prescan_run_id column first (set by Gap 2 fix in prescan-chat route)
          let prData: any = null;
          const { data: prDirect } = await sb
            .from("prescan_results")
            .select("*")
            .eq("prescan_run_id", prescanRunId)
            .order("created_at", { ascending: false })
            .limit(1);

          if (prDirect?.[0]) {
            prData = prDirect[0];
            process.env.NODE_ENV !== "production" && console.log("✅ Bridge source B: prescan_results via top-level column");
          } else {
            // Legacy: prescan_run_id inside input_snapshot JSONB
            const { data: prJsonb } = await sb
              .from("prescan_results")
              .select("*")
              .contains("input_snapshot", { prescan_run_id: prescanRunId })
              .order("created_at", { ascending: false })
              .limit(1);
            if (prJsonb?.[0]) {
              prData = prJsonb[0];
              process.env.NODE_ENV !== "production" && console.log("✅ Bridge source B: prescan_results via JSONB fallback");
            }
          }

          if (prData) {
            const snap = prData.input_snapshot || {};
            industry = snap.industry || prData.industry || industry;
            province = snap.province || prData.province || null;
            revenue = snap.annual_revenue || (snap.monthly_revenue ? snap.monthly_revenue * 12 : null);
            await sb.from("prescan_results").update({ user_id: userId }).eq("id", prData.id);
          }
        } catch (e: any) {
          console.warn("⚠️ Bridge source B (prescan_results):", e.message);
        }
      }

      const hasProfileData = !!(industry && industry !== "generic_small_business" && province);

      if (prescanRunExists) {
        try {
          await sb.from("prescan_runs").update({
            user_id: userId,
            business_id: businessId,
          }).eq("id", prescanRunId);
          process.env.NODE_ENV !== "production" && console.log("✅ Bridge step 2: prescan_runs linked");
        } catch (e: any) {
          console.warn("⚠️ Bridge step 2:", e.message);
        }
      }

      try {
        await sb.from("detected_leaks").update({
          business_id: businessId,
        }).eq("prescan_run_id", prescanRunId);
      } catch (e: any) {
        console.warn("⚠️ Bridge step 3 (detected_leaks):", e.message);
      }

      try {
        // Query by BOTH top-level column AND JSONB fallback
        const [{ data: prByCol }, { data: prByJson }] = await Promise.all([
          sb.from("prescan_results").select("id").eq("prescan_run_id", prescanRunId),
          sb.from("prescan_results").select("id").contains("input_snapshot", { prescan_run_id: prescanRunId }),
        ]);
        const prResults = [...(prByCol || []), ...(prByJson || [])];
        const uniqueIds = [...new Set(prResults.map((pr: any) => pr.id))];
        if (uniqueIds.length > 0) {
          await sb.from("prescan_results").update({ user_id: userId }).in("id", uniqueIds);
          process.env.NODE_ENV !== "production" && console.log(`✅ Bridge step 3.5: ${uniqueIds.length} prescan_results linked (col+jsonb)`);
        }
      } catch (e: any) {
        console.warn("⚠️ Bridge step 3.5:", e.message);
      }

      try {
        await sb.from("business_profiles").upsert({
          business_id: businessId,
          user_id: userId,
          business_name: name ? `${name}'s Business` : "My Business",
          industry, industry_slug: industry,
          province,
          monthly_revenue: revenue ? Math.round(revenue / 12) : null,
          annual_revenue: revenue || null,
          employee_count: employeeCount,
          onboarding_completed: hasProfileData,
          onboarding_completed_at: hasProfileData ? new Date().toISOString() : null,
          tour_completed_at: hasProfileData ? new Date().toISOString() : null,
          tour_step_reached: hasProfileData ? 5 : 0,
          updated_at: new Date().toISOString(),
        }, { onConflict: "business_id" });
        process.env.NODE_ENV !== "production" && console.log("✅ Bridge step 4: business_profiles created");
      } catch (e: any) {
        console.warn("⚠️ Bridge step 4 (full):", e.message);
        try {
          await sb.from("business_profiles").upsert({
            business_id: businessId,
            user_id: userId,
            business_name: name ? `${name}'s Business` : "My Business",
            industry, industry_slug: industry,
            province,
            annual_revenue: revenue || null,
            onboarding_completed: hasProfileData,
            updated_at: new Date().toISOString(),
          }, { onConflict: "business_id" });
          process.env.NODE_ENV !== "production" && console.log("✅ Bridge step 4 fallback 1: without tour columns");
        } catch (e2: any) {
          console.warn("⚠️ Bridge step 4 fallback 1:", e2.message);
          try {
            await sb.from("business_profiles").upsert({
              business_id: businessId, user_id: userId,
              industry, province, annual_revenue: revenue || null,
              onboarding_completed: hasProfileData,
              updated_at: new Date().toISOString(),
            }, { onConflict: "user_id" });
            process.env.NODE_ENV !== "production" && console.log("✅ Bridge step 4 fallback 2: minimal");
          } catch { /* non-fatal */ }
        }
      }

      // ─── Derive tier — assign to outer qualifiedPlan (no const) ───
      const derivedTier = "Free";
      qualifiedPlan =
        (revenue && revenue >= 5_000_000) ? "enterprise" :
        (employeeCount && employeeCount > 0) || (revenue && revenue >= 500_000) ? "business" :
        "solo";

      try {
        await sb.from("businesses").upsert({
          id: businessId, owner_user_id: userId,
          name: name ? `${name}'s Business` : "My Business",
          industry, industry_slug: industry,
          province, annual_revenue: revenue || null, tier: derivedTier,
          qualified_plan: qualifiedPlan,
        }, { onConflict: "id" });
      } catch (e: any) {
        console.warn("⚠️ Bridge step 5 (businesses):", e.message);
      }

      try {
        await sb.from("business_members").upsert({
          userId, businessId, role: "owner",
        }, { onConflict: "userId,businessId" });
      } catch (e: any) {
        console.warn("⚠️ Bridge step 6 (business_members):", e.message);
      }

      try {
        // auto_detect_flags RPC removed — flag detection happens via prescan engine
        // await sb.rpc("auto_detect_flags", { p_business_id: businessId });
      } catch { /* non-fatal */ }

      try {
        const { data: detectedLeaks } = await sb
          .from("detected_leaks")
          .select("leak_type_code, title, annual_impact_min, category, severity")
          .eq("prescan_run_id", prescanRunId);

        if (detectedLeaks && detectedLeaks.length > 0) {
          const leakRows = detectedLeaks.map((l: any) => ({
            user_id: userId,
            leak_slug: l.leak_type_code || l.title?.toLowerCase().replace(/\s+/g, "_") || "unknown",
            status: "detected",
            savings_amount: l.annual_impact_min ?? 0,
          }));
          await sb.from("user_leak_status").upsert(leakRows, { onConflict: "user_id,leak_slug" });
          process.env.NODE_ENV !== "production" && console.log(`✅ Bridge step 8: ${leakRows.length} leaks seeded from detected_leaks`);
        } else {
          const { data: pr } = await sb
            .from("prescan_results")
            .select("teaser_leaks")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1);

          if (pr?.[0]?.teaser_leaks?.length > 0) {
            const leakRows = (pr?.[0]?.teaser_leaks || []).map((l: any) => ({
              user_id: userId,
              leak_slug: l.slug || "unknown",
              status: "detected",
              savings_amount: l.impact_min ?? 0,
            }));
            await sb.from("user_leak_status").upsert(leakRows, { onConflict: "user_id,leak_slug" });
            process.env.NODE_ENV !== "production" && console.log(`✅ Bridge step 8: ${leakRows.length} leaks seeded from prescan_results`);
          } else if (province) {
            const { data: genericLeaks } = await sb
              .from("provincial_leak_detectors")
              .select("slug, annual_impact_min")
              .eq("province", province)
              .eq("is_active", true);
            if (genericLeaks && genericLeaks.length > 0) {
              const leakRows = genericLeaks.map((g: any) => ({
                user_id: userId, leak_slug: g.slug,
                status: "detected", savings_amount: g.annual_impact_min ?? 0,
              }));
              await sb.from("user_leak_status").upsert(leakRows, { onConflict: "user_id,leak_slug" });
              process.env.NODE_ENV !== "production" && console.log(`✅ Bridge step 8: ${genericLeaks.length} leaks from provincial defaults`);
            }
          }
        }
      } catch (e: any) {
        console.warn("⚠️ Bridge step 8 (leak seeding):", e.message);
      }

      process.env.NODE_ENV !== "production" && console.log(`✅ Prescan bridge complete: user=${userId}, biz=${businessId}, prescan=${prescanRunId}`);
    }

    // Auto-assign HOT leads at registration (non-blocking)
    // We have province/industry/revenue from prescan_runs at this point
    if (prescanRunId && userId) {
      (async () => {
        try {
          const { data: run } = await sb
            .from("prescan_runs")
            .select("province, industry_slug, annual_revenue, employee_count")
            .eq("id", prescanRunId)
            .maybeSingle();

          const prescanResults = await sb
            .from("prescan_results")
            .select("summary")
            .eq("prescan_run_id", prescanRunId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          const leakTotal = (prescanResults?.data as any)?.summary?.leak_range_max ?? 0;
          const rev       = run?.annual_revenue ?? 0;

          const { score } = scoreLeadQuality({
            annualRevenue:  rev,
            estimatedLeak:  leakTotal,
            province:       run?.province       || null,
            hasAccountant:  null,
            lastTaxReview:  null,
            doesRd:         null,
            employeeCount:  run?.employee_count ?? null,
            industry:       run?.industry_slug  || null,
            daysInPipeline: 0,
          });

          if (score >= 60) {
            // Find best rep for this province
            const rep = await pickBestRep(run?.province || null);

            if (rep) {
              const baseUrl = process.env.NEXTAUTH_URL || "https://fruxal.ca";
              notifyAdmin({
              type: "hot_lead_assigned",
              company: email,
              province: run?.province || undefined,
              industry: run?.industry_slug || undefined,
              score,
              link: `${baseUrl}/admin/tier3`,
            }).catch((e: any) => console.warn("[Register] Admin notify failed:", e.message));
            await fetch(baseUrl + "/api/admin/assign-rep", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": "Bearer " + process.env.CRON_SECRET,
                },
                body: JSON.stringify({
                  userId,
                  repId: rep.id,
                  notes: `Auto-assigned at registration. Lead score: ${score}. Prescan: ${prescanRunId}.`,
                }),
              }).catch((e: any) => console.warn("[Register] Rep auto-assign failed:", e.message));
            }
          }
        } catch { /* non-fatal — never block registration */ }
      })();
    }

    // Track referral if code provided
    if (referralCode && userId) {
      fetch((process.env.NEXTAUTH_URL || "https://fruxal.ca") + "/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralCode, newUserId: userId }),
      }).catch((e: any) => console.warn("[Register] Referral tracking failed:", e.message));
    }

    // Send welcome email (non-blocking)
    // hasRep hint: if businessId exists and plan is solo (T1/T2), check score
    let expectRep = false;
    if (prescanRunId && businessId) {
      try {
        const { data: scoreRun } = await sb
          .from("prescan_runs")
          .select("annual_revenue, employee_count")
          .eq("id", prescanRunId)
          .maybeSingle();
        const rev = scoreRun?.annual_revenue ?? 0;
        if (rev >= 100_000 || (scoreRun?.employee_count ?? 0) >= 3) expectRep = true;
      } catch { /* non-fatal */ }
    }
    sendWelcomeEmail({
      to:           email,
      name:         name || undefined,
      qualifiedPlan,
      teaserLeaks:  [],
      hasRep:       expectRep,
    }).catch((err: any) => console.warn("[Register] Welcome email failed:", err.message));

    return NextResponse.json(
      { success: true, userId: user.id, businessId, qualifiedPlan },
      { status: 201 }
    );

  } catch (err: any) {
    console.error("[Register] Error:", err);
    return NextResponse.json({ error: err.message || "Registration failed" }, { status: 500 });
  }
}
