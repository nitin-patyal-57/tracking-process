"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { SessionUser } from "@/lib/types";
import {
  Search,
  Bell,
  ChevronDown,
  Plus,
  LogOut,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Package,
  CheckCircle2,
  CheckCheck,
  Mail,
} from "lucide-react";

interface TopHeaderProps {
  currentUser: SessionUser;
  users?: SessionUser[];
  onSelectUser?: (user: SessionUser) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenNewRequest: () => void;
  onLogout?: () => void;
  requests?: any[];
  onSelectRequest?: (req: any) => void;
}

export default function TopHeader({
  currentUser,
  users,
  onSelectUser,
  searchQuery,
  onSearchChange,
  onOpenNewRequest,
  onLogout,
  requests = [],
  onSelectRequest,
}: TopHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const [readNotifIds, setReadNotifIds] = useState<string[]>([]);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute initials
  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const roleLabels: Record<string, string> = {
    REQUESTER: "Requester",
    APPROVER_TIER1: "Approver · Tier 1",
    APPROVER_TIER2: "Approver · Tier 2",
    APPROVER_TIER3: "Approver · Tier 3",
    BUSINESS: "Business",
    STORE_QA: "Store QA",
    ADMIN: "Administrator",
  };
  const roleLabel = roleLabels[currentUser.role] || currentUser.role.replace(/_/g, " ");

  // Dynamic alerts computed from requests per SOP WMPL-QAS-025-01A
  const notifications = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      description: string;
      time: string;
      type: "APPROVAL" | "EDD" | "DELAY" | "INWARD" | "SYSTEM";
      request?: any;
    }> = [];

    (requests || []).forEach((r) => {
      // 1. Pending Approvals (Phase 2)
      if (r.status === "PENDING_APPROVAL" || r.currentPhase === "PHASE_2") {
        list.push({
          id: `app-${r.id}`,
          title: `Pending Approval: ${r.requestNumber || "Request"}`,
          description: `${r.title || "Procurement item"} is awaiting Phase 2 review.`,
          time: new Date(r.createdAt || Date.now()).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          }),
          type: "APPROVAL",
          request: r,
        });
      }

      // 2. EDD <= 7 Days Alert (Phase 4 SOP)
      if (r.isEddWithin7Days) {
        list.push({
          id: `edd-${r.id}`,
          title: `Delivery Alert: ${r.requestNumber || "Order"}`,
          description: `Expected delivery within 7 days. Automated vendor follow-up logged.`,
          time: "Within 7 Days",
          type: "EDD",
          request: r,
        });
      }

      // 3. Delayed Orders (Phase 4 SOP)
      if (r.isDelayed) {
        list.push({
          id: `delay-${r.id}`,
          title: `Delivery Delay Alert: ${r.requestNumber || "Order"}`,
          description: `Shipment delayed beyond scheduled EDD. Check tracking logs.`,
          time: "Action Required",
          type: "DELAY",
          request: r,
        });
      }

      // 4. Inward Inspection Required (Phase 5 SOP)
      if (r.currentPhase === "PHASE_5" && r.status !== "CLOSED") {
        list.push({
          id: `inw-${r.id}`,
          title: `Inward QC Pending: ${r.requestNumber || "Order"}`,
          description: `Goods received at Store. Pending physical inspection & feedback.`,
          time: "At Store",
          type: "INWARD",
          request: r,
        });
      }
    });

    if (list.length === 0) {
      list.push({
        id: "sys-active",
        title: "All Clear • System Nominal",
        description: "No pending alerts or delayed orders. SOP compliance tracking active.",
        time: "Now",
        type: "SYSTEM",
      });
    }

    return list;
  }, [requests]);

  const unreadCount = notifications.filter(
    (n) => !readNotifIds.includes(n.id) && n.type !== "SYSTEM"
  ).length;

  const markAllRead = () => {
    setReadNotifIds(notifications.map((n) => n.id));
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white">
      <div className="flex items-center justify-between gap-2 px-4 py-2 lg:h-16 lg:px-6">
        <div className="flex min-w-0 items-center gap-2 lg:hidden">
          <img
            src="/Walnut_Technologies_logo_transparent.webp"
            alt="Walnut Technologies"
            className="h-9 w-36 shrink-0 object-contain object-left"
          />
        </div>

        {/* Desktop Search Input */}
        <div className="hidden max-w-xl flex-1 lg:block">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Request ID, PO, Part No. ..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F8FAFC] hover:bg-slate-100/70 focus:bg-white border border-slate-200/90 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1254D8]/20 focus:border-[#1254D8] transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3.5">
        {/* New Request Button */}
        <button
          onClick={onOpenNewRequest}
          className="inline-flex items-center space-x-1.5 rounded-xl bg-[#1254D8] px-2.5 py-2 text-xs font-bold text-white shadow-xs shadow-blue-500/20 transition-all hover:bg-blue-700 active:bg-blue-800 sm:px-3.5 sm:py-1.5"
          aria-label="Create new request"
        >
          <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">New Request</span>
        </button>

        {/* Notification Bell with Dropdown Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setDropdownOpen(false);
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative cursor-pointer"
            title="Notifications & Alerts"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 ring-2 ring-white"></span>
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-[min(24rem,calc(100vw-1rem))] sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-0 z-50 animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-900">Notifications &amp; Alerts</span>
                  {unreadCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                      {unreadCount} New
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                      Caught Up
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.map((n) => {
                  const isRead = readNotifIds.includes(n.id);
                  return (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (n.request && onSelectRequest) {
                          onSelectRequest(n.request);
                          setNotifOpen(false);
                        }
                        if (!isRead) {
                          setReadNotifIds((prev) => [...prev, n.id]);
                        }
                      }}
                      className={`p-3.5 flex items-start space-x-3 transition-colors ${
                        n.request ? "hover:bg-blue-50/50 cursor-pointer" : ""
                      } ${!isRead && n.type !== "SYSTEM" ? "bg-blue-50/20" : ""}`}
                    >
                      {/* Icon */}
                      <div className="shrink-0 mt-0.5">
                        {n.type === "APPROVAL" && (
                          <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {n.type === "EDD" && (
                          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {n.type === "DELAY" && (
                          <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {n.type === "INWARD" && (
                          <div className="w-7 h-7 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center">
                            <Package className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {n.type === "SYSTEM" && (
                          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {n.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                            {n.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                          {n.description}
                        </p>
                        {n.request && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-blue-600">
                            <span>Click to view details &rarr;</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400 font-medium">
                Walnut Medical Alert Engine &bull; SOP WMPL-QAS-025-01A
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setNotifOpen(false);
            }}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            aria-label={`Profile menu for ${currentUser.name}`}
            className={`flex items-center gap-2 rounded-2xl border px-2 py-1.5 text-left transition-all ${
              dropdownOpen
                ? "border-blue-200 bg-blue-50/70 shadow-sm"
                : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {/* Avatar Circle */}
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-xs font-bold tracking-tight text-white shadow-sm ring-1 ring-white">
              {initials}
            </div>

            {/* Name & Designation */}
            <div className="hidden sm:block">
              <div className="text-xs font-bold leading-tight text-slate-900">
                {currentUser.name}
              </div>
              <div className="mt-0.5 max-w-36 truncate text-[10px] leading-tight text-slate-500">
                {currentUser.designation}
              </div>
            </div>

            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* User Profile Menu Popup */}
          {dropdownOpen && (
            <div
              role="dialog"
              aria-label="Profile details"
              aria-modal="false"
              className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_20px_60px_-20px_rgba(15,23,42,0.32)] animate-in fade-in zoom-in-95 duration-150"
            >
              {/* User Info Header */}
              <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-sm font-bold text-white shadow-md ring-4 ring-white">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-slate-900">
                      {currentUser.name}
                    </div>
                    <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{currentUser.email}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-medium text-slate-600">
                    {currentUser.designation}
                  </span>
                  <span className="shrink-0 rounded-full border border-blue-100 bg-white/80 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                    {currentUser.department}
                  </span>
                </div>
              </div>

              {/* Role & Session Status */}
              <div className="space-y-3 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-700">
                      Portal access
                    </div>
                    <div className="mt-1 text-[10px] text-slate-500">
                      Permissions assigned to your account
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                    {roleLabel}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-3 py-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-800">Secure session</div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[10px] font-medium text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active on this device
                    </div>
                  </div>
                </div>
              </div>

              {/* Sign Out Button */}
              {onLogout && (
                <div className="border-t border-slate-100 bg-slate-50/70 p-3">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-100 bg-white px-3 py-2.5 text-xs font-semibold text-rose-600 transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 active:scale-[0.99]"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Mobile Search Input */}
      <div className="px-4 pb-3 lg:hidden">
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search requests or purchase orders"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200/90 bg-[#F8FAFC] py-2.5 pl-9 pr-4 text-xs transition-all focus:border-[#1254D8] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#1254D8]/20"
          />
        </div>
      </div>
    </header>
  );
}
