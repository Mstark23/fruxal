import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { parseCsv } from "@/server/ingestion/parseCsv";
import { categorizeBatch } from "@/server/ingestion/categorize";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    // ── Auth ──
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sb = getSupabase();

    // ── Get business ──
    const { data: biz } = await sb
      .from("businesses")
      .select("id")
      .eq("owner_user_id", (session!.user as any).id)
      .single();

    if (!biz) {
      return NextResponse.json({ error: "No business found" }, { status: 404 });
    }

    // ── Parse form data ──
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const sourceName = (formData.get("source_name") as string) || "CSV Upload";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.endsWith(".csv") && !file.type.includes("csv") && !file.type.includes("text")) {
      return NextResponse.json({ error: "Only CSV files are supported" }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Max 10MB." }, { status: 400 });
    }

    // ── Read & parse CSV ──
    const csvText = await file.text();
    let parsed;
    try {
      parsed = parseCsv(csvText);
    } catch (e: any) {
      return NextResponse.json({ error: `CSV parse error: ${e.message}` }, { status: 400 });
    }

    if (parsed.transactions.length === 0) {
      return NextResponse.json({ error: "No valid transactions found in CSV" }, { status: 400 });
    }

    // ── Create data source ──
    const { data: source, error: srcErr } = await sb
      .from("data_sources")
      .insert({
        business_id: biz.id,
        source_type: "csv_upload",
        source_name: sourceName,
        status: "processing",
        total_rows: parsed.transactions.length,
        metadata: {
          file_name: file.name,
          file_size: file.size,
          columns: parsed.columns,
          mapping: parsed.mapping,
          warnings: parsed.warnings,
          skipped: parsed.skipped,
        },
      })
      .select("id")
      .single();

    if (srcErr || !source) {
      console.error("Data source insert error:", srcErr);
      return NextResponse.json({ error: "Failed to create data source" }, { status: 500 });
    }

    // ── Auto-categorize ──
    const categories = categorizeBatch(
      parsed.transactions.map(t => ({ description: t.description, amount: t.amount }))
    );

    // ── Dedup check ──
    const hashes = parsed.transactions.map(t => t.hash);
    const { data: existingRows } = await sb
      .from("raw_transactions")
      .select("hash")
      .eq("business_id", biz.id)
      .in("hash", hashes);

    const existingHashes = new Set((existingRows || []).map(r => r.hash));

    // ── Insert transactions ──
    const rows = parsed.transactions.map((t, i) => ({
      business_id: biz.id,
      data_source_id: source.id,
      transaction_date: t.transaction_date,
      description: t.description,
      amount: t.amount,
      category_code: categories[i].category_code,
      auto_categorized: categories[i].confidence !== "low",
      user_confirmed: false,
      hash: t.hash,
      is_duplicate: existingHashes.has(t.hash),
      raw_data: t.raw_data,
    }));

    let inserted = 0;
    let duplicates = 0;
    const batchSize = 500;

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const newRows = batch.filter(r => !r.is_duplicate);
      duplicates += batch.length - newRows.length;

      if (newRows.length > 0) {
        const { error: insertErr } = await sb.from("raw_transactions").insert(newRows);
        if (insertErr) {
          console.error("Transaction insert error batch", i, insertErr);
        } else {
          inserted += newRows.length;
        }
      }
    }

    // ── Update data source status ──
    const mappedCount = rows.filter(r => r.category_code && r.category_code !== "other_expense").length;
    await sb
      .from("data_sources")
      .update({
        status: "active",
        total_rows: inserted,
        mapped_rows: mappedCount,
        last_sync_at: new Date().toISOString(),
      })
      .eq("id", source.id);

    // ── Categorization stats ──
    const catCounts: Record<string, number> = {};
    rows.forEach(r => {
      if (r.category_code && !r.is_duplicate) {
        catCounts[r.category_code] = (catCounts[r.category_code] || 0) + 1;
      }
    });

    const dates = parsed.transactions.map(t => t.transaction_date).sort();
    const dateRange = { from: dates[0], to: dates[dates.length - 1] };

    return NextResponse.json({
      success: true,
      data_source_id: source.id,
      stats: {
        total_parsed: parsed.transactions.length,
        inserted,
        duplicates,
        skipped: parsed.skipped,
        warnings: parsed.warnings.length,
        categorized: mappedCount,
        uncategorized: inserted - mappedCount,
        date_range: dateRange,
        categories: catCounts,
      },
      mapping: parsed.mapping,
    });

  } catch (e: any) {
    console.error("Upload CSV error:", e);
    return NextResponse.json({ error: e.message || "Upload failed" }, { status: 500 });
  }
}
