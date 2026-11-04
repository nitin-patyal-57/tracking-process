"use client";

import React, { useState } from "react";
import { SessionUser } from "@/lib/types";
import {
  X,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building,
  Truck,
  Package,
  Calendar,
  DollarSign,
  Copy,
  Layers,
  History,
  Check,
  Star,
  ExternalLink,
} from "lucide-react";

interface RequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  currentUser: SessionUser;
  onRefresh: () => void;
}

export default function RequestDetailModal({
  isOpen,
  onClose,
  request,
  currentUser,
  onRefresh,
}: RequestDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"timeline" | "items" | "actions" | "audit">("timeline");

  // Phase 2 State
  const [approvalComment, setApprovalComment] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Phase 3 State
  const [showPoModal, setShowPoModal] = useState(false);
  const [poNumber, setPoNumber] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [initialEdd, setInitialEdd] = useState("");

  // Phase 4 State
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [newEdd, setNewEdd] = useState("");
  const [delayReason, setDelayReason] = useState("");

  // Phase 5 State
  const [qualityRating, setQualityRating] = useState(5);
  const [feedbackComments, setFeedbackComments] = useState("");

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !request) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine stage progression for vertical stepper matching Mobile Screen 3
  const isPhase1Done = true;
  const isPhase2Done = request.currentPhase !== "PHASE_1" && request.currentPhase !== "PHASE_2";
  const isPhase3Done = request.currentPhase === "PHASE_4" || request.currentPhase === "PHASE_5" || request.status === "ORDER_PLACED" || request.status === "CLOSED";
  const isPhase4Done = request.currentPhase === "PHASE_5" || request.status === "CLOSED";
  const isPhase5Done = request.status === "CLOSED";

  // Actions
  const handleApprove = async () => {
    setLoading(true);
    try {
      await fetch(`/api/requests/${request.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approverId: currentUser.id,
          decision: "APPROVED",
          comments: approvalComment || "Approved as per SOP authority.",
        }),
      });
      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Mandatory Rejection Reason required per SOP.");
      return;
    }
    setLoading(true);
    try {
      await fetch(`/api/requests/${request.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approverId: currentUser.id,
          decision: "REJECTED",
          comments: rejectReason,
        }),
      });
      setShowRejectModal(false);
      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  const handleIssuePo = async () => {
    if (!poNumber || !supplierName || !initialEdd) {
      alert("PO Number, Supplier, and EDD are required.");
      return;
    }
    setLoading(true);
    try {
      await fetch(`/api/requests/${request.id}/business`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "issue_po",
          userId: currentUser.id,
          poNumber,
          supplierName,
          initialEdd,
          totalAmount: request.totalEstimatedCost,
        }),
      });
      setShowPoModal(false);
      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEdd = async () => {
    if (!newEdd || !delayReason.trim()) {
      alert("New EDD and Mandatory Delay Reason are required.");
      return;
    }
    setLoading(true);
    try {
      await fetch(`/api/requests/${request.id}/tracking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_edd",
          userId: currentUser.id,
          newEdd,
          delayReason,
        }),
      });
      setShowDelayModal(false);
      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  const handleMarkArrived = async () => {
    setLoading(true);
    try {
      await fetch(`/api/requests/${request.id}/tracking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_arrived", userId: currentUser.id }),
      });
      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  const handleCloseFeedback = async () => {
    if (!feedbackComments.trim()) {
      alert("Mandatory Feedback Comments required to close order.");
      return;
    }
    setLoading(true);
    try {
      await fetch(`/api/requests/${request.id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qualityRating,
          specsVerification: "PASSED",
          fulfillmentRating: 5,
          feedbackComments,
          submittedByUserId: currentUser.id,
        }),
      });
      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-100">
        {/* Header matching Mobile Screen 3 */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2 font-mono text-sm font-extrabold text-slate-900">
            <span>{request.requestNumber}</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-800 p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Summary Card */}
        <div className="p-6 pb-4 border-b border-slate-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                  {request.title.split("-")[0]?.trim() || request.title}
                </h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  {request.requestType === "BOM_PARTS" ? "BOM Parts" : "Tool / Equipment"} &bull;{" "}
                  <strong className="text-slate-900 font-mono">
                    Est. &#8377;{request.totalEstimatedCost?.toLocaleString("en-IN") || "0"}
                  </strong>
                </div>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 whitespace-nowrap">
              {request.status.replace("_", " ")}
            </span>
          </div>

          {/* Tab Bar */}
          <div className="flex items-center space-x-4 mt-5 text-xs font-bold text-slate-500 border-b border-slate-100">
            <button
              onClick={() => setActiveTab("timeline")}
              className={`pb-2 transition-colors border-b-2 ${
                activeTab === "timeline" ? "border-blue-600 text-blue-600" : "border-transparent"
              }`}
            >
              Tracking Flow
            </button>
            <button
              onClick={() => setActiveTab("items")}
              className={`pb-2 transition-colors border-b-2 ${
                activeTab === "items" ? "border-blue-600 text-blue-600" : "border-transparent"
              }`}
            >
              Items ({request.items?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("actions")}
              className={`pb-2 transition-colors border-b-2 ${
                activeTab === "actions" ? "border-blue-600 text-blue-600" : "border-transparent"
              }`}
            >
              SOP Action Center
            </button>
            <button
              onClick={() => setActiveTab("audit")}
              className={`pb-2 transition-colors border-b-2 ${
                activeTab === "audit" ? "border-blue-600 text-blue-600" : "border-transparent"
              }`}
            >
              Audit History
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: VERTICAL TIMELINE TRACKER (Exact match to Mobile Screen 3) */}
          {activeTab === "timeline" && (
            <div className="space-y-6">
              {/* Stepper Timeline */}
              <div className="relative pl-7 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {/* 1. Request Submitted */}
                <div className="relative">
                  <div className="absolute -left-7 top-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-4 ring-white">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Request Submitted</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {new Date(request.createdAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>

                {/* 2. Technical Review */}
                <div className="relative">
                  <div
                    className={`absolute -left-7 top-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white ${
                      isPhase2Done
                        ? "bg-emerald-600 text-white"
                        : request.currentPhase === "PHASE_2"
                        ? "bg-blue-600 text-white animate-pulse"
                        : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {isPhase2Done ? <Check className="w-3.5 h-3.5" /> : <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Technical Review</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {isPhase2Done ? "Approved • Jaydeep Panchal (R&D Head)" : "Pending R&D Verification"}
                    </div>
                  </div>
                </div>

                {/* 3. Price & Role Routing */}
                <div className="relative">
                  <div
                    className={`absolute -left-7 top-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white ${
                      isPhase2Done
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {isPhase2Done ? <Check className="w-3.5 h-3.5" /> : <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Price &amp; Role Routing</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {isPhase2Done ? "Approved per Threshold SOP" : "Evaluation in progress"}
                    </div>
                  </div>
                </div>

                {/* 4. Procurement */}
                <div className="relative">
                  <div
                    className={`absolute -left-7 top-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white ${
                      isPhase3Done
                        ? "bg-emerald-600 text-white"
                        : request.currentPhase === "PHASE_3"
                        ? "bg-blue-600 text-white ring-blue-100 ring-8"
                        : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {isPhase3Done ? <Check className="w-3.5 h-3.5" /> : <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Procurement</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {request.purchaseOrder
                        ? `PO: ${request.purchaseOrder.poNumber} • In Progress`
                        : "Cost & Lead Time Evaluation"}
                    </div>
                  </div>
                </div>

                {/* 5. Tracking */}
                <div className="relative">
                  <div
                    className={`absolute -left-7 top-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white ${
                      isPhase4Done
                        ? "bg-emerald-600 text-white"
                        : request.currentPhase === "PHASE_4"
                        ? "bg-amber-500 text-white ring-amber-100 ring-8"
                        : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {isPhase4Done ? <Check className="w-3.5 h-3.5" /> : <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Tracking</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {request.currentPhase === "PHASE_4"
                        ? `In Transit via ${request.purchaseOrder?.courierName || "Courier"}`
                        : isPhase4Done
                        ? "Arrived at Store"
                        : "Waiting for Supplier Update"}
                    </div>
                  </div>
                </div>

                {/* 6. Inward Inspection */}
                <div className="relative">
                  <div
                    className={`absolute -left-7 top-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white ${
                      isPhase5Done
                        ? "bg-emerald-600 text-white"
                        : request.currentPhase === "PHASE_5"
                        ? "bg-purple-600 text-white ring-purple-100 ring-8"
                        : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {isPhase5Done ? <Check className="w-3.5 h-3.5" /> : <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Inward Inspection</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {isPhase5Done ? "Handover Completed & Feedback Submitted" : "Pending Handover"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Details Card matching Mobile Screen 3 */}
              {request.purchaseOrder ? (
                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center space-x-2 font-bold text-slate-900">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Order Details</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">PO Number:</span>
                      <div className="flex items-center space-x-1 font-mono font-bold text-slate-900">
                        <span>{request.purchaseOrder.poNumber}</span>
                        <button
                          onClick={() => copyToClipboard(request.purchaseOrder.poNumber)}
                          className="p-1 hover:text-blue-600 text-slate-400"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Supplier:</span>
                      <strong className="text-slate-900">{request.purchaseOrder.supplierName}</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Expected Delivery:</span>
                      <strong className="text-amber-800">
                        {new Date(request.purchaseOrder.currentEdd).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </strong>
                    </div>

                    {request.purchaseOrder.trackingNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Courier / AWB:</span>
                        <span className="font-mono text-slate-800">
                          {request.purchaseOrder.courierName} &bull; {request.purchaseOrder.trackingNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 space-y-1">
                  <div className="font-bold">Next Action Required:</div>
                  <p>
                    Request is currently in{" "}
                    <strong>
                      {request.currentPhase.replace("_", " ")} ({request.status.replace("_", " ")})
                    </strong>
                    . Open the <strong>SOP Action Center</strong> tab to process reviews or issue the Purchase Order.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ITEMS LIST */}
          {activeTab === "items" && (
            <div className="space-y-3">
              {request.items?.map((it: any, i: number) => (
                <div
                  key={it.id || i}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="font-mono text-blue-700">{it.partNumber}</span>
                    <span>Qty: {it.quantity}</span>
                  </div>
                  <div className="text-slate-600">{it.partName}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Unit Price: &#8377;{it.finalUnitPrice || it.estimatedUnitPrice || "0"}</span>
                    {it.datasheetUrl && (
                      <a
                        href={it.datasheetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-0.5"
                      >
                        <FileText className="w-3 h-3" />
                        <span>View Datasheet</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: SOP ACTION CENTER */}
          {activeTab === "actions" && (
            <div className="space-y-4">
              {/* Phase 2 Approvals */}
              {request.currentPhase === "PHASE_2" && (
                <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 space-y-3">
                  <div className="font-bold text-purple-900 text-sm">
                    Phase 2: Review &amp; Approval Routing
                  </div>
                  <p className="text-slate-600 text-xs">
                    Authorize or reject this request based on SOP authority matrices.
                  </p>
                  <input
                    type="text"
                    placeholder="Approval comments (optional)..."
                    value={approvalComment}
                    onChange={(e) => setApprovalComment(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setShowRejectModal(true)}
                      className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-300 rounded-xl hover:bg-rose-100"
                    >
                      Reject with Reason
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={loading}
                      className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                    >
                      Approve &amp; Send to Sourcing
                    </button>
                  </div>
                </div>
              )}

              {/* Phase 3 PO Issuance */}
              {request.currentPhase === "PHASE_3" && (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3">
                  <div className="font-bold text-emerald-900 text-sm">
                    Phase 3: Order Processing (Business Team)
                  </div>
                  <p className="text-slate-600 text-xs">
                    Issue Purchase Order and transition request to live tracking.
                  </p>
                  <button
                    onClick={() => setShowPoModal(true)}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                  >
                    + Issue PO &amp; Place Order
                  </button>
                </div>
              )}

              {/* Phase 4 Live Tracking */}
              {request.currentPhase === "PHASE_4" && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-3">
                  <div className="font-bold text-amber-900 text-sm">
                    Phase 4: Live Delivery Tracking
                  </div>
                  <p className="text-slate-600 text-xs">
                    Update delivery schedule (mandatory delay reason if postponed) or mark shipment as physically received.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowDelayModal(true)}
                      className="px-4 py-2 text-xs font-bold text-amber-900 bg-white border border-amber-300 rounded-xl hover:bg-amber-50"
                    >
                      Update EDD / Log Delay
                    </button>
                    <button
                      onClick={handleMarkArrived}
                      disabled={loading}
                      className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs"
                    >
                      Mark Arrived at Store
                    </button>
                  </div>
                </div>
              )}

              {/* Phase 5 Inward & Feedback */}
              {(request.currentPhase === "PHASE_5" || request.status === "DELIVERED") && (
                <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 space-y-3">
                  <div className="font-bold text-purple-900 text-sm">
                    Phase 5: Inward Inspection &amp; Feedback Loop
                  </div>
                  <p className="text-slate-600 text-xs">
                    Mandatory 3-point feedback required from Requester to officially close order.
                  </p>
                  <div className="space-y-2">
                    <select
                      value={qualityRating}
                      onChange={(e) => setQualityRating(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                    >
                      <option value={5}>Quality: 5 Stars (Excellent)</option>
                      <option value={4}>Quality: 4 Stars (Good)</option>
                      <option value={3}>Quality: 3 Stars (Acceptable)</option>
                    </select>
                    <textarea
                      rows={2}
                      placeholder="Mandatory feedback comments on specs match, quality, and supplier lead time..."
                      value={feedbackComments}
                      onChange={(e) => setFeedbackComments(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                    />
                    <button
                      onClick={handleCloseFeedback}
                      disabled={loading}
                      className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                    >
                      Submit Feedback &amp; Close Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AUDIT HISTORY */}
          {activeTab === "audit" && (
            <div className="space-y-2.5">
              {request.approvals?.length === 0 ? (
                <div className="text-slate-400 text-center py-6">No audit records yet.</div>
              ) : (
                request.approvals?.map((log: any) => (
                  <div key={log.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span>{log.roleName} ({log.decision})</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {log.comments && <p className="text-slate-600 italic">&ldquo;{log.comments}&rdquo;</p>}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-3 border border-rose-300">
            <h4 className="font-bold text-sm text-rose-900">Mandatory Rejection Reason</h4>
            <textarea
              rows={3}
              placeholder="Explain why this request is rejected..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-xl"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 rounded-xl"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PO Issuance Modal */}
      {showPoModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-3 border border-emerald-300 text-xs">
            <h4 className="font-bold text-sm text-emerald-900">Issue Purchase Order</h4>
            <div>
              <label className="block text-slate-700 font-bold mb-1">PO Number *:</label>
              <input
                type="text"
                placeholder="e.g. PO-2026-019"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Supplier Name *:</label>
              <input
                type="text"
                placeholder="e.g. Mouser India"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Expected Delivery Date (EDD) *:</label>
              <input
                type="date"
                value={initialEdd}
                onChange={(e) => setInitialEdd(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-medium"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowPoModal(false)}
                className="px-3 py-1.5 text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleIssuePo}
                className="px-4 py-1.5 text-white bg-emerald-600 font-bold rounded-xl"
              >
                Confirm PO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delay Modal */}
      {showDelayModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-3 border border-amber-300 text-xs">
            <h4 className="font-bold text-sm text-amber-900">Mandatory Delay Reason</h4>
            <div>
              <label className="block text-slate-700 font-bold mb-1">New EDD *:</label>
              <input
                type="date"
                value={newEdd}
                onChange={(e) => setNewEdd(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Delay Reason (Mandatory) *:</label>
              <textarea
                rows={2}
                placeholder="Reason why shipment is delayed..."
                value={delayReason}
                onChange={(e) => setDelayReason(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDelayModal(false)}
                className="px-3 py-1.5 text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateEdd}
                className="px-4 py-1.5 text-white bg-amber-600 font-bold rounded-xl"
              >
                Save Delay Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
