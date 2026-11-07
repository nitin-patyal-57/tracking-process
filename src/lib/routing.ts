import { ProcurementRequest, User } from "@prisma/client";

export interface ApprovalRoutingResult {
  assignedApproverId: string;
  assignedApproverName: string;
  assignedRoleName: string;
  ruleExplanation: string;
  stage: string;
}

/**
 * Determines the routing and required approver based on the SOP rules:
 * - Tool/Equipment: Price & Role Routing
 *   <= 2000 => Abhishek Saini (R&D Team Lead)
 *   <= 5000 => Mr. Jaydeep Panchal
 *   > 5000  => Mr. Amol Bhardwaj (CTO)
 *   Special Case: Abhishek Sir request with technical validation => Mr. Jaydeep Panchal
 * - BOM / BOM Parts: Three-Tier Review (Technical: Jaydeep Panchal, Cost & Lead: Business Team)
 */
export function determineApprovalRouting(
  request: {
    requestType: string;
    totalEstimatedCost: number | null;
    requesterId: string;
    technicalValidationRequired: boolean;
  },
  requesterUser?: { name: string; email: string }
): ApprovalRoutingResult[] {
  const isAbhishekRequester =
    request.requesterId === "user_abhishek" ||
    (requesterUser && requesterUser.name.toLowerCase().includes("abhishek"));

  // Special Case from flowchart:
  // Requests from Abhishek Saini requiring technical validation go to Jaydeep Panchal.
  if (isAbhishekRequester && request.technicalValidationRequired) {
    return [
      {
        assignedApproverId: "user_jaydeep",
        assignedApproverName: "Mr. Jaydeep Panchal",
        assignedRoleName: "R&D Head (Technical Verification)",
        ruleExplanation:
          "Special case: A request created by Abhishek Saini that requires technical validation is routed to Mr. Jaydeep Panchal (R&D Head).",
        stage: "SPECIAL_TECHNICAL_VERIFICATION",
      },
    ];
  }

  // BOM / BOM Parts -> Three-Tier Review
  if (request.requestType === "BOM_PARTS") {
    return [
      {
        assignedApproverId: "user_jaydeep",
        assignedApproverName: "Mr. Jaydeep Panchal",
        assignedRoleName: "R&D Head (Technical Review)",
        ruleExplanation:
          "BOM Three-Tier Review: Technical validation of MPN, package size, and mandatory datasheets.",
        stage: "THREE_TIER_TECHNICAL",
      },
      {
        assignedApproverId: "user_business",
        assignedApproverName: "Mr. Sukhbir (Purchase Department Head)",
        assignedRoleName: "Purchase Department Head (Cost & Lead Time)",
        ruleExplanation:
          "BOM Three-Tier Review: Evaluation of component cost, vendor lead time, and supply availability by Purchase Department Head.",
        stage: "THREE_TIER_BUSINESS",
      },
    ];
  }

  // Tool / Equipment / Machine / Experiment -> Price & Role Routing
  const cost = request.totalEstimatedCost;

  if (cost === null || cost === undefined || cost === 0) {
    return [
      {
        assignedApproverId: "user_business",
        assignedApproverName: "Mr. Sukhbir (Purchase Department Head)",
        assignedRoleName: "Purchase Department Head (Cost Evaluation)",
        ruleExplanation:
          "Price was left optional/blank by requester. Routed to Mr. Sukhbir (Purchase Department Head) to evaluate & fill cost before threshold approval.",
        stage: "PRICE_EVALUATION",
      },
    ];
  }

  if (cost <= 2000) {
    return [
      {
        assignedApproverId: "user_abhishek_dir",
        assignedApproverName: "Abhishek Saini (R&D Team Lead)",
        assignedRoleName: "R&D Team Lead",
        ruleExplanation: `Price & Role Routing: Total cost (${cost.toLocaleString("en-IN")}) is <= ₹ / $ 2,000. Assigned to Abhishek Saini (R&D Team Lead).`,
        stage: "PRICE_ROUTING",
      },
    ];
  }

  if (cost <= 5000) {
    return [
      {
        assignedApproverId: "user_jaydeep",
        assignedApproverName: "Mr. Jaydeep Panchal",
        assignedRoleName: "R&D Head",
        ruleExplanation: `Price & Role Routing: Total cost (${cost.toLocaleString("en-IN")}) is <= ₹ / $ 5,000. Assigned to Mr. Jaydeep Panchal.`,
        stage: "PRICE_ROUTING",
      },
    ];
  }

  return [
    {
      assignedApproverId: "user_amol",
      assignedApproverName: "Mr. Amol Bhardwaj",
      assignedRoleName: "Chief Technology Officer (CTO)",
      ruleExplanation: `Price & Role Routing: Total cost (${cost.toLocaleString("en-IN")}) is > ₹ / $ 5,000. Assigned to Mr. Amol Bhardwaj (CTO).`,
      stage: "PRICE_ROUTING",
    },
  ];
}
