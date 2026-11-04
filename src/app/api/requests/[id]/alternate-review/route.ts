import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { alternateId, decision, reviewerId, remarks } = body;

    if (!alternateId || !decision) {
      return NextResponse.json(
        { error: "Alternate ID and decision (APPROVED / REJECTED) are required." },
        { status: 400 }
      );
    }

    const alternate = await prisma.alternatePart.findUnique({
      where: { id: alternateId },
      include: { originalItem: true },
    });

    if (!alternate) {
      return NextResponse.json({ error: "Alternate part record not found." }, { status: 404 });
    }

    const reviewer = await prisma.user.findUnique({
      where: { id: reviewerId || "user_jaydeep" },
    });

    if (decision === "APPROVED") {
      // 1. Mark alternate as approved
      await prisma.alternatePart.update({
        where: { id: alternateId },
        data: {
          rndApprovalStatus: "APPROVED",
          rndReviewerId: reviewer?.id,
          rndRemarks: remarks || "Alternate part verified and approved by R&D.",
        },
      });

      // 2. Update the original item to reflect the new part number and datasheet
      await prisma.requestItem.update({
        where: { id: alternate.originalItemId },
        data: {
          partNumber: alternate.proposedPartNumber,
          partName: alternate.proposedPartName,
          datasheetUrl: alternate.alternateDatasheetUrl || alternate.originalItem.datasheetUrl,
          datasheetFileName: alternate.alternateDatasheetFileName || alternate.originalItem.datasheetFileName,
          finalUnitPrice: alternate.alternatePrice || alternate.originalItem.estimatedUnitPrice,
          status: "REPLACED_BY_ALTERNATE",
        },
      });

      // Log in approvals
      await prisma.approvalLog.create({
        data: {
          requestId: id,
          approverId: reviewer?.id || "user_jaydeep",
          roleName: reviewer?.designation || "R&D Head",
          stage: "ALTERNATE_PART_VERIFICATION",
          decision: "APPROVED",
          comments: `R&D approved alternate part ${alternate.proposedPartNumber} to replace ${alternate.originalItem.partNumber}. ${remarks || ""}`,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Alternate part approved by R&D and updated in bill of materials.",
      });
    } else {
      // REJECTED
      await prisma.alternatePart.update({
        where: { id: alternateId },
        data: {
          rndApprovalStatus: "REJECTED",
          rndReviewerId: reviewer?.id,
          rndRemarks: remarks || "Alternate part rejected. Does not meet technical requirements.",
        },
      });

      await prisma.approvalLog.create({
        data: {
          requestId: id,
          approverId: reviewer?.id || "user_jaydeep",
          roleName: reviewer?.designation || "R&D Head",
          stage: "ALTERNATE_PART_VERIFICATION",
          decision: "REJECTED",
          comments: `R&D rejected alternate part ${alternate.proposedPartNumber}. Remarks: ${remarks || "Non-compliant specifications."}`,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Alternate part rejected. Business team notified to re-evaluate.",
      });
    }
  } catch (error: any) {
    console.error("Alternate review error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

