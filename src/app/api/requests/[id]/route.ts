import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { determineApprovalRouting } from "@/lib/routing";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const request = await prisma.procurementRequest.findUnique({
      where: { id },
      include: {
        requester: true,
        items: {
          include: {
            alternates: true,
          },
        },
        approvals: {
          include: {
            approver: true,
          },
          orderBy: { createdAt: "desc" },
        },
        purchaseOrder: {
          include: {
            trackingUpdates: {
              orderBy: { createdAt: "desc" },
            },
            inwardHandover: {
              include: {
                feedback: true,
              },
            },
          },
        },
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const expectedApprovers = determineApprovalRouting(
      {
        requestType: request.requestType,
        totalEstimatedCost: request.totalEstimatedCost,
        requesterId: request.requesterId,
        technicalValidationRequired: request.technicalValidationRequired,
      },
      request.requester
    );

    return NextResponse.json({ request, expectedApprovers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

