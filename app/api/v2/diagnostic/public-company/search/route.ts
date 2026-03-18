// app/api/v2/diagnostic/public-company/search/route.ts
// GET ?q=royal+bank — search TSX companies by name or ticker

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const FMP_KEY = process.env.FMP_API_KEY || "";

  if (!FMP_KEY) {
    return NextResponse.json({
      results: [],
      error: "FMP_API_KEY not configured",
    }, { status: 500 });
  }

  try {
    // Search without exchange filter — FMP free tier doesn't always support it
    // We filter results client-side for TSX/TSXV
    const url = `https://financialmodelingprep.com/api/v3/search?query=${encodeURIComponent(q)}&limit=20&apikey=${FMP_KEY}`;

    const res = await fetch(url, { next: { revalidate: 300 } } as RequestInit);

    if (!res.ok) {
      console.error("[Search] FMP error:", res.status, await res.text());
      return NextResponse.json({ results: [] });
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("[Search] Unexpected FMP response:", data);
      return NextResponse.json({ results: [] });
    }

    // Filter to TSX/TSXV only
    const TSX_EXCHANGES = ["TSX", "TSXV", "TSE"];
    const results = data
      .filter((c: any) => {
        const ex = (c.exchangeShortName || c.stockExchange || "").toUpperCase();
        return TSX_EXCHANGES.some((e) => ex.includes(e));
      })
      .slice(0, 8)
      .map((c: any) => ({
        symbol: c.symbol,
        name: c.name || c.companyName || c.symbol,
        exchange: c.exchangeShortName || c.stockExchange || "TSX",
        currency: c.currency || "CAD",
      }));

    return NextResponse.json({ results });

  } catch (err: any) {
    console.error("[Search] Error:", err.message);
    return NextResponse.json({ results: [], error: err.message });
  }
}
