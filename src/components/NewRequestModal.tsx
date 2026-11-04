"use client";

import React, { useState, useRef } from "react";
import { RequestType, SessionUser } from "@/lib/types";
import {
  X,
  Upload,
  Plus,
  Trash2,
  FileText,
  AlertCircle,
  Check,
  ChevronRight,
  ArrowLeft,
  Calendar,
  FileSpreadsheet,
  Layers,
  Wrench,
} from "lucide-react";

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: SessionUser;
  onSuccess: () => void;
}

interface ItemDraft {
  partNumber: string;
  partName: string;
  quantity: number;
  estimatedUnitPrice: string;
  datasheetUrl?: string;
  datasheetFileName?: string;
  optionalSource?: string;
}

export default function NewRequestModal({
  isOpen,
  onClose,
  currentUser,
  onSuccess,
}: NewRequestModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Step 1: Details
  const [project, setProject] = useState("Soundbox V2");
  const [customProject, setCustomProject] = useState("");
  const [requestType, setRequestType] = useState<RequestType>("BOM_PARTS");
  const [justification, setJustification] = useState("");
  const [requiredBy, setRequiredBy] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [technicalValidationRequired, setTechnicalValidationRequired] = useState(false);

  // Form Step 2: Items (Clean start for real data)
  const [items, setItems] = useState<ItemDraft[]>([
    {
      partNumber: "",
      partName: "",
      quantity: 1,
      estimatedUnitPrice: "",
      optionalSource: "",
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const excelInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const projectOptions = [
    "Soundbox V2",
    "GPS Gateway",
    "Harvester Cluster",
    "Audio Module",
    "Pulse Oximeter Mainboard",
    "ECG Patient Monitor",
    "Other (Custom Project)",
  ];

  // Excel parsing
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("parseExcel", "true");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.items && data.items.length > 0) {
        setItems(
          data.items.map((it: any) => ({
            partNumber: it.partNumber || "",
            partName: it.partName || "",
            quantity: it.quantity || 1,
            estimatedUnitPrice: it.estimatedUnitPrice ? String(it.estimatedUnitPrice) : "",
            datasheetFileName: it.datasheetFileName || "",
            optionalSource: it.optionalSource || "",
          }))
        );
        setErrorMessage(null);
      }
    } catch (err) {
      setErrorMessage("Failed to upload/parse Excel file.");
    } finally {
      if (excelInputRef.current) excelInputRef.current.value = "";
    }
  };

  // Datasheet upload
  const handleDatasheetUpload = async (index: number, file: File | null) => {
    if (!file) return;
    setUploadingIndex(index);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        const copy = [...items];
        copy[index].datasheetUrl = data.url;
        copy[index].datasheetFileName = data.filename;
        setItems(copy);
      }
    } catch (err) {
      alert("Error uploading datasheet.");
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { partNumber: "", partName: "", quantity: 1, estimatedUnitPrice: "", optionalSource: "" },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof ItemDraft, val: any) => {
    const copy = [...items];
    copy[index] = { ...copy[index], [field]: val };
    setItems(copy);
  };

  // Calculate estimated total
  const totalCost = items.reduce((acc, it) => {
    const p = parseFloat(it.estimatedUnitPrice) || 0;
    const q = it.quantity || 1;
    return acc + p * q;
  }, 0);

  // Validate Step 1
  const handleNextFromStep1 = () => {
    setErrorMessage(null);
    if (!justification.trim()) {
      setErrorMessage("Purpose / Justification is required.");
      return;
    }
    setStep(2);
  };

  // Validate Step 2
  const handleNextFromStep2 = () => {
    setErrorMessage(null);
    if (items.length === 0) {
      setErrorMessage("At least one item is required.");
      return;
    }
    if (requestType === "BOM_PARTS") {
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (!it.partNumber.trim() || !it.partName.trim()) {
          setErrorMessage(`Item #${i + 1} must have an accurate Part Number and Part Name.`);
          return;
        }
      }
    }
    setStep(3);
  };

  // Submit Request
  const handleSubmit = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    const projectTitle = project === "Other (Custom Project)" ? customProject : project;
    const fullTitle = `${projectTitle} - ${requestType === "BOM_PARTS" ? "BOM Parts" : "Tool / Equipment"}`;

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType,
          title: fullTitle,
          justification,
          requesterId: currentUser.id,
          technicalValidationRequired,
          currency: "INR",
          items,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMessage(data.error || "Failed to submit request.");
      } else {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setErrorMessage("Network error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {step > 1 && (
              <button
                onClick={() => setStep((step - 1) as any)}
                className="text-slate-400 hover:text-slate-800 p-1 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-base font-extrabold text-slate-900">New Request</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-800 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Step Indicator Bar matching Mobile Screen 2 */}
        <div className="px-8 pt-5 pb-3">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-6 right-6 top-4 h-0.5 bg-slate-200 -z-0" />

            {/* Step 1 */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step === 1
                  ? "bg-[#1254D8] text-white shadow-xs"
                  : step > 1
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-600"
                  }`}
              >
                {step > 1 ? <Check className="w-4 h-4" /> : "1"}
              </div>
              <span className={`text-[11px] font-semibold mt-1.5 ${step === 1 ? "text-blue-600" : "text-slate-500"}`}>
                Details
              </span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step === 2
                  ? "bg-[#1254D8] text-white shadow-xs"
                  : step > 2
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-600"
                  }`}
              >
                {step > 2 ? <Check className="w-4 h-4" /> : "2"}
              </div>
              <span className={`text-[11px] font-semibold mt-1.5 ${step === 2 ? "text-blue-600" : "text-slate-500"}`}>
                Items / BOM
              </span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step === 3
                  ? "bg-[#1254D8] text-white shadow-xs"
                  : "bg-slate-200 text-slate-600"
                  }`}
              >
                3
              </div>
              <span className={`text-[11px] font-semibold mt-1.5 ${step === 3 ? "text-blue-600" : "text-slate-500"}`}>
                Review
              </span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-300 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ================= STEP 1: DETAILS ================= */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Project / Product */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Project / Product <span className="text-rose-500">*</span>
                </label>
                <select
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
                >
                  {projectOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {project === "Other (Custom Project)" && (
                  <input
                    type="text"
                    required
                    placeholder="Enter project name..."
                    value={customProject}
                    onChange={(e) => setCustomProject(e.target.value)}
                    className="w-full mt-2 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                )}
              </div>

              {/* Request Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Request Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
                >
                  <option value="BOM_PARTS">BOM Parts</option>
                  <option value="TOOL_EQUIPMENT">Tool / Equipment</option>
                </select>
              </div>

              {/* Purpose / Justification */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Purpose / Justification <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Procurement of components for prototype..."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              {/* Required By Date Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Required By <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={requiredBy}
                    onChange={(e) => setRequiredBy(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
                  />
                </div>
              </div>

              {/* Priority Pills */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Priority <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPriority("High")}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${priority === "High"
                      ? "bg-rose-100 text-rose-700 border-2 border-rose-400"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent"
                      }`}
                  >
                    High
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority("Medium")}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${priority === "Medium"
                      ? "bg-amber-100 text-amber-700 border-2 border-amber-400"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent"
                      }`}
                  >
                    Medium
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority("Low")}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${priority === "Low"
                      ? "bg-blue-100 text-blue-700 border-2 border-blue-400"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent"
                      }`}
                  >
                    Low
                  </button>
                </div>
              </div>

              {/* Attachments Dashed Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Attachments
                </label>
                <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50">
                  <Upload className="w-5 h-5 text-blue-600 mb-1.5" />
                  <div className="text-xs font-bold text-slate-800">
                    Upload BOM / Datasheet
                  </div>
                  <div className="text-[10px] text-slate-600 mt-0.5">
                    (Excel, PDF, ZIP)
                  </div>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.pdf,.zip"
                    onChange={handleExcelUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* ================= STEP 2: ITEMS / BOM ================= */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-800">
                  Part Items ({items.length})
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`/api/templates/download?type=${requestType === "BOM_PARTS" ? "bom" : "tool"}`}
                    download
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200"
                  >
                    <FileSpreadsheet className="w-3 h-3" />
                    Template
                  </a>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Row
                  </button>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2.5 max-h-80 overflow-y-auto">
                {items.map((it, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-600">
                        Item #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={items.length <= 1}
                        className="text-slate-400 hover:text-rose-600 disabled:opacity-20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Part Number (MPN) *"
                        value={it.partNumber}
                        onChange={(e) => handleItemChange(idx, "partNumber", e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Part Name *"
                        value={it.partName}
                        onChange={(e) => handleItemChange(idx, "partName", e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={it.quantity}
                        onChange={(e) =>
                          handleItemChange(idx, "quantity", parseInt(e.target.value, 10) || 1)
                        }
                        className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-center"
                      />
                      <input
                        type="number"
                        placeholder="Unit Price (₹)"
                        value={it.estimatedUnitPrice}
                        onChange={(e) => handleItemChange(idx, "estimatedUnitPrice", e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-right font-mono"
                      />
                      <label className="px-2 py-1 text-[11px] bg-white border border-slate-200 rounded-lg flex items-center justify-center cursor-pointer text-blue-600 font-semibold truncate">
                        {it.datasheetFileName || (uploadingIndex === idx ? "Uploading..." : "PDF Spec")}
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg"
                          onChange={(e) => handleDatasheetUpload(idx, e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= STEP 3: REVIEW ================= */}
          {step === 3 && (
            <div className="space-y-4 text-xs">
              <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-2xl space-y-2">
                <div className="font-extrabold text-sm text-blue-900">
                  Request Summary Review
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    Project: <strong>{project === "Other (Custom Project)" ? customProject : project}</strong>
                  </div>
                  <div>
                    Type: <strong>{requestType === "BOM_PARTS" ? "BOM Parts" : "Tool / Equipment"}</strong>
                  </div>
                  <div>
                    Priority: <span className="font-bold text-rose-600">{priority}</span>
                  </div>
                  <div>
                    Required By: <strong>{requiredBy}</strong>
                  </div>
                </div>
                <div className="pt-2 border-t border-blue-200 flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-600">Total Estimated Cost:</span>
                  <span className="font-bold text-slate-900 text-base font-mono">
                    ₹{totalCost.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-600 space-y-1">
                <div className="font-bold text-slate-800">SOP Approval Routing Rule:</div>
                {requestType === "BOM_PARTS" ? (
                  <p>
                    &bull; Routes to <strong>Three-Tier Review</strong>: Technical verification by{" "}
                    <strong>Mr. Jaydeep Panchal</strong> &amp; Cost review by <strong>Business Team</strong>.
                  </p>
                ) : totalCost <= 2000 ? (
                  <p>
                    &bull; Price &le; ₹2,000 &rarr; Auto-routed to <strong>Mr. Abhishek</strong>.
                  </p>
                ) : totalCost <= 5000 ? (
                  <p>
                    &bull; Price &le; ₹5,000 &rarr; Auto-routed to <strong>Mr. Jaydeep Panchal (R&amp;D Head)</strong>.
                  </p>
                ) : (
                  <p>
                    &bull; Price &gt; ₹5,000 &rarr; Auto-routed to <strong>Mr. Amol Bhardwaj (CTO)</strong>.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>

          {step === 1 && (
            <button
              type="button"
              onClick={handleNextFromStep1}
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#1254D8] hover:bg-blue-700 rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              onClick={handleNextFromStep2}
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#1254D8] hover:bg-blue-700 rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <span>Review</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {step === 3 && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? "Submitting..." : "Submit to Phase 2"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
