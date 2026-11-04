"use client";

import React from "react";
import { X, ExternalLink, Download, CheckCircle, ShieldAlert } from "lucide-react";

interface SopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SopModal({ isOpen, onClose }: SopModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-blue-600 px-2 py-0.5 rounded-sm font-semibold">
                DOC. NO. WMPL-QAS-025-01A
              </span>
              <span className="text-xs text-slate-400">Rev. 00 | Efft. 01.01.2026</span>
            </div>
            <h2 className="text-lg font-bold mt-1 text-white">
              Walnut Medical R&D Procurement & Tracking Process Flowchart
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Official Flowchart Image */}
          <div className="border border-slate-300 rounded-lg overflow-hidden bg-slate-50 p-2 shadow-xs">
            <img
              src="/workflow_diagram.jpg"
              alt="Walnut Medical R&D Procurement & Tracking Process"
              className="w-full h-auto rounded-sm object-contain max-h-[60vh] mx-auto"
            />
          </div>

          {/* Quick Rules Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs">
              <h4 className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                Phase 1: Request Rules
              </h4>
              <p className="text-amber-800 mb-1">
                • <strong>Tool/Equipment:</strong> Excel template upload/download. Single/batch. Price is <em>optional</em> (Business Team evaluates if blank).
              </p>
              <p className="text-amber-800">
                • <strong>BOM Parts:</strong> Accurate MPN & Part Name required. <strong>Datasheet attachment is MANDATORY.</strong>
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
              <h4 className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                Phase 2: Approvals Matrix
              </h4>
              <p className="text-blue-800 mb-1">
                • <strong>Price $\le$ ₹2,000:</strong> Mr. Abhishek
              </p>
              <p className="text-blue-800 mb-1">
                • <strong>Price $\le$ ₹5,000:</strong> Mr. Jaydeep Panchal (R&D Head)
              </p>
              <p className="text-blue-800 mb-1">
                • <strong>Price &gt; ₹5,000:</strong> Mr. Amol Bhardwaj (CTO)
              </p>
              <p className="text-blue-800">
                • <strong>Special Case:</strong> Abhishek Sir's tech requests $\rightarrow$ Jaydeep Sir for validation.
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs">
              <h4 className="font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                Phases 3, 4 & 5 Controls
              </h4>
              <p className="text-emerald-800 mb-1">
                • <strong>Phase 3:</strong> High Cost rejection needs mandatory reason. Alternate parts require R&D review.
              </p>
              <p className="text-emerald-800 mb-1">
                • <strong>Phase 4:</strong> Cost metrics hidden from regular requester. EDD $\le$ 7 days automated alert. Delays require mandatory reason.
              </p>
              <p className="text-emerald-800">
                • <strong>Phase 5:</strong> Store QA signoff + mandatory 3-point requester feedback to close order.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}

