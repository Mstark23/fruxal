// =============================================================================
// app/api/documents/upload/route.ts
// POST — upload document to Supabase Storage (not disk)
//
// SECURITY:
//   1. Magic-byte MIME validation — browser Content-Type cannot be trusted
//   2. Supabase Storage — files persist across cold starts (disk was ephemeral)
//   3. Path traversal impossible — no local filesystem write
//   4. 10 MB size cap enforced before reading the whole buffer
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 30;

const ALLOWED_TYPES = [
  { mime: "application/pdf", magic: [0x25, 0x50, 0x44, 0x46] },
  { mime: "image/png",       magic: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/jpeg",      magic: [0xff, 0xd8, 0xff] },
] as const;

function validateMagicBytes(buf: Uint8Array): string | null {
  for (const t of ALLOWED_TYPES) {
    if (t.magic.every((byte, i) => buf[i] === byte)) return t.mime;
  }
  return null;
}

function docTypeFromName(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("contract") || n.includes("agreement") || n.includes("engagement")) return "CONTRACT";
  if (n.includes("fee") || n.includes("schedule") || n.includes("rate"))              return "FEE_SCHEDULE";
  if (n.includes("invoice") || n.includes("bill"))                                    return "INVOICE";
  if (n.includes("proposal") || n.includes("quote"))                                  return "PROPOSAL";
  if (n.includes("t2") || n.includes("tax"))                                          return "TAX";
  if (n.includes("statement") || n.includes("financial"))                             return "FINANCIAL_STATEMENT";
  return "OTHER";
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId    = (session.user as any).id as string;
    const membership = await prisma.businessMember.findFirst({ where: { userId } });
    if (!membership) return NextResponse.json({ error: "No business found" }, { status: 400 });

    const formData = await request.formData();
    const file     = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large — maximum 10 MB" }, { status: 400 });
    }

    const arrayBuffer  = await file.arrayBuffer();
    const buffer       = new Uint8Array(arrayBuffer);
    const detectedMime = validateMagicBytes(buffer);

    if (!detectedMime) {
      return NextResponse.json(
        { error: "Only PDF, PNG, and JPEG files are accepted" },
        { status: 400 }
      );
    }

    const safeName    = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);
    const storagePath = `${membership.businessId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("documents")
      .upload(storagePath, Buffer.from(arrayBuffer), {
        contentType: detectedMime,
        upsert: false,
      });

    if (uploadError) {
      console.error("[Upload] Supabase Storage error:", uploadError.message);
      return NextResponse.json({ error: "Storage upload failed" }, { status: 500 });
    }

    const document = await prisma.document.create({
      data: {
        businessId: membership.businessId,
        fileName:   file.name,
        fileUrl:    storagePath,
        fileType:   detectedMime,
        docType:    docTypeFromName(file.name),
        status:     "UPLOADED",
      },
    });

    return NextResponse.json({
      message:  "File uploaded successfully",
      document: { id: document.id, fileName: document.fileName, docType: document.docType, status: document.status },
    });
  } catch (err: any) {
    console.error("[Upload] Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
