// =============================================================================
// src/app/api/v2/leaks/report/route.ts — PDF LEAK REPORT
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { findUserLeaks } from "@/lib/find-user-leaks";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const SEV_COLORS: Record<string, { r: number; g: number; b: number }> = {
  critical: { r: 0.94, g: 0.27, b: 0.27 },
  high: { r: 0.98, g: 0.45, b: 0.09 },
  medium: { r: 0.92, g: 0.72, b: 0.03 },
  low: { r: 0.23, g: 0.51, b: 0.96 },
};

// Accent stripping for pdf-lib StandardFonts
const ACCENT_MAP: Record<string, string> = {
  "\u00e9": "e", "\u00e8": "e", "\u00ea": "e", "\u00eb": "e",
  "\u00e0": "a", "\u00e2": "a", "\u00f9": "u", "\u00fb": "u",
  "\u00f4": "o", "\u00ee": "i", "\u00ef": "i", "\u00e7": "c",
  "\u00c9": "E", "\u00c8": "E", "\u00ca": "E", "\u00c0": "A",
  "\u00d9": "U", "\u00d4": "O", "\u00ce": "I", "\u00c7": "C",
  "\u2019": "'", "\u2018": "'", "\u201c": "\"", "\u201d": "\"",
  "\u2014": "-", "\u2013": "-",
};

function stripAccents(t: string): string {
  return t.replace(/[^\x00-\x7F]/g, ch => ACCENT_MAP[ch] || ch);
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { leaks, healthScore, province, industry } = await findUserLeaks(userId);

    const detected = leaks.filter(l => l.status !== "fixed" && l.status !== "dismissed");
    const fixed = leaks.filter(l => l.status === "fixed");
    const potentialLoss = detected.reduce((s, l) => s + l.impact_max, 0);
    const savedAmount = fixed.reduce((s, l) => s + l.savings_amount, 0);
    const score = healthScore ?? 50;

    // ═══ BUILD PDF ═══
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const W = 595.28, H = 841.89, M = 50;
    const CW = W - M * 2;

    const teal = rgb(0.05, 0.58, 0.53);
    const dark = rgb(0.15, 0.15, 0.15);
    const gray = rgb(0.45, 0.45, 0.45);
    const light = rgb(0.92, 0.92, 0.92);
    const red = rgb(0.86, 0.15, 0.15);
    const green = rgb(0.09, 0.64, 0.25);

    let page = pdf.addPage([W, H]);
    let y = H - M;

    function newPageIfNeeded(need: number) {
      if (y - need < M + 30) { page = pdf.addPage([W, H]); y = H - M; }
    }
    function text(t: string, x: number, yy: number, s: number, f = font, c = dark) {
      const safe = stripAccents(t);
      try { page.drawText(safe, { x, y: yy, size: s, font: f, color: c }); } catch(e) { /* non-fatal */ }
    }

    // Header
    text("Fruxal", M, y, 22, fontBold, teal); y -= 18;
    text("Rapport de fuites d'affaires", M, y, 14, font, gray); y -= 16;
    text(`${industry} - ${province}`, M, y, 10, font, gray); y -= 14;
    const d = new Date().toISOString().split("T")[0];
    text(d, M, y, 10, font, gray); y -= 8;
    page.drawRectangle({ x: M, y: y - 3, width: CW, height: 3, color: teal }); y -= 20;

    // Stats
    const bw = (CW - 30) / 4, bh = 55;
    const stats = [
      { n: `${leaks.length}`, l: "Fuites trouvees", c: red },
      { n: `$${(potentialLoss ?? 0).toLocaleString()}`, l: "Perte potentielle/an", c: red },
      { n: `$${(savedAmount ?? 0).toLocaleString()}`, l: "Deja economise", c: green },
      { n: `${score}`, l: "Score de sante", c: teal },
    ];
    for (let i = 0; i < 4; i++) {
      const bx = M + i * (bw + 10);
      page.drawRectangle({ x: bx, y: y - bh, width: bw, height: bh, color: light, borderColor: rgb(0.85, 0.85, 0.85), borderWidth: 0.5 });
      const nw = fontBold.widthOfTextAtSize(stats[i].n, 18);
      text(stats[i].n, bx + (bw - nw) / 2, y - 25, 18, fontBold, stats[i].c);
      const lw = font.widthOfTextAtSize(stats[i].l, 7);
      text(stats[i].l, bx + (bw - lw) / 2, y - 42, 7, font, gray);
    }
    y -= bh + 15;
    page.drawRectangle({ x: M, y: y - 1, width: CW, height: 1, color: light }); y -= 18;

    // Leak cards
    text(`Fuites detectees (${leaks.length})`, M, y, 13, fontBold, dark); y -= 18;

    if (leaks.length === 0) {
      text("Aucune fuite detectee.", M, y, 10, font, gray); y -= 20;
    }

    for (const leak of leaks) {
      const ch = leak.description ? 75 : 55;
      newPageIfNeeded(ch + 10);
      const isFix = leak.status === "fixed";
      const sc = SEV_COLORS[leak.severity] || SEV_COLORS.medium;
      const sevC = rgb(sc.r, sc.g, sc.b);

      page.drawRectangle({ x: M, y: y - ch, width: CW, height: ch,
        color: isFix ? rgb(0.94, 0.99, 0.95) : rgb(0.98, 0.98, 0.98),
        borderColor: isFix ? rgb(0.53, 0.93, 0.67) : rgb(0.88, 0.88, 0.88), borderWidth: 0.5 });

      const sv = leak.severity.toUpperCase();
      const svW = fontBold.widthOfTextAtSize(sv, 7);
      page.drawRectangle({ x: M + 10, y: y - 18, width: svW + 10, height: 14, color: sevC });
      text(sv, M + 15, y - 15, 7, fontBold, rgb(1, 1, 1));

      const tt = leak.title.length > 50 ? leak.title.substring(0, 50) + "..." : leak.title;
      text(tt, M + 15 + svW + 15, y - 15, 10, fontBold, isFix ? gray : dark);

      const it = `$${(leak.impact_max ?? 0).toLocaleString()}/an`;
      const iw = fontBold.widthOfTextAtSize(it, 11);
      text(it, M + CW - 10 - iw, y - 15, 11, fontBold, isFix ? gray : red);

      if (isFix) {
        const ft = "Corrige"; const fw = fontBold.widthOfTextAtSize(ft, 8);
        text(ft, M + CW - 10 - fw, y - 28, 8, fontBold, green);
      }

      if (leak.description) {
        const dt = leak.description.length > 120 ? leak.description.substring(0, 120) + "..." : leak.description;
        text(dt, M + 10, y - 35, 8, font, gray);
      }

      const rt = `Impact estime: $${(leak.impact_min ?? 0).toLocaleString()} - $${(leak.impact_max ?? 0).toLocaleString()}/an`;
      text(rt, M + 10, y - (leak.description ? 52 : 35), 7, font, gray);

      y -= ch + 6;
    }

    // Footer
    newPageIfNeeded(50); y -= 10;
    page.drawRectangle({ x: M, y: y - 1, width: CW, height: 1, color: light }); y -= 18;
    const f1 = "Genere par Fruxal - fruxal.com";
    text(f1, M + (CW - font.widthOfTextAtSize(f1, 8)) / 2, y, 8, font, gray); y -= 12;
    const f2 = "Les resultats sont des estimations basees sur les references de l'industrie.";
    text(f2, M + (CW - font.widthOfTextAtSize(f2, 7)) / 2, y, 7, font, gray);

    const pdfBytes = await pdf.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="rapport-fuites-${d}.pdf"`,
        "Content-Length": pdfBytes.length.toString(),
      },
    });
  } catch (err: any) {
    console.error("[Report] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
