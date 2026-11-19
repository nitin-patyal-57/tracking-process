"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Layout Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased bg-[#F8FAFC] text-slate-900 min-h-screen flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center space-y-6">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-extrabold text-slate-900">Application Notice</h2>
            <p className="text-xs text-slate-500">
              A layout exception occurred. Click below to reload the session.
            </p>
          </div>
          <button
            onClick={() => reset()}
            className="w-full py-3 px-4 bg-[#1254D8] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reload Application</span>
          </button>
        </div>
      </body>
    </html>
  );
}
