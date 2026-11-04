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
      qualityRating,
      specsVerification,
      fulfillmentRating,
      feedbackComments,
      submittedByUserId,
    } = body;

    if (!feedbackComments || feedbackComments.trim() === "") {
      return NextResponse.json(
        { error: "Mandatory Feedback Submission required: please enter quality & fulfillment feedback comments." },
        { status: 400 }
      );
    }

    const request = await prisma.procurementRequest.findUnique({
      where: { id },
      include: {
        purchaseOrder: {
          include: { inwardHandover: true },
        },
      },
    });

    if (!request || !request.purchaseOrder || !request.purchaseOrder.inwardHandover) {
      return NextResponse.json(
        { error: "Cannot submit feedback: Inward inspection and physical handover must be completed first." },
        { status: 400 }
      );
    }

    const handoverId = request.purchaseOrder.inwardHandover.id;

    const feedback = await prisma.closureFeedback.upsert({
      where: { handoverId },
      create: {
        handoverId,
        qualityRating: parseInt(qualityRating, 10) || 5,
        specsVerification: specsVerification || "PASSED",
        fulfillmentRating: parseInt(fulfillmentRating, 10) || 5,
        feedbackComments,
        submittedByUserId: submittedByUserId || request.requesterId,
      },
      update: {
        qualityRating: parseInt(qualityRating, 10) || 5,
        specsVerification: specsVerification || "PASSED",
        fulfillmentRating: parseInt(fulfillmentRating, 10) || 5,
        feedbackComments,
        submittedByUserId: submittedByUserId || request.requesterId,
      },
    });

    // Close the order!
    const updatedRequest = await prisma.procurementRequest.update({
      where: { id },
      data: {
        status: "CLOSED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Feedback submitted and order successfully closed.",
      feedback,
      request: updatedRequest,
    });
  } catch (error: any) {
    console.error("Feedback submission error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

