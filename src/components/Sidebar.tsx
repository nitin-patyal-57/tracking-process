"use client";

import React, { useState } from "react";
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
  MoreHorizontal,
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
  const [moreOpen, setMoreOpen] = useState(false);
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
  const mobileNav: { id: NavItem; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "dashboard", label: "Home", icon: LayoutDashboard },
    { id: "requests", label: "Requests", icon: FileText },
    { id: "approvals", label: "Approvals", icon: CheckCircle2 },
    { id: "tracking", label: "Tracking", icon: Truck },
  ];
  const moreNav: { id: NavItem; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "procurement", label: "Procurement", icon: ShoppingCart },
    { id: "inspection", label: "Inward Inspection", icon: ShieldCheck },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];
  const moreIsActive = moreNav.some((item) => currentNav === item.id);

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white lg:flex lg:min-h-screen">
      {/* Brand Logo */}
      <div className="flex h-[76px] items-center border-b border-slate-100 px-5 py-3">
        <img
          src="/Walnut_Technologies_logo_transparent.webp"
          alt="Walnut Technologies"
          className="h-full w-full object-contain object-left"
        />
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
      <nav aria-label="Main navigation" className="mobile-bottom-nav lg:hidden">
      {moreOpen && (
        <div className="absolute bottom-[calc(100%+0.5rem)] right-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            More sections
          </div>
          {moreNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMoreOpen(false);
                }}
                aria-current={isActive ? "page" : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold ${
                  isActive ? "bg-blue-50 text-[#1254D8]" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
      {mobileNav.map((item) => {
        const Icon = item.icon;
        const isActive = currentNav === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              onNavigate(item.id);
              setMoreOpen(false);
            }}
            aria-current={isActive ? "page" : undefined}
            className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold ${
              isActive ? "text-[#1254D8]" : "text-slate-500"
            }`}
          >
            <span className="relative">
              <Icon className="h-5 w-5" />
              {item.id === "approvals" && pendingApprovalsCount > 0 && (
                <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                  {pendingApprovalsCount}
                </span>
              )}
            </span>
            <span className="truncate">{item.label}</span>
          </button>
        );
      })}
      <button
        onClick={() => setMoreOpen((open) => !open)}
        aria-expanded={moreOpen}
        aria-label="More navigation options"
        className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold ${
          moreOpen || moreIsActive ? "text-[#1254D8]" : "text-slate-500"
        }`}
      >
        <MoreHorizontal className="h-5 w-5" />
        <span>More</span>
      </button>
      </nav>
    </>
  );
}
