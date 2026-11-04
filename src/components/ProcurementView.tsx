"use client";

import React from "react";
import {
  ShoppingCart,
  DollarSign,
  Clock,
  Package,
  ArrowRight,
  ChevronRight,
  Plus,
} from "lucide-react";
import { SessionUser } from "@/lib/types";

interface ProcurementViewProps {
  currentUser: SessionUser;
  requests: any[];
  onSelectRequest: (req: any) => void;
}

export default function ProcurementView({
  currentUser,
  requests,
  onSelectRequest,
}: ProcurementViewProps) {
  // Sourcing Phase requests
  const procurementRequests = requests.filter(
    (r) => r.currentPhase === "PHASE_3" || r.status === "SOURCING" || r.status === "APPROVED"
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Procurement &amp; Sourcing Phase
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Phase 3: Cost evaluation, vendor lead time assessment, alternate parts loop &amp; PO issuance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 text-xs space-y-2">
          <div className="font-bold text-emerald-900 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            High Cost Check
          </div>
          <p className="text-emerald-800">
            Per SOP WMPL-QAS-025-01A: Business Team can reject expensive parts at any time with a mandatory reason.
          </p>
        </div>

        <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 text-xs space-y-2">
          <div className="font-bold text-blue-900 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-600" />
            Lead Time Check
          </div>
          <p className="text-blue-800">
            Assesses component lead time against project milestone dates. Flags long lead times for alternate part search.
          </p>
        </div>

        <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-4 text-xs space-y-2">
          <div className="font-bold text-purple-900 flex items-center gap-1.5">
            <Package className="w-4 h-4 text-purple-600" />
            Alternate Parts &amp; PO
          </div>
          <p className="text-purple-800">
            Proposes pin-compatible alternates to R&amp;D for technical approval before issuing formal PO.
          </p>
        </div>
      </div>

      {/* Sourcing Requests List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-extrabold text-sm text-slate-900">
          Orders Awaiting Procurement Processing ({procurementRequests.length})
        </div>
        <div className="divide-y divide-slate-100">
          {procurementRequests.map((req) => (
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
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Phase 3: Sourcing
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900">{req.title}</h3>
                <div className="text-xs text-slate-500">
                  {req.items?.length || 0} parts &bull; Est. &#8377;
                  {req.totalEstimatedCost?.toLocaleString("en-IN") || "0"} &bull; Requester:{" "}
                  {req.requester?.name}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs">
                  Process Order &amp; Issue PO
                </button>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

