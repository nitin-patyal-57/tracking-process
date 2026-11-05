"use client";

import React from "react";
import {
  FileText,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Package,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Calendar,
  ChevronRight,
  BarChart2,
} from "lucide-react";
import { SessionUser } from "@/lib/types";

interface DashboardViewProps {
  currentUser: SessionUser;
  requests: any[];
  onSelectRequest: (req: any) => void;
  onNavigateToRequests: () => void;
  onNavigateToPhase: (phase: string) => void;
}

export default function DashboardView({
  currentUser,
  requests,
  onSelectRequest,
  onNavigateToRequests,
  onNavigateToPhase,
}: DashboardViewProps) {
  // Dynamic computation from real database requests
  const totalCount = requests.length;
  const pendingCount = requests.filter(
    (r) => r.status === "PENDING_APPROVAL" || r.currentPhase === "PHASE_2"
  ).length;
  const inProgressCount = requests.filter(
    (r) =>
      r.currentPhase === "PHASE_3" ||
      r.currentPhase === "PHASE_4" ||
      r.status === "SOURCING" ||
      r.status === "ORDER_PLACED"
  ).length;
  const expected7DaysCount = requests.filter((r) => r.isEddWithin7Days).length;
  const delayedCount = requests.filter((r) => r.isDelayed).length;

  const approvedCount = requests.filter((r) => r.status === "APPROVED").length;
  const inProcurementCount = requests.filter(
    (r) => r.status === "SOURCING" || r.status === "ORDER_PLACED"
  ).length;
  const technicalReviewCount = requests.filter(
    (r) => r.technicalValidationRequired && (r.status === "PENDING_APPROVAL" || r.currentPhase === "PHASE_2")
  ).length;
  const closedCount = requests.filter((r) => r.status === "CLOSED").length;

  // Compute percentages
  const pApproved = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;
  const pPending = totalCount > 0 ? Math.round((pendingCount / totalCount) * 100) : 0;
  const pProcurement = totalCount > 0 ? Math.round((inProcurementCount / totalCount) * 100) : 0;
  const pTech = totalCount > 0 ? Math.round((technicalReviewCount / totalCount) * 100) : 0;
  const pClosed = totalCount > 0 ? Math.round((closedCount / totalCount) * 100) : 0;

  // Donut arc lengths (circumference = 238.76)
  const c = 238.76;
  const arcApproved = (pApproved / 100) * c;
  const arcProcurement = (pProcurement / 100) * c;
  const arcPending = (pPending / 100) * c;
  const arcTech = (pTech / 100) * c;
  const arcClosed = (pClosed / 100) * c;

  // Status pills formatting
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">Approved</span>;
      case "PENDING_APPROVAL":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700">Pending Approval</span>;
      case "SOURCING":
      case "ORDER_PLACED":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700">In Procurement</span>;
      case "TECHNICAL_REVIEW":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-700">Technical Review</span>;
      case "CLOSED":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">Closed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Hero Welcome Banner with Graphic */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#EFF6FF] via-[#E0EFFF] to-[#D5E7FD] p-4 sm:p-7 border border-blue-100/80 shadow-2xs">
        {/* Real PCB Hero Image blending seamlessly */}
        <div className="absolute right-0 top-0 bottom-0 hidden w-28 min-[360px]:block sm:w-72 md:w-96 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-[#EFF6FF] via-[#EFF6FF]/40 to-transparent z-10" />
          <img
            src="/13_Purpose_Products.webp"
            alt="Walnut Medical PCB Component"
            className="w-full h-full object-cover object-center opacity-90"
          />
        </div>

        <div className="relative z-10 max-w-xl">
          <h1 className="text-xl min-[360px]:text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Welcome, {currentUser?.name || "User"}</span>
            <span className="text-2xl">👋</span>
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 font-medium">
            R&amp;D Procurement Portal &ndash; From Request to Closure
          </p>
        </div>
      </div>

      {/* 2. Process Flow Phases (5 Cards in a Row connected by arrows) */}
      <div className="grid grid-cols-2 gap-2 min-[360px]:gap-3 sm:grid-cols-5 items-center">
        {/* Phase 1 */}
        <div
          onClick={() => onNavigateToPhase("PHASE_1")}
          className="bg-[#EFF6FF] border border-[#DBEAFE] hover:border-blue-300 rounded-2xl p-2.5 sm:p-4 text-center cursor-pointer transition-all hover:shadow-xs group"
        >
          <div className="w-9 h-9 rounded-xl bg-white text-blue-600 flex items-center justify-center mx-auto shadow-2xs group-hover:scale-105 transition-transform">
            <FileText className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-bold text-blue-600 mt-2.5 uppercase tracking-wider">
            Phase 1
          </div>
          <div className="font-extrabold text-xs sm:text-sm leading-tight break-words text-slate-900 mt-0.5">Request</div>
          <div className="max-[359px]:hidden text-[11px] text-slate-500 mt-0.5 line-clamp-1">
            BOM / Tool / Equipment
          </div>
        </div>

        {/* Phase 2 */}
        <div
          onClick={() => onNavigateToPhase("PHASE_2")}
          className="bg-[#FAF5FF] border border-[#F3E8FF] hover:border-purple-300 rounded-2xl p-2.5 sm:p-4 text-center cursor-pointer transition-all hover:shadow-xs group"
        >
          <div className="w-9 h-9 rounded-xl bg-white text-purple-600 flex items-center justify-center mx-auto shadow-2xs group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-bold text-purple-600 mt-2.5 uppercase tracking-wider">
            Phase 2
          </div>
          <div className="font-extrabold text-xs sm:text-sm leading-tight break-words text-slate-900 mt-0.5">Approval</div>
          <div className="max-[359px]:hidden text-[11px] text-slate-500 mt-0.5 line-clamp-1">
            Price Routing &amp; Tech Review
          </div>
        </div>

        {/* Phase 3 */}
        <div
          onClick={() => onNavigateToPhase("PHASE_3")}
          className="bg-[#F0FDF4] border border-[#DCFCE7] hover:border-emerald-300 rounded-2xl p-2.5 sm:p-4 text-center cursor-pointer transition-all hover:shadow-xs group"
        >
          <div className="w-9 h-9 rounded-xl bg-white text-emerald-600 flex items-center justify-center mx-auto shadow-2xs group-hover:scale-105 transition-transform">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-bold text-emerald-600 mt-2.5 uppercase tracking-wider">
            Phase 3
          </div>
          <div className="font-extrabold text-xs sm:text-sm leading-tight break-words text-slate-900 mt-0.5">Procurement</div>
          <div className="max-[359px]:hidden text-[11px] text-slate-500 mt-0.5 line-clamp-1">
            Cost, Lead Time &amp; PO
          </div>
        </div>

        {/* Phase 4 */}
        <div
          onClick={() => onNavigateToPhase("PHASE_4")}
          className="bg-[#FFF7ED] border border-[#FFEDD5] hover:border-amber-300 rounded-2xl p-2.5 sm:p-4 text-center cursor-pointer transition-all hover:shadow-xs group"
        >
          <div className="w-9 h-9 rounded-xl bg-white text-amber-600 flex items-center justify-center mx-auto shadow-2xs group-hover:scale-105 transition-transform">
            <Truck className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-bold text-amber-600 mt-2.5 uppercase tracking-wider">
            Phase 4
          </div>
          <div className="font-extrabold text-xs sm:text-sm leading-tight break-words text-slate-900 mt-0.5">Tracking</div>
          <div className="max-[359px]:hidden text-[11px] text-slate-500 mt-0.5 line-clamp-1">
            Supplier Follow-up &amp; Delivery
          </div>
        </div>

        {/* Phase 5 */}
        <div
          onClick={() => onNavigateToPhase("PHASE_5")}
          className="bg-[#F0F9FF] border border-[#E0F2FE] hover:border-cyan-300 rounded-2xl p-2.5 sm:p-4 text-center cursor-pointer transition-all hover:shadow-xs group"
        >
          <div className="w-9 h-9 rounded-xl bg-white text-cyan-600 flex items-center justify-center mx-auto shadow-2xs group-hover:scale-105 transition-transform">
            <Package className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-bold text-cyan-600 mt-2.5 uppercase tracking-wider">
            Phase 5
          </div>
          <div className="font-extrabold text-xs sm:text-sm leading-tight break-words text-slate-900 mt-0.5">Inspection</div>
          <div className="max-[359px]:hidden text-[11px] text-slate-500 mt-0.5 line-clamp-1">
            Inward, Handover &amp; Closure
          </div>
        </div>
      </div>

      {/* 3. Five KPI Metric Cards */}
      <div className="grid grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-5 gap-3.5">
        {/* Total Requests */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900">{totalCount}</div>
            <div className="text-[11px] font-semibold text-slate-500">Total Requests</div>
            <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
              <span>▲ +12% vs last month</span>
            </div>
          </div>
        </div>

        {/* Pending Approval */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900">{pendingCount}</div>
            <div className="text-[11px] font-semibold text-slate-500">Pending Approval</div>
          </div>
        </div>

        {/* Orders in Progress */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900">{inProgressCount}</div>
            <div className="text-[11px] font-semibold text-slate-500">Orders in Progress</div>
          </div>
        </div>

        {/* Expected <= 7 Days */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900">{expected7DaysCount}</div>
            <div className="text-[11px] font-semibold text-slate-500">Expected &le; 7 Days</div>
          </div>
        </div>

        {/* Delayed Orders */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900">{delayedCount}</div>
            <div className="text-[11px] font-semibold text-slate-500">Delayed Orders</div>
          </div>
        </div>
      </div>

      {/* 4. Lower Two-Column Section: Recent Requests & Requests by Status Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Recent Requests Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="font-extrabold text-sm text-slate-900">Recent Requests</h2>
            </div>
            <button
              onClick={onNavigateToRequests}
              className="text-xs font-bold text-[#1254D8] hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              <span>View All Requests</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            {requests.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="font-bold text-slate-700 text-xs">No procurement requests yet</div>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Click &ldquo;+ New Request&rdquo; in the top bar to initiate your first real procurement request!
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-3">Request ID</th>
                    <th className="py-3 px-3">Project</th>
                    <th className="py-3 px-3">Request Type</th>
                    <th className="py-3 px-3 text-right">Est. Cost (&pound;/&#8377;)</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3">Last Update</th>
                    <th className="py-3 px-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {requests.slice(0, 5).map((req) => (
                    <tr
                      key={req.id}
                      onClick={() => onSelectRequest(req)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-3 font-bold text-[#1254D8] font-mono whitespace-nowrap">
                        {req.requestNumber}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                        {req.title.split("-")[0]?.trim() || req.title}
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                        {req.requestType === "BOM_PARTS" ? "BOM Parts" : "Tool / Equipment"}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        &#8377;{req.totalEstimatedCost?.toLocaleString("en-IN") || "0"}
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        {getStatusBadge(req.status)}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap text-[11px]">
                        {new Date(req.updatedAt || req.createdAt).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Requests by Status Donut Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <BarChart2 className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-sm text-slate-900">Requests by Status</h2>
          </div>

          {/* Donut Chart SVG & Legend */}
          <div className="py-4 flex flex-col sm:flex-row items-center justify-around gap-4">
            {/* SVG Donut */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {totalCount === 0 ? (
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#E2E8F0"
                    strokeWidth="14"
                  />
                ) : (
                  <>
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#22C55E"
                      strokeWidth="14"
                      strokeDasharray={`${arcApproved} 238.76`}
                      strokeDashoffset="0"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#3B82F6"
                      strokeWidth="14"
                      strokeDasharray={`${arcProcurement} 238.76`}
                      strokeDashoffset={`-${arcApproved}`}
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#FBBF24"
                      strokeWidth="14"
                      strokeDasharray={`${arcPending} 238.76`}
                      strokeDashoffset={`-${arcApproved + arcProcurement}`}
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#A855F7"
                      strokeWidth="14"
                      strokeDasharray={`${arcTech} 238.76`}
                      strokeDashoffset={`-${arcApproved + arcProcurement + arcPending}`}
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#94A3B8"
                      strokeWidth="14"
                      strokeDasharray={`${arcClosed} 238.76`}
                      strokeDashoffset={`-${arcApproved + arcProcurement + arcPending + arcTech}`}
                    />
                  </>
                )}
              </svg>
              {/* Center Counter */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-extrabold text-slate-900 leading-tight">
                  {totalCount}
                </span>
                <span className="text-[10px] font-semibold text-slate-600">
                  Requests
                </span>
              </div>
            </div>

            {/* Legend Column */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]"></span>
                  <span className="text-slate-600">Approved</span>
                </div>
                <strong className="font-mono text-slate-900">
                  {approvedCount} ({pApproved}%)
                </strong>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]"></span>
                  <span className="text-slate-600">Pending Approval</span>
                </div>
                <strong className="font-mono text-slate-900">
                  {pendingCount} ({pPending}%)
                </strong>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></span>
                  <span className="text-slate-600">In Procurement</span>
                </div>
                <strong className="font-mono text-slate-900">
                  {inProcurementCount} ({pProcurement}%)
                </strong>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7]"></span>
                  <span className="text-slate-600">Technical Review</span>
                </div>
                <strong className="font-mono text-slate-900">
                  {technicalReviewCount} ({pTech}%)
                </strong>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#94A3B8]"></span>
                  <span className="text-slate-600">Closed</span>
                </div>
                <strong className="font-mono text-slate-900">
                  {closedCount} ({pClosed}%)
                </strong>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-600">
              Updated in real-time across all 5 procurement phases
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
