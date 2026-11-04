"use client";

import React from "react";
import { PhaseName } from "@/lib/types";
import {
  Layers,
  FileEdit,
  CheckCircle2,
  PackageSearch,
  Truck,
  ClipboardCheck,
  AlertTriangle,
  Search,
} from "lucide-react";

interface PhaseNavProps {
  currentPhase: PhaseName | "ALL";
  onSelectPhase: (phase: PhaseName | "ALL") => void;
  counts: Record<string, number>;
  alertCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function PhaseNav({
  currentPhase,
  onSelectPhase,
  counts,
  alertCount,
  searchQuery,
  onSearchChange,
}: PhaseNavProps) {
  const phases = [
    {
      id: "ALL",
      name: "All Requests",
      icon: Layers,
      color: "border-slate-300 text-slate-700 bg-slate-50",
      activeColor: "bg-slate-900 text-white border-slate-900 shadow-xs",
      count: counts.ALL || 0,
    },
    {
      id: "PHASE_1",
      name: "Phase 1: Initiation",
      subtitle: "Tool / BOM Drafts",
      icon: FileEdit,
      color: "border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100",
      activeColor: "bg-amber-600 text-white border-amber-600 shadow-xs",
      count: counts.PHASE_1 || 0,
    },
    {
      id: "PHASE_2",
      name: "Phase 2: Approval",
      subtitle: "Price & Tier Routing",
      icon: CheckCircle2,
      color: "border-blue-300 text-blue-800 bg-blue-50 hover:bg-blue-100",
      activeColor: "bg-blue-600 text-white border-blue-600 shadow-xs",
      count: counts.PHASE_2 || 0,
    },
    {
      id: "PHASE_3",
      name: "Phase 3: Sourcing",
      subtitle: "Cost, Lead & Alternates",
      icon: PackageSearch,
      color: "border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100",
      activeColor: "bg-emerald-600 text-white border-emerald-600 shadow-xs",
      count: counts.PHASE_3 || 0,
    },
    {
      id: "PHASE_4",
      name: "Phase 4: Tracking",
      subtitle: "Live Follow-up & Alert",
      icon: Truck,
      color: "border-yellow-400 text-yellow-900 bg-yellow-50 hover:bg-yellow-100",
      activeColor: "bg-yellow-500 text-white border-yellow-500 shadow-xs",
      count: counts.PHASE_4 || 0,
      hasAlert: alertCount > 0,
    },
    {
      id: "PHASE_5",
      name: "Phase 5: Inward & QA",
      subtitle: "Handover & Feedback",
      icon: ClipboardCheck,
      color: "border-purple-300 text-purple-800 bg-purple-50 hover:bg-purple-100",
      activeColor: "bg-purple-600 text-white border-purple-600 shadow-xs",
      count: counts.PHASE_5 || 0,
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Phase Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {phases.map((p) => {
            const Icon = p.icon;
            const isActive = currentPhase === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPhase(p.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${
                  isActive ? p.activeColor : p.color
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <div className="text-left">
                  <div className="font-semibold">{p.name}</div>
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-white text-slate-700 shadow-xs"
                  }`}
                >
                  {p.count}
                </span>

                {p.hasAlert && (
                  <span
                    className="inline-flex items-center gap-0.5 bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded-full animate-pulse font-semibold"
                    title={`${alertCount} orders with EDD <= 7 days`}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    {alertCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search MPN, Req #, title..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>
    </div>
  );
}

