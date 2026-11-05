"use client";

import React, { useState, useEffect } from "react";
import Sidebar, { NavItem } from "./Sidebar";
import TopHeader from "./TopHeader";
import DashboardView from "./DashboardView";
import RequestsView from "./RequestsView";
import ApprovalsView from "./ApprovalsView";
import ProcurementView from "./ProcurementView";
import TrackingView from "./TrackingView";
import InspectionView from "./InspectionView";
import SopModal from "./SopModal";
import NewRequestModal from "./NewRequestModal";
import RequestDetailModal from "./RequestDetailModal";
import LoginPage from "./LoginPage";
import { SessionUser } from "@/lib/types";

export default function Dashboard() {
  const [currentNav, setCurrentNav] = useState<NavItem>("dashboard");
  const [users, setUsers] = useState<SessionUser[]>([]);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [authChecking, setAuthChecking] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isSopOpen, setIsSopOpen] = useState(false);
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  // Check initial authentication
  const checkAuthAndFetch = async () => {
    try {
      // 1. Check if session cookie exists
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();

      if (meData.user) {
        setCurrentUser(meData.user);
        // Fetch dashboard data
        await fetchAppData();
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error("Auth check error:", err);
      setCurrentUser(null);
    } finally {
      setAuthChecking(false);
    }
  };

  const fetchAppData = async () => {
    try {
      const [usersRes, reqsRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/requests"),
      ]);
      const usersData = await usersRes.json();
      const reqsData = await reqsRes.json();

      if (usersData.users) {
        setUsers(usersData.users);
      }
      if (reqsData.requests) {
        setRequests(reqsData.requests);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  };

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      setCurrentUser(null);
      setRequests([]);
    }
  };

  // If still checking session on first render
  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-9 h-9 rounded-full border-3 border-blue-600 border-t-transparent animate-spin" />
          <div className="text-xs font-bold text-slate-600">Loading Walnut Medical Portal...</div>
        </div>
      </div>
    );
  }

  // If not authenticated, show professional login page
  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          fetchAppData();
        }}
      />
    );
  }

  const pendingApprovalsCount = requests.filter(
    (r) => r.status === "PENDING_APPROVAL" || r.currentPhase === "PHASE_2"
  ).length;

  // Filter requests by global search
  const filteredRequests = requests.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.requestNumber?.toLowerCase().includes(q) ||
      r.title?.toLowerCase().includes(q) ||
      r.requester?.name?.toLowerCase().includes(q) ||
      r.purchaseOrder?.poNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans antialiased text-slate-900">
      {/* 1. Left Sidebar */}
      <Sidebar
        currentNav={currentNav}
        onNavigate={setCurrentNav}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* 2. Main Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader
          currentUser={currentUser}
          users={users}
          onSelectUser={(u) => {
            setCurrentUser(u);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenNewRequest={() => setIsNewRequestOpen(true)}
          onOpenSopModal={() => setIsSopOpen(true)}
          onLogout={handleLogout}
          requests={requests}
          onSelectRequest={setSelectedRequest}
        />

        {/* 3. Main Dynamic Content */}
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 pb-24 lg:p-6">
          {currentNav === "dashboard" && (
            <DashboardView
              currentUser={currentUser}
              requests={filteredRequests}
              onSelectRequest={setSelectedRequest}
              onNavigateToRequests={() => setCurrentNav("requests")}
              onNavigateToPhase={(phase) => {
                if (phase === "PHASE_2") setCurrentNav("approvals");
                else if (phase === "PHASE_3") setCurrentNav("procurement");
                else if (phase === "PHASE_4") setCurrentNav("tracking");
                else if (phase === "PHASE_5") setCurrentNav("inspection");
                else setCurrentNav("requests");
              }}
            />
          )}

          {currentNav === "requests" && (
            <RequestsView
              currentUser={currentUser}
              requests={filteredRequests}
              onSelectRequest={setSelectedRequest}
              onOpenNewRequest={() => setIsNewRequestOpen(true)}
            />
          )}

          {currentNav === "approvals" && (
            <ApprovalsView
              currentUser={currentUser}
              requests={filteredRequests}
              onSelectRequest={setSelectedRequest}
              onRefresh={fetchAppData}
            />
          )}

          {currentNav === "procurement" && (
            <ProcurementView
              currentUser={currentUser}
              requests={filteredRequests}
              onSelectRequest={setSelectedRequest}
            />
          )}

          {currentNav === "tracking" && (
            <TrackingView
              currentUser={currentUser}
              requests={filteredRequests}
              onSelectRequest={setSelectedRequest}
            />
          )}

          {currentNav === "inspection" && (
            <InspectionView
              currentUser={currentUser}
              requests={filteredRequests}
              onSelectRequest={setSelectedRequest}
            />
          )}

          {(currentNav === "reports" || currentNav === "settings") && (
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-2xs space-y-3">
              <h2 className="text-base font-extrabold text-slate-900">
                {currentNav === "reports" ? "System Analytics & SOP Metrics" : "Portal Settings"}
              </h2>
              <p className="text-xs text-slate-500">
                SOP Document Reference: <strong>DOC. NO. WMPL-QAS-025-01A (REV. NO. 00)</strong>.
                Effective Date: <strong>01.01.2026</strong>. Walnut Medical Pvt Ltd, Plot No. 132 JLPL Industrial Area Sec 82 Mohali.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <SopModal isOpen={isSopOpen} onClose={() => setIsSopOpen(false)} />

      <NewRequestModal
        isOpen={isNewRequestOpen}
        onClose={() => setIsNewRequestOpen(false)}
        currentUser={currentUser}
        onSuccess={fetchAppData}
      />

      {selectedRequest && (
        <RequestDetailModal
          isOpen={Boolean(selectedRequest)}
          onClose={() => setSelectedRequest(null)}
          request={selectedRequest}
          currentUser={currentUser}
          onRefresh={() => {
            fetchAppData();
            fetch(`/api/requests/${selectedRequest.id}`)
              .then((r) => r.json())
              .then((d) => {
                if (d.request) setSelectedRequest(d.request);
              });
          }}
        />
      )}
    </div>
  );
}
