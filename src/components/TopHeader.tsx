"use client";

import React, { useState, useRef, useEffect } from "react";
import { SessionUser } from "@/lib/types";
import {
  Search,
  Bell,
  ChevronDown,
  UserCheck,
  Plus,
  FileText,
  Building2,
  Check,
} from "lucide-react";

interface TopHeaderProps {
  currentUser: SessionUser;
  users: SessionUser[];
  onSelectUser: (user: SessionUser) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenNewRequest: () => void;
  onOpenSopModal: () => void;
}

export default function TopHeader({
  currentUser,
  users,
  onSelectUser,
  searchQuery,
  onSearchChange,
  onOpenNewRequest,
  onOpenSopModal,
}: TopHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
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

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search Input Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Request ID, PO, Part No. ..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-16 py-2 text-xs bg-[#F8FAFC] hover:bg-slate-100/70 focus:bg-white border border-slate-200/90 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1254D8]/20 focus:border-[#1254D8] transition-all"
          />
          <div className="absolute right-2.5 flex items-center">
            <kbd className="text-[10px] font-mono text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md shadow-2xs">
              Ctrl + K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3.5">
        {/* SOP Map Button */}
        <button
          onClick={onOpenSopModal}
          className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-700 bg-slate-50 hover:bg-blue-50/60 rounded-xl border border-slate-200/80 transition-colors"
          title="View SOP WMPL-QAS-025-01A Flowchart"
        >
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          <span>SOP Flowchart</span>
        </button>

        {/* New Request Button */}
        <button
          onClick={onOpenNewRequest}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#1254D8] hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Request</span>
        </button>

        {/* Notification Bell with Badge */}
        <div className="relative">
          <button className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </button>
        </div>

        {/* User Profile Pill & Role Switcher Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2.5 p-1.5 pl-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left"
          >
            {/* Avatar Circle */}
            <div className="w-8 h-8 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-xs font-bold tracking-tight shadow-xs">
              {initials}
            </div>

            {/* Name & Designation */}
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[11px] text-slate-500 leading-tight">
                {currentUser.designation}
              </div>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Role Switcher Menu Popup */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100">
                <div className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">
                  Switch Active Persona
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Test approvals, sourcing, and inspection as different roles:
                </div>
              </div>

              <div className="py-1 max-h-72 overflow-y-auto">
                {users.map((u) => {
                  const isSelected = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSelectUser(u);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors ${
                        isSelected ? "bg-blue-50/60 font-semibold" : ""
                      }`}
                    >
                      <div>
                        <div className="text-slate-900 font-medium flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                        <div className="text-[11px] text-slate-600">
                          {u.designation} • {u.department}
                        </div>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                        {u.role.replace("APPROVER_", "TIER-")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

