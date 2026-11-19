"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home, LogIn } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Client Exception caught by ErrorBoundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/90 p-8 text-center space-y-6">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Portal Interface Notice
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            A temporary view state error occurred while rendering the portal interface.
          </p>
          {error?.message && (
            <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-mono text-slate-700 text-left overflow-x-auto max-h-24">
              {error.message}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 px-4 bg-[#1254D8] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <button
            onClick={() => {
              window.location.href = "/";
            }}
            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Reload Portal</span>
          </button>
        </div>

        <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400">
          Walnut Medical R&amp;D Procurement Portal &bull; SOP WMPL-QAS-025-01A
        </div>
      </div>
    </div>
  );
}
