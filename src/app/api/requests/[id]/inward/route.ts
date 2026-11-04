import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const {
      storeInspectorId,
      packagingOk,
      quantityOk,
      specsMatched,
      inspectionNotes,
      handoverSignedByUserId,
      handoverSignature,
    } = body;

    const request = await prisma.procurementRequest.findUnique({
      where: { id },
      include: { purchaseOrder: true },
    });

    if (!request || !request.purchaseOrder) {
      return NextResponse.json(
        { error: "Purchase Order not found for this request." },
        { status: 404 }
      );
    }

    const po = request.purchaseOrder;

    // Create or update inward handover
    const inward = await prisma.inwardHandover.upsert({
      where: { poId: po.id },
      create: {
        poId: po.id,
        receivedDate: new Date(),
        storeInspectorId,
        packagingOk: packagingOk ?? true,
        quantityOk: quantityOk ?? true,
        specsMatched: specsMatched ?? true,
        inspectionNotes,
        handoverSignedByUserId,
        handoverSignature: handoverSignature || "Physical Handover Acknowledged",
        handoverTimestamp: handoverSignedByUserId ? new Date() : null,
      },
      update: {
        storeInspectorId,
        packagingOk: packagingOk ?? true,
        quantityOk: quantityOk ?? true,
        specsMatched: specsMatched ?? true,
        inspectionNotes,
        handoverSignedByUserId,
        handoverSignature: handoverSignature || "Physical Handover Acknowledged",
        handoverTimestamp: handoverSignedByUserId ? new Date() : undefined,
      },
    });

    // Update status to DELIVERED
    await prisma.procurementRequest.update({
      where: { id },
      data: {
        status: "DELIVERED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Inward inspection and handover signed off.",
      inward,
    });
  } catch (error: any) {
    console.error("Inward inspection error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

