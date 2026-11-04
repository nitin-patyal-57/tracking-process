"use client";

import React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Package,
  Star,
  ChevronRight,
  ClipboardCheck,
} from "lucide-react";
import { SessionUser } from "@/lib/types";

interface InspectionViewProps {
  currentUser: SessionUser;
  requests: any[];
  onSelectRequest: (req: any) => void;
}

export default function InspectionView({
  currentUser,
  requests,
  onSelectRequest,
}: InspectionViewProps) {
  const inspectionRequests = requests.filter(
    (r) =>
      r.currentPhase === "PHASE_5" ||
      r.status === "INWARD_INSPECTION" ||
      r.status === "DELIVERED" ||
      r.status === "CLOSED"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Inward Inspection &amp; Closed-Loop Feedback
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Phase 5: Store physical inspection, requester acceptance sign-off &amp; mandatory quality feedback
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-4 text-xs space-y-1.5">
          <div className="font-bold text-purple-900 flex items-center gap-1.5">
            <ClipboardCheck className="w-4 h-4 text-purple-600" />
            Physical Handover &amp; Acceptance Sign-off
          </div>
          <p className="text-purple-800">
            Store/QA checks packaging integrity, counts physical quantities against PO, and logs digital sign-off with requester.
          </p>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 text-xs space-y-1.5">
          <div className="font-bold text-emerald-900 flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            Mandatory Feedback Submission
          </div>
          <p className="text-emerald-800">
            Requester submits quality rating (1&ndash;5), specs match, and vendor lead-time satisfaction to close the loop.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-extrabold text-sm text-slate-900">
          Inspection &amp; Quality Registers ({inspectionRequests.length})
        </div>
        <div className="divide-y divide-slate-100">
          {inspectionRequests.map((req) => (
            <div
              key={req.id}
              onClick={() => onSelectRequest(req)}
              className="p-5 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#1254D8]">
                    {req.requestNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      req.status === "CLOSED"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {req.status === "CLOSED" ? "Closed / Verified" : "Awaiting QA / Feedback"}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900">{req.title}</h3>
                <div className="text-xs text-slate-500">
                  PO: {req.purchaseOrder?.poNumber || "N/A"} &bull; Supplier:{" "}
                  {req.purchaseOrder?.supplierName || "Vendor"} &bull; Handover to:{" "}
                  {req.requester?.name}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-[#1254D8] group-hover:underline">
                  {req.status === "CLOSED" ? "View Closed Audit" : "Sign-off & Feedback"}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

