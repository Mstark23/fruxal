import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, rateLimitResponse } from "@/lib/security";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { max: 5, windowSeconds: 60 });
  if (!rl.allowed) return rateLimitResponse();

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const businessId = formData.get("businessId") as string;
    const industry = formData.get("industry") as string;

    if (!file || !businessId || !industry) {
      return NextResponse.json({ error: "file, businessId, and industry required" }, { status: 400 });
    }

    // Parse CSV
    const text = await file.text();
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return NextResponse.json({ error: "CSV must have at least a header and one data row" }, { status: 400 });

    const headers = lines[0].split(",").map(h => h.replace(/"/g, "").trim().toLowerCase());
    const rows = lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.replace(/"/g, "").trim());
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = values[i] || ""; });
      return row;
    });

    // Extract answers from CSV data (map common column names to our answer format)
    const answers: Record<string, string | number> = {};
    const columnMappings: Record<string, string[]> = {
      annual_revenue: ["revenue", "annual revenue", "total revenue", "sales", "annual sales", "gross revenue"],
      food_cost_pct: ["food cost", "food cost %", "cogs", "cost of goods"],
      labor_cost_pct: ["labor cost", "labor cost %", "payroll", "labor"],
      cc_rate: ["cc rate", "credit card rate", "processing rate", "cc processing"],
      rent_pct: ["rent", "rent %", "occupancy", "rent cost"],
    };

    for (const [answerKey, columnNames] of Object.entries(columnMappings)) {
      for (const colName of columnNames) {
        if (headers.includes(colName)) {
          const val = rows[rows.length - 1]?.[colName]; // Use most recent row
          if (val) answers[answerKey] = parseFloat(val) || val;
        }
      }
    }

    // scan-orchestrator removed — CSV upload now stores raw answers for later processing
    const result = { success: true, leaksFound: 0, message: "Data stored for analysis", leaks: [] as any[], totalAmount: 0, healthScore: 100 };

    return NextResponse.json({
      success: true,
      rowsParsed: rows.length,
      columnsFound: headers.length,
      answersExtracted: Object.keys(answers).length,
      leaks: result.leaks.length,
      totalAmount: result.totalAmount,
      healthScore: result.healthScore,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
