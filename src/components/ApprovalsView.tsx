"use client";

import React, { useState } from "react";
import {
  Cpu,
  Wrench,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { SessionUser } from "@/lib/types";

interface ApprovalsViewProps {
  currentUser: SessionUser;
  requests: any[];
  onSelectRequest: (req: any) => void;
  onRefresh: () => void;
}

export default function ApprovalsView({
  currentUser,
  requests,
  onSelectRequest,
  onRefresh,
}: ApprovalsViewProps) {
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");

  // Filter requests
  const pendingRequests = requests.filter(
    (r) => r.status === "PENDING_APPROVAL" || r.currentPhase === "PHASE_2"
  );
  const approvedRequests = requests.filter(
    (r) => r.status === "APPROVED" || r.status === "SOURCING" || r.status === "ORDER_PLACED" || r.status === "CLOSED"
  );
  const rejectedRequests = requests.filter((r) => r.status === "REJECTED");

  const displayList =
    activeTab === "pending"
      ? pendingRequests
      : activeTab === "approved"
      ? approvedRequests
      : rejectedRequests;

  const getStageBadge = (req: any) => {
    if (req.requestType === "BOM_PARTS") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-700">
          Technical Review
        </span>
      );
    }
    const cost = req.totalEstimatedCost || 0;
    if (cost <= 2000) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700">
          Price Approval
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700">
        Role Approval
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title & Pill Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Approvals</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review and validate procurement requests assigned to your authority
          </p>
        </div>

        {/* Top Filter Tabs matching mobile screen 4 */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "pending"
                ? "bg-[#1254D8] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Pending ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "approved"
                ? "bg-[#1254D8] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Approved ({approvedRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("rejected")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "rejected"
                ? "bg-[#1254D8] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Rejected ({rejectedRequests.length})
          </button>
        </div>
      </div>

      {/* Approvals Cards List */}
      <div className="space-y-3">
        {displayList.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/80">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <div className="font-bold text-sm text-slate-800">No {activeTab} approvals</div>
            <p className="text-xs text-slate-500 mt-1">All requests in this queue have been processed.</p>
          </div>
        ) : (
          displayList.map((req) => {
            const isBom = req.requestType === "BOM_PARTS";
            return (
              <div
                key={req.id}
                onClick={() => onSelectRequest(req)}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-4 group"
              >
                <div className="flex items-start space-x-4">
                  {/* Icon Box */}
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      isBom
                        ? "bg-purple-50 text-purple-600 border border-purple-100"
                        : "bg-amber-50 text-amber-600 border border-amber-100"
                    }`}
                  >
                    {isBom ? <Cpu className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
                  </div>

                  {/* Details */}
                  <div className="space-y-1">
                    <div className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                      <span>{req.requestNumber}</span>
                      <span className="text-slate-400 font-normal">&ndash;</span>
                      <span className="font-semibold text-slate-700">
                        {req.title.split("-")[0]?.trim() || req.title}
                      </span>
                    </div>

                    <div className="text-xs font-mono font-bold text-slate-900">
                      Est. Cost: &#8377;{req.totalEstimatedCost?.toLocaleString("en-IN") || "Pending"}
                    </div>

                    <div className="text-[11px] text-slate-500">
                      Requested by: {req.requester?.name || "R&D Team"} &bull;{" "}
                      {new Date(req.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>

                    <div className="pt-1">{getStageBadge(req)}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="hidden sm:inline-block text-xs font-bold text-[#1254D8] group-hover:underline">
                    Review
                  </span>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

