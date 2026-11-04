"use client";

import React from "react";
import {
  Truck,
  AlertTriangle,
  Building,
  Calendar,
  Clock,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { SessionUser } from "@/lib/types";

interface TrackingViewProps {
  currentUser: SessionUser;
  requests: any[];
  onSelectRequest: (req: any) => void;
}

export default function TrackingView({
  currentUser,
  requests,
  onSelectRequest,
}: TrackingViewProps) {
  const trackingRequests = requests.filter(
    (r) => r.currentPhase === "PHASE_4" || r.status === "ORDER_PLACED"
  );

  const canSeeCost =
    currentUser.role === "ADMIN" ||
    currentUser.role === "BUSINESS" ||
    currentUser.role.startsWith("APPROVER_");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Live Part Tracking &amp; Delivery Console
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Phase 4: Real-time logistics, supplier follow-up reminders &amp; EDD &le; 7 days alerts
        </p>
      </div>

      <div className="space-y-4">
        {trackingRequests.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/80">
            <Truck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <div className="font-bold text-sm text-slate-800">No active orders in transit</div>
            <p className="text-xs text-slate-500 mt-1">
              Orders issued a PO in Phase 3 will appear here for live logistics tracking.
            </p>
          </div>
        ) : (
          trackingRequests.map((req) => (
            <div
              key={req.id}
              onClick={() => onSelectRequest(req)}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer space-y-4 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#1254D8]">
                      {req.requestNumber}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{req.title}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Supplier: <strong className="text-slate-800">{req.purchaseOrder?.supplierName || "Assigned Vendor"}</strong> &bull;{" "}
                    PO: <span className="font-mono font-semibold">{req.purchaseOrder?.poNumber || "PO-Pending"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {req.isEddWithin7Days && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white flex items-center gap-1 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      EDD &le; 7 Days Alert
                    </span>
                  )}

                  {req.isDelayed && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Delayed
                    </span>
                  )}

                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                    In Transit
                  </span>
                </div>
              </div>

              {/* Progress & Logistics bar */}
              <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <div className="text-slate-500 text-[11px]">Courier / AWB</div>
                  <div className="font-bold text-slate-800 font-mono mt-0.5">
                    {req.purchaseOrder?.courierName || "Courier"} ({req.purchaseOrder?.trackingNumber || "AWB"})
                  </div>
                </div>

                <div>
                  <div className="text-slate-500 text-[11px]">Expected Delivery Date</div>
                  <div className="font-bold text-amber-900 mt-0.5">
                    {req.purchaseOrder?.currentEdd
                      ? new Date(req.purchaseOrder.currentEdd).toLocaleDateString()
                      : "Pending"}
                  </div>
                </div>

                <div>
                  <div className="text-slate-500 text-[11px]">Order Commercial Value</div>
                  <div className="font-bold text-slate-900 font-mono mt-0.5">
                    {canSeeCost ? (
                      `₹${req.totalEstimatedCost?.toLocaleString("en-IN") || "0"}`
                    ) : (
                      <span className="text-slate-400 font-normal">[Masked: Admin/Business]</span>
                    )}
                  </div>
                </div>

                <div className="text-right flex items-center justify-end">
                  <span className="text-xs font-bold text-blue-600 group-hover:underline flex items-center gap-1">
                    Manage Delivery
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

