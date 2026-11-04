import { NextRequest, NextResponse } from "next/server";
import { generateTemplate } from "@/lib/excel";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") || "tool") as "tool" | "bom";

  try {
    const buffer = generateTemplate(type);
    const filename =
      type === "tool"
        ? "Walnut_Medical_Tool_Equipment_Template.xlsx"
        : "Walnut_Medical_BOM_Parts_Template.xlsx";

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
