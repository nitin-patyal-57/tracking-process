import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { determineApprovalRouting } from "@/lib/routing";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const {
      approverId,
      decision, // "APPROVED" | "REJECTED"
      comments,
      stage,
      estimatedCostIfBlank,
    } = body;

    if (!approverId || !decision) {
      return NextResponse.json(
        { error: "Approver ID and Decision are required." },
        { status: 400 }
      );
    }

    const request = await prisma.procurementRequest.findUnique({
      where: { id },
      include: {
        requester: true,
        approvals: true,
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }

    const approver = await prisma.user.findUnique({
      where: { id: approverId },
    });

    if (!approver) {
      return NextResponse.json({ error: "Approver not found." }, { status: 404 });
    }

    // Mandatory Reason on Rejection
    if (decision === "REJECTED" && (!comments || comments.trim() === "")) {
      return NextResponse.json(
        { error: "Mandatory Rejection Reason is required to reject a request." },
        { status: 400 }
      );
    }

    // If decision is REJECTED
    if (decision === "REJECTED") {
      const updated = await prisma.procurementRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          currentPhase: "PHASE_1", // loops back to requester
          rejectionReason: comments,
          rejectedBy: approver.name,
          rejectedAt: new Date(),
          approvals: {
            create: {
              approverId,
              roleName: approver.designation,
              stage: stage || "REVIEW_REJECTED",
              decision: "REJECTED",
              comments,
            },
          },
        },
        include: { approvals: true, requester: true },
      });

      return NextResponse.json({ success: true, request: updated });
    }

    // If decision is APPROVED
    // If price was blank and business team filled it:
    let newCost = request.totalEstimatedCost;
    if (estimatedCostIfBlank && (!newCost || newCost === 0)) {
      newCost = parseFloat(estimatedCostIfBlank);
    }

    // Log the approval
    await prisma.approvalLog.create({
      data: {
        requestId: id,
        approverId,
        roleName: approver.designation,
        stage: stage || "APPROVAL",
        decision: "APPROVED",
        comments: comments || "Approved as per SOP.",
      },
    });

    // Check if ready for Phase 3:
    // For BOM_PARTS, check if both Technical (Jaydeep) and Business have approved.
    const allApprovals = await prisma.approvalLog.findMany({
      where: { requestId: id, decision: "APPROVED" },
    });

    let canMoveToPhase3 = false;
    if (request.requestType === "BOM_PARTS") {
      const hasTech = allApprovals.some((a) => a.stage === "THREE_TIER_TECHNICAL" || a.approverId === "user_jaydeep");
      const hasBiz = allApprovals.some((a) => a.stage === "THREE_TIER_BUSINESS" || a.approverId === "user_business");
      if (hasTech && hasBiz) {
        canMoveToPhase3 = true;
      }
    } else {
      // For Tool/Equipment, single threshold approval is sufficient
      canMoveToPhase3 = true;
    }

    const updated = await prisma.procurementRequest.update({
      where: { id },
      data: {
        totalEstimatedCost: newCost,
        status: canMoveToPhase3 ? "SOURCING" : "PENDING_APPROVAL",
        currentPhase: canMoveToPhase3 ? "PHASE_3" : "PHASE_2",
      },
      include: {
        requester: true,
        approvals: { include: { approver: true } },
      },
    });

    return NextResponse.json({
      success: true,
      request: updated,
      canMoveToPhase3,
    });
  } catch (error: any) {
    console.error("Approval error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

