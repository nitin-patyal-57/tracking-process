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
    const allApprovals = await prisma.approvalLog.findMany({
      where: { requestId: id, decision: "APPROVED" },
    });

    let canMoveToPhase3 = false;
    const isAdmin =
      approver.role === "ADMIN" ||
      approver.id === "user_admin" ||
      approver.id === "user_amol";

    if (isAdmin) {
      canMoveToPhase3 = true;
    } else if (request.requestType === "BOM_PARTS") {
      const hasTech = allApprovals.some(
        (a) =>
          a.stage === "THREE_TIER_TECHNICAL" ||
          a.approverId === "user_jaydeep" ||
          a.approverId === "user_amol" ||
          a.approverId === "user_admin"
      );
      const hasBiz = allApprovals.some(
        (a) =>
          a.stage === "THREE_TIER_BUSINESS" ||
          a.approverId === "user_business" ||
          a.approverId === "user_amol" ||
          a.approverId === "user_admin"
      );
      if (hasTech && hasBiz) {
        canMoveToPhase3 = true;
      }
    } else {
      // For Tool/Equipment, threshold approval or Business Lead evaluation is sufficient to proceed
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

    let message = "Request approval recorded successfully.";
    if (canMoveToPhase3) {
      message = "Request approved and advanced to Phase 3 (Sourcing & PO Processing)!";
    } else if (request.requestType === "BOM_PARTS") {
      const hasTech = allApprovals.some(
        (a) =>
          a.stage === "THREE_TIER_TECHNICAL" ||
          a.approverId === "user_jaydeep" ||
          a.approverId === "user_amol" ||
          a.approverId === "user_admin"
      );
      const hasBiz = allApprovals.some(
        (a) =>
          a.stage === "THREE_TIER_BUSINESS" ||
          a.approverId === "user_business" ||
          a.approverId === "user_amol" ||
          a.approverId === "user_admin"
      );

      if (hasTech && !hasBiz) {
        message =
          "Technical Review by Mr. Jaydeep Panchal recorded! Awaiting Cost & Lead Time sign-off from Mr. Rajesh Kumar (Business Lead).";
      } else if (!hasTech && hasBiz) {
        message =
          "Cost & Lead Time Review by Mr. Rajesh Kumar recorded! Awaiting Technical sign-off from Mr. Jaydeep Panchal (R&D Head).";
      }
    }

    return NextResponse.json({
      success: true,
      request: updated,
      canMoveToPhase3,
      message,
    });
  } catch (error: any) {
    console.error("Approval error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

