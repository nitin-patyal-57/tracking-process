import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { parseExcelBuffer } from "@/lib/excel";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const isExcelParse = formData.get("parseExcel") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // If Excel parse requested
    if (isExcelParse) {
      const items = parseExcelBuffer(buffer);
      return NextResponse.json({
        success: true,
        filename: file.name,
        items,
      });
    }

    // Process uploaded file (Datasheets / Documents)
    const mimeType = file.type || "application/octet-stream";
    const base64Data = buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    // On local development, try saving to public/uploads
    let fileUrl = dataUrl;
    if (!process.env.VERCEL) {
      try {
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const filename = `${timestamp}_${safeName}`;
        const filePath = path.join(process.cwd(), "public", "uploads", filename);
        await writeFile(filePath, buffer);
        fileUrl = `/uploads/${filename}`;
      } catch (e) {
        // Fallback to dataUrl if filesystem is not writable
        fileUrl = dataUrl;
      }
    }

    return NextResponse.json({
      success: true,
      filename: file.name,
      url: fileUrl,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "File upload failed" },
      { status: 500 }
    );
  }
}

