import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, industry, teamSize, region, province, monthlyRevenue, annualRevenue, employeeCount, tier } = await request.json();
    const userId = (session.user as any).id;
    const supabase = getSupabase();
    const businessId = crypto.randomUUID().replace(/-/g, "").slice(0, 25);

    // Region → currency mapping
    const currencyMap: Record<string, string> = { US: "USD", CA: "CAD", UK: "GBP", AU: "AUD", EU: "EUR" };
    const userRegion = region || "US";
    const currency = currencyMap[userRegion] || "USD";

    // Create business
    const { error: bizErr } = await supabase
      .from("businesses")
      .insert({
        id: businessId,
        name: name || "My Business",
        industry: industry || "OTHER",
        tier: tier || "mid-size-business",
        region: userRegion,
        country_code: userRegion,
        currency: currency,
        province: province || null,
        monthly_revenue: monthlyRevenue || null,
        annual_revenue: annualRevenue || null,
        employee_count: employeeCount || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

    if (bizErr) {
      console.error("Business insert error:", bizErr);
      return NextResponse.json({ error: "Failed to create business" }, { status: 500 });
    }

    // Add user as owner
    const { error: memErr } = await supabase
      .from("business_members")
      .insert({
        id: crypto.randomUUID().replace(/-/g, "").slice(0, 25),
        businessId: businessId,
        userId: userId,
        role: "OWNER",
        createdAt: new Date().toISOString(),
      });

    if (memErr) {
      console.error("Member insert error:", memErr);
      // Business created but member failed — still return business
    }

    return NextResponse.json(
      { message: "Business created", businessId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Business creation error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
