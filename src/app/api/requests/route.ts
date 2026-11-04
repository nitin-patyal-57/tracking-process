import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { determineApprovalRouting } from "@/lib/routing";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phase = searchParams.get("phase");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};

    if (phase && phase !== "ALL") {
      where.currentPhase = phase;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { requestNumber: { contains: search } },
        { title: { contains: search } },
        { justification: { contains: search } },
        { requester: { name: { contains: search } } },
      ];
    }

    const requests = await prisma.procurementRequest.findMany({
      where,
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
      orderBy: { createdAt: "desc" },
    });

    // Add computed alert metadata
    const now = new Date();
    const formatted = requests.map((r) => {
      let isEddWithin7Days = false;
      let daysToEdd: number | null = null;
      let isDelayed = false;

      if (r.purchaseOrder && r.status !== "CLOSED" && r.status !== "DELIVERED") {
        const edd = new Date(r.purchaseOrder.currentEdd);
        const diffMs = edd.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        daysToEdd = diffDays;

        if (diffDays <= 7 && diffDays >= 0) {
          isEddWithin7Days = true;
        } else if (diffDays < 0) {
          isDelayed = true;
        }
      }

      const routing = determineApprovalRouting(
        {
          requestType: r.requestType,
          totalEstimatedCost: r.totalEstimatedCost,
          requesterId: r.requesterId,
          technicalValidationRequired: r.technicalValidationRequired,
        },
        r.requester
      );

      return {
        ...r,
        isEddWithin7Days,
        daysToEdd,
        isDelayed,
        expectedApprovers: routing,
      };
    });

    return NextResponse.json({ requests: formatted });
  } catch (error: any) {
    console.error("GET /api/requests error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      requestType,
      title,
      justification,
      requesterId,
      items,
      technicalValidationRequired,
      currency = "INR",
    } = body;

    if (!title || !requesterId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields or at least one item must be provided." },
        { status: 400 }
      );
    }

    // Validation for BOM / BOM Parts
    if (requestType === "BOM_PARTS") {
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (!it.partNumber || !it.partName) {
          return NextResponse.json(
            { error: `Item #${i + 1} must include an accurate Part Number and Part Name.` },
            { status: 400 }
          );
        }
        if (!it.datasheetUrl && !it.datasheetFileName) {
          return NextResponse.json(
            {
              error: `Datasheet attachment is MANDATORY for BOM part "${it.partNumber}". Please upload a datasheet.`,
            },
            { status: 400 }
          );
        }
      }
    }

    // Calculate total cost
    let totalEstimatedCost: number | null = 0;
    let hasPrice = false;

    for (const it of items) {
      const unitPrice = parseFloat(it.estimatedUnitPrice);
      const qty = parseInt(it.quantity, 10) || 1;
      if (!isNaN(unitPrice) && unitPrice > 0) {
        totalEstimatedCost += unitPrice * qty;
        hasPrice = true;
      }
    }

    if (!hasPrice && requestType === "TOOL_EQUIPMENT") {
      totalEstimatedCost = null; // Optional: Business Team will evaluate cost
    }

    // Generate Request Number
    const count = await prisma.procurementRequest.count();
    const prefix = requestType === "BOM_PARTS" ? "WMPL-BOM-2026" : "WMPL-REQ-2026";
    const requestNumber = `${prefix}-${String(count + 1).padStart(3, "0")}`;

    const newRequest = await prisma.procurementRequest.create({
      data: {
        requestNumber,
        requestType,
        title,
        justification,
        requesterId,
        status: "PENDING_APPROVAL",
        currentPhase: "PHASE_2",
        totalEstimatedCost,
        currency,
        technicalValidationRequired: Boolean(technicalValidationRequired),
        items: {
          create: items.map((it: any) => ({
            partNumber: it.partNumber,
            partName: it.partName,
            quantity: parseInt(it.quantity, 10) || 1,
            datasheetUrl: it.datasheetUrl || null,
            datasheetFileName: it.datasheetFileName || null,
            optionalSource: it.optionalSource || null,
            estimatedUnitPrice: parseFloat(it.estimatedUnitPrice) || null,
            finalUnitPrice: parseFloat(it.estimatedUnitPrice) || null,
          })),
        },
      },
      include: {
        requester: true,
        items: true,
      },
    });

    return NextResponse.json({ success: true, request: newRequest });
  } catch (error: any) {
    console.error("POST /api/requests error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

