import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { action, userId, ...payload } = body;

    const request = await prisma.procurementRequest.findUnique({
      where: { id },
      include: {
        items: true,
        purchaseOrder: true,
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId || "user_business" },
    });

    // 1. High Cost Check / Cost Evaluation
    if (action === "cost_evaluation") {
      const { decision, reason, estimatedCost } = payload;
      if (decision === "REJECTED") {
        if (!reason || reason.trim() === "") {
          return NextResponse.json(
            { error: "Mandatory Reason is required for High Cost Rejection." },
            { status: 400 }
          );
        }

        await prisma.approvalLog.create({
          data: {
            requestId: id,
            approverId: user?.id || "user_business",
            roleName: "Business Team (Cost Evaluation)",
            stage: "COST_EVALUATION",
            decision: "REJECTED",
            comments: `High Cost Check REJECTED: ${reason}`,
          },
        });

        // Set status to rejected or needs alternates
        const updated = await prisma.procurementRequest.update({
          where: { id },
          data: {
            status: "SOURCING", // stays in sourcing for alternate proposals
            rejectionReason: `High Cost Rejection: ${reason}`,
          },
        });
        return NextResponse.json({ success: true, request: updated });
      } else {
        // Cost approved
        await prisma.approvalLog.create({
          data: {
            requestId: id,
            approverId: user?.id || "user_business",
            roleName: "Business Team (Cost Evaluation)",
            stage: "COST_EVALUATION",
            decision: "APPROVED",
            comments: "Cost evaluation passed. Price within acceptable R&D project budget.",
          },
        });

        if (estimatedCost) {
          await prisma.procurementRequest.update({
            where: { id },
            data: { totalEstimatedCost: parseFloat(estimatedCost) },
          });
        }
        return NextResponse.json({ success: true, message: "Cost approved." });
      }
    }

    // 2. Lead Time Check
    if (action === "lead_time_check") {
      const { decision, delayReason, notes } = payload;
      if (decision === "LONG_LEAD_TIME") {
        if (!delayReason || delayReason.trim() === "") {
          return NextResponse.json(
            { error: "Mandatory delay reason required for Long Lead Time." },
            { status: 400 }
          );
        }

        await prisma.approvalLog.create({
          data: {
            requestId: id,
            approverId: user?.id || "user_business",
            roleName: "Business Team (Lead Time Check)",
            stage: "LEAD_TIME",
            decision: "REJECTED",
            comments: `Long Lead Time: ${delayReason}. ${notes || ""}`,
          },
        });

        return NextResponse.json({
          success: true,
          message: "Lead time flagged as excessive. Finding alternate parts recommended.",
        });
      } else {
        await prisma.approvalLog.create({
          data: {
            requestId: id,
            approverId: user?.id || "user_business",
            roleName: "Business Team (Lead Time Check)",
            stage: "LEAD_TIME",
            decision: "APPROVED",
            comments: "Lead time verified and acceptable for prototyping milestones.",
          },
        });
        return NextResponse.json({ success: true, message: "Lead time approved." });
      }
    }

    // 3. Propose Alternate Part
    if (action === "propose_alternate") {
      const {
        originalItemId,
        proposedPartNumber,
        proposedPartName,
        alternateDatasheetUrl,
        alternateDatasheetFileName,
        alternatePrice,
        proposerNotes,
      } = payload;

      if (!originalItemId || !proposedPartNumber || !proposedPartName) {
        return NextResponse.json(
          { error: "Original item ID, proposed part number, and part name are required." },
          { status: 400 }
        );
      }

      const alternate = await prisma.alternatePart.create({
        data: {
          originalItemId,
          proposedPartNumber,
          proposedPartName,
          alternateDatasheetUrl,
          alternateDatasheetFileName,
          alternatePrice: parseFloat(alternatePrice) || null,
          proposerNotes,
          proposedBy: user?.name || "Business Team",
          rndApprovalStatus: "PENDING",
        },
      });

      return NextResponse.json({ success: true, alternate });
    }

    // 4. Issue Purchase Order (PO) & Place Order
    if (action === "issue_po") {
      const {
        poNumber,
        supplierName,
        supplierEmail,
        supplierPhone,
        initialEdd,
        totalAmount,
        currency = "INR",
        poDocumentUrl,
        courierName,
        trackingNumber,
        trackingUrl,
      } = payload;

      if (!poNumber || !supplierName || !initialEdd) {
        return NextResponse.json(
          { error: "PO Number, Supplier Name, and Estimated Delivery Date (EDD) are mandatory." },
          { status: 400 }
        );
      }

      const eddDate = new Date(initialEdd);

      // Create or update PO
      const po = await prisma.purchaseOrder.upsert({
        where: { requestId: id },
        create: {
          requestId: id,
          poNumber,
          supplierName,
          supplierEmail,
          supplierPhone,
          initialEdd: eddDate,
          currentEdd: eddDate,
          totalAmount: parseFloat(totalAmount) || request.totalEstimatedCost || 0,
          currency,
          poDocumentUrl,
          courierName,
          trackingNumber,
          trackingUrl,
          status: "ORDER_PLACED",
          trackingUpdates: {
            create: {
              newEdd: eddDate,
              followupNotes: `PO ${poNumber} issued to ${supplierName}. Initial EDD: ${eddDate.toLocaleDateString()}.`,
              loggedByUserId: user?.id,
            },
          },
        },
        update: {
          poNumber,
          supplierName,
          supplierEmail,
          supplierPhone,
          initialEdd: eddDate,
          currentEdd: eddDate,
          totalAmount: parseFloat(totalAmount) || request.totalEstimatedCost || 0,
          currency,
          poDocumentUrl,
          courierName,
          trackingNumber,
          trackingUrl,
          status: "ORDER_PLACED",
        },
      });

      // Move request to Phase 4
      const updatedRequest = await prisma.procurementRequest.update({
        where: { id },
        data: {
          status: "ORDER_PLACED",
          currentPhase: "PHASE_4",
        },
        include: {
          purchaseOrder: true,
        },
      });

      return NextResponse.json({ success: true, request: updatedRequest, po });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/requests/[id]/business error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

