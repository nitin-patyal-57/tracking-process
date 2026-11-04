export type UserRole =
  | "REQUESTER"
  | "APPROVER_TIER1"
  | "APPROVER_TIER2"
  | "APPROVER_TIER3"
  | "BUSINESS"
  | "STORE_QA"
  | "ADMIN";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string;
  department: string;
}

export type RequestType = "TOOL_EQUIPMENT" | "BOM_PARTS";

export type RequestStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "SOURCING"
  | "ORDER_PLACED"
  | "INWARD_INSPECTION"
  | "DELIVERED"
  | "CLOSED"
  | "REJECTED";

export type PhaseName = "PHASE_1" | "PHASE_2" | "PHASE_3" | "PHASE_4" | "PHASE_5";

