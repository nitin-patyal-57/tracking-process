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
  LogOut,
} from "lucide-react";

interface TopHeaderProps {
  currentUser: SessionUser;
  users: SessionUser[];
  onSelectUser: (user: SessionUser) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenNewRequest: () => void;
  onOpenSopModal: () => void;
  onLogout?: () => void;
}

export default function TopHeader({
  currentUser,
  users,
  onSelectUser,
  searchQuery,
  onSearchChange,
  onOpenNewRequest,
  onOpenSopModal,
  onLogout,
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

          {/* User Profile Menu Popup */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-3 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-3">
              {/* User Info Header */}
              <div className="flex items-start space-x-3 p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {currentUser.email}
                  </div>
                  <div className="text-[10px] text-blue-600 font-semibold mt-0.5 truncate">
                    {currentUser.designation} &bull; {currentUser.department}
                  </div>
                </div>
              </div>

              {/* Role & Session Status */}
              <div className="px-2 py-1 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Role:</span>
                  <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[10px] font-mono">
                    {currentUser.role}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Session:</span>
                  <span className="flex items-center gap-1.5 text-emerald-600 font-medium text-[10px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Active Secure Session
                  </span>
                </div>
              </div>

              {/* Sign Out Button */}
              {onLogout && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50/70 hover:bg-rose-100/80 rounded-xl transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

