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
      action, // "update_edd" | "add_followup" | "mark_arrived"
      userId,
      newEdd,
      delayReason,
      followupNotes,
      trackingNumber,
      courierName,
      trackingUrl,
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

    // 1. Mark Arrived -> Proceeds to Phase 5
    if (action === "mark_arrived") {
      await prisma.purchaseOrder.update({
        where: { id: po.id },
        data: { status: "ARRIVED" },
      });

      const updatedRequest = await prisma.procurementRequest.update({
        where: { id },
        data: {
          status: "INWARD_INSPECTION",
          currentPhase: "PHASE_5",
        },
      });

      await prisma.trackingUpdate.create({
        data: {
          poId: po.id,
          followupNotes: "Package physically received at Walnut Medical store. Moved to Phase 5 (Inward Inspection).",
          loggedByUserId: userId,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Order marked as arrived. Sent to Store & Inward QA.",
        request: updatedRequest,
      });
    }

    // 2. Update EDD (Estimated Delivery Date)
    if (action === "update_edd") {
      if (!newEdd) {
        return NextResponse.json({ error: "New EDD is required." }, { status: 400 });
      }

      const newDate = new Date(newEdd);
      const previousDate = new Date(po.currentEdd);
      const isPostponed = newDate.getTime() > previousDate.getTime();

      // "If order is delayed: Mandatory Delay Reason must be logged"
      if (isPostponed && (!delayReason || delayReason.trim() === "")) {
        return NextResponse.json(
          {
            error:
              "Delivery date has slipped! A Mandatory Delay Reason must be logged as per SOP WMPL-QAS-025-01A.",
          },
          { status: 400 }
        );
      }

      await prisma.purchaseOrder.update({
        where: { id: po.id },
        data: {
          currentEdd: newDate,
          status: isPostponed ? "DELAYED" : po.status,
          trackingNumber: trackingNumber || po.trackingNumber,
          courierName: courierName || po.courierName,
          trackingUrl: trackingUrl || po.trackingUrl,
        },
      });

      await prisma.trackingUpdate.create({
        data: {
          poId: po.id,
          previousEdd: previousDate,
          newEdd: newDate,
          delayReason: isPostponed ? delayReason : null,
          followupNotes:
            followupNotes ||
            (isPostponed
              ? `Delivery delayed to ${newDate.toLocaleDateString()}. Reason: ${delayReason}`
              : `EDD confirmed for ${newDate.toLocaleDateString()}.`),
          loggedByUserId: userId,
        },
      });

      return NextResponse.json({
        success: true,
        message: "EDD and tracking details updated successfully.",
      });
    }

    // 3. Regular Follow-up Note
    if (action === "add_followup") {
      if (!followupNotes || followupNotes.trim() === "") {
        return NextResponse.json({ error: "Follow-up notes cannot be empty." }, { status: 400 });
      }

      await prisma.trackingUpdate.create({
        data: {
          poId: po.id,
          followupNotes,
          loggedByUserId: userId,
        },
      });

      return NextResponse.json({ success: true, message: "Follow-up note logged." });
    }

    return NextResponse.json({ error: "Invalid tracking action." }, { status: 400 });
  } catch (error: any) {
    console.error("Tracking update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

