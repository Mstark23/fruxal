import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const membership = await prisma.businessMember.findFirst({ where: { userId } });
    if (!membership) {
      return NextResponse.json({ error: "No business found" }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only PDF and image files are allowed" }, { status: 400 });
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    // Create uploads directory
    const uploadsDir = path.join(process.cwd(), "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    // Determine doc type from filename
    let docType = "OTHER";
    const nameLower = file.name.toLowerCase();
    if (nameLower.includes("contract") || nameLower.includes("agreement") || nameLower.includes("engagement")) {
      docType = "CONTRACT";
    } else if (nameLower.includes("fee") || nameLower.includes("schedule") || nameLower.includes("rate")) {
      docType = "FEE_SCHEDULE";
    } else if (nameLower.includes("invoice") || nameLower.includes("bill")) {
      docType = "INVOICE";
    } else if (nameLower.includes("proposal") || nameLower.includes("quote")) {
      docType = "PROPOSAL";
    }

    // Create document record
    const document = await prisma.document.create({
      data: {
        businessId: membership.businessId,
        fileName: file.name,
        fileUrl: `/uploads/${fileName}`,
        fileType: file.type,
        docType,
        status: "UPLOADED",
      },
    });

    return NextResponse.json({
      message: "File uploaded successfully",
      document: {
        id: document.id,
        fileName: document.fileName,
        docType: document.docType,
        status: document.status,
      },
    });

  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
