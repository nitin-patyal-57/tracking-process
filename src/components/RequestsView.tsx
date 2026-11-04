"use client";

import React, { useState } from "react";
import {
  FileText,
  FileSpreadsheet,
  Plus,
  ChevronRight,
  Filter,
  Search,
  Layers,
  Wrench,
  AlertTriangle,
} from "lucide-react";
import { SessionUser } from "@/lib/types";

interface RequestsViewProps {
  currentUser: SessionUser;
  requests: any[];
  onSelectRequest: (req: any) => void;
  onOpenNewRequest: () => void;
}

export default function RequestsView({
  currentUser,
  requests,
  onSelectRequest,
  onOpenNewRequest,
}: RequestsViewProps) {
  const [filterPhase, setFilterPhase] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");
  const [search, setSearch] = useState("");

  const filtered = requests.filter((r) => {
    if (filterPhase !== "ALL" && r.currentPhase !== filterPhase) return false;
    if (filterType !== "ALL" && r.requestType !== filterType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNum = r.requestNumber?.toLowerCase().includes(q);
      const matchTitle = r.title?.toLowerCase().includes(q);
      const matchReq = r.requester?.name?.toLowerCase().includes(q);
      if (!matchNum && !matchTitle && !matchReq) return false;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">Approved</span>;
      case "PENDING_APPROVAL":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700">Pending Approval</span>;
      case "SOURCING":
      case "ORDER_PLACED":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700">In Procurement</span>;
      case "CLOSED":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">Closed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Requests Register</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete log of all R&amp;D requests across the 5 SOP phases
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/templates/download?type=bom"
            download
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>BOM Template</span>
          </a>
          <button
            onClick={onOpenNewRequest}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#1254D8] hover:bg-blue-700 rounded-xl shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Request</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {["ALL", "PHASE_1", "PHASE_2", "PHASE_3", "PHASE_4", "PHASE_5"].map((ph) => (
            <button
              key={ph}
              onClick={() => setFilterPhase(ph)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterPhase === ph
                  ? "bg-[#1254D8] text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {ph === "ALL" ? "All Phases" : ph.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search register..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Project &amp; Title</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Est. Cost (&#8377;)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Phase</th>
                <th className="py-3 px-4">Requester</th>
                <th className="py-3 px-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => onSelectRequest(r)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-[#1254D8] whitespace-nowrap">
                    {r.requestNumber}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div className="font-bold">{r.title.split("-")[0]?.trim() || r.title}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-xs">{r.justification}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                    {r.requestType === "BOM_PARTS" ? "BOM Parts" : "Tool / Equipment"}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                    &#8377;{r.totalEstimatedCost?.toLocaleString("en-IN") || "0"}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {getStatusBadge(r.status)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {r.currentPhase.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                    {r.requester?.name || "R&D Team"}
                  </td>
                  <td className="py-3.5 px-2 text-right">
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

