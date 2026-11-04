"use client";

import React from "react";
import {
  LayoutDashboard,
  FileText,
  CheckCircle2,
  ShoppingCart,
  Truck,
  ShieldCheck,
  BarChart3,
  Layers,
  Settings,
  ChevronDown,
} from "lucide-react";

export type NavItem =
  | "dashboard"
  | "requests"
  | "approvals"
  | "procurement"
  | "tracking"
  | "inspection"
  | "reports"
  | "settings";

interface SidebarProps {
  currentNav: NavItem;
  onNavigate: (item: NavItem) => void;
  pendingApprovalsCount: number;
}

export default function Sidebar({
  currentNav,
  onNavigate,
  pendingApprovalsCount,
}: SidebarProps) {
  const mainNav = [
    { id: "dashboard" as NavItem, label: "Dashboard", icon: LayoutDashboard },
    { id: "requests" as NavItem, label: "Requests", icon: FileText },
    {
      id: "approvals" as NavItem,
      label: "Approvals",
      icon: CheckCircle2,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
    },
    { id: "procurement" as NavItem, label: "Procurement", icon: ShoppingCart, hasDropdown: true },
    { id: "tracking" as NavItem, label: "Tracking", icon: Truck },
    { id: "inspection" as NavItem, label: "Inward Inspection", icon: ShieldCheck },
    { id: "reports" as NavItem, label: "Reports", icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0 min-h-screen">
      {/* Brand Logo */}
      <div className="p-5 border-b border-slate-100 flex items-center space-x-2.5">
        {/* Walnut Medical stylized logo */}
        <div className="flex items-center space-x-2">
          <svg className="w-8 h-8 text-blue-600" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M6 10L11 26L16 14L21 26L26 14L30 26"
              stroke="#1D61E7"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="11" cy="9" r="2.5" fill="#1D61E7" />
            <circle cx="21" cy="9" r="2.5" fill="#1D61E7" />
          </svg>
          <div>
            <div className="text-base font-extrabold tracking-tight text-slate-900 flex items-center">
              <span>Walnut Medical</span>
              <span className="text-[10px] text-slate-400 font-normal ml-0.5">&reg;</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav Section Label */}
      <div className="px-5 pt-5 pb-2 text-[11px] font-bold text-slate-700 tracking-wide">
        R&amp;D Procurement
      </div>

      {/* Nav Menu Items */}
      <nav className="flex-1 px-3 space-y-1">
        {mainNav.map((item) => {
          const Icon = item.icon;
          const isActive = currentNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[#1254D8] text-white shadow-sm shadow-blue-500/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                <span>{item.label}</span>
              </div>

              <div className="flex items-center space-x-1.5">
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-rose-500 text-white"
                        : "bg-rose-500 text-white"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.hasDropdown && (
                  <ChevronDown className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                )}
              </div>
            </button>
          );
        })}

        {/* Master Data Section */}
        <div className="pt-4">
          <button
            onClick={() => onNavigate("requests")}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Layers className="w-4 h-4 text-slate-500" />
              <span>Master Data</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Settings */}
        <div>
          <button
            onClick={() => onNavigate("settings")}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              currentNav === "settings"
                ? "bg-[#1254D8] text-white"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Settings</span>
          </button>
        </div>
      </nav>

      {/* Compliance Footer Note */}
      <div className="p-4 border-t border-slate-100 text-[10px] font-mono text-slate-600 space-y-0.5">
        <div>DOC: WMPL-QAS-025-01A</div>
        <div>EFFT: 01.01.2026 (REV 00)</div>
      </div>
    </aside>
  );
}

