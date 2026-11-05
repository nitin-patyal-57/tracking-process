"use client";

import React from "react";
import { UserRole, SessionUser } from "@/lib/types";
import {
  FileSpreadsheet,
  PlusCircle,
  UserCheck,
  ShieldCheck,
  Clock,
  Building2,
} from "lucide-react";

interface HeaderProps {
  currentUser: SessionUser;
  users: SessionUser[];
  onSelectUser: (user: SessionUser) => void;
  onOpenNewRequest: () => void;
}

export default function Header({
  currentUser,
  users,
  onSelectUser,
  onOpenNewRequest,
}: HeaderProps) {
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "APPROVER_TIER1":
      case "APPROVER_TIER2":
      case "APPROVER_TIER3":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "BUSINESS":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "STORE_QA":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "ADMIN":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-amber-100 text-amber-800 border-amber-300";
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Compliance Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 font-semibold text-white">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>WALNUT MEDICAL PVT LTD</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-400">
            Plot No. 132 JLPL Industrial Area Sec 82 Mohali - 160055
          </span>
        </div>
        <div className="flex items-center space-x-4 font-mono text-[11px]">
          <span>DOC. NO. <strong className="text-amber-400">WMPL-QAS-025-01A</strong></span>
          <span>REV. NO. <strong className="text-white">00</strong></span>
          <span>EFFT. DT. <strong className="text-white">01.01.2026</strong></span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-700 to-indigo-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            WM
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight flex items-center gap-2">
              Walnut Medical R&D Procurement Portal
            </h1>
            <p className="text-xs text-slate-500">
              Procurement, Multi-Tier Approvals, Live Tracking & Inward Inspection
            </p>
          </div>
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* New Request Button */}
          <button
            onClick={onOpenNewRequest}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Request</span>
          </button>

          {/* Role Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 pl-2.5 rounded-lg border border-slate-200">
            <UserCheck className="w-4 h-4 text-slate-500" />
            <div className="text-left">
              <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                Acting As
              </div>
              <select
                aria-label="Acting As Role"
                value={currentUser.id}
                onChange={(e) => {
                  const found = users.find((u) => u.id === e.target.value);
                  if (found) onSelectUser(found);
                }}
                className="bg-transparent font-medium text-xs text-slate-800 border-none outline-hidden cursor-pointer pr-1"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.designation})
                  </option>
                ))}
              </select>
            </div>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getRoleBadgeColor(
                currentUser.role
              )}`}
            >
              {currentUser.role.replace("APPROVER_", "TIER-")}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
