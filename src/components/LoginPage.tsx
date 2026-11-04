"use client";

import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Building2,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  FileText,
  UserCheck,
} from "lucide-react";
import { SessionUser } from "@/lib/types";

interface LoginPageProps {
  onLoginSuccess: (user: SessionUser) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("abhishek.saini@walnutmedical.com");
  const [password, setPassword] = useState("Walnut@2026");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const quickPersonas = [
    {
      name: "Abhishek Saini",
      email: "abhishek.saini@walnutmedical.com",
      role: "Requester (R&D Lead)",
      badge: "bg-blue-100 text-blue-700",
    },
    {
      name: "Mr. Abhishek",
      email: "abhishek@walnutmedical.com",
      role: "Approver Tier 1 (<= 2k)",
      badge: "bg-amber-100 text-amber-800",
    },
    {
      name: "Mr. Jaydeep Panchal",
      email: "jaydeep.panchal@walnutmedical.com",
      role: "R&D Head (Tier 2 & Tech)",
      badge: "bg-purple-100 text-purple-700",
    },
    {
      name: "Mr. Amol Bhardwaj",
      email: "amol.bhardwaj@walnutmedical.com",
      role: "CTO (Tier 3 > 5k)",
      badge: "bg-rose-100 text-rose-700",
    },
    {
      name: "Pooja Sharma",
      email: "business.procurement@walnutmedical.com",
      role: "Business / Sourcing",
      badge: "bg-emerald-100 text-emerald-700",
    },
    {
      name: "Harpreet Singh",
      email: "store.qa@walnutmedical.com",
      role: "Store / Inward QA",
      badge: "bg-cyan-100 text-cyan-700",
    },
    {
      name: "Walnut Admin",
      email: "admin@walnutmedical.com",
      role: "System Admin",
      badge: "bg-slate-100 text-slate-700",
    },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMessage(data.error || "Login failed. Check your credentials.");
      } else if (data.user) {
        onLoginSuccess(data.user);
      }
    } catch (err: any) {
      setErrorMessage("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (personaEmail: string) => {
    setEmail(personaEmail);
    setPassword("Walnut@2026");
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Hero Pane (5 Cols on large) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0B44BA] via-[#1254D8] to-[#1E3A8A] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Branding */}
          <div className="relative z-10 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-md">
                <svg className="w-6 h-6 text-white" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M6 10L11 26L16 14L21 26L26 14L30 26"
                    stroke="#FFFFFF"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="11" cy="9" r="2.5" fill="#FFFFFF" />
                  <circle cx="21" cy="9" r="2.5" fill="#FFFFFF" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center">
                  <span>Walnut Medical</span>
                  <span className="text-[10px] text-blue-200 font-normal ml-0.5">&reg;</span>
                </h1>
                <p className="text-xs text-blue-200 font-medium">R&amp;D Procurement Portal</p>
              </div>
            </div>

            <div className="inline-block bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono font-semibold text-blue-100 border border-white/15">
              DOC. NO. WMPL-QAS-025-01A &bull; REV 00
            </div>
          </div>

          {/* Mid Section: SOP Process Highlights */}
          <div className="relative z-10 py-6 space-y-4">
            <h2 className="text-sm font-extrabold text-white tracking-wide uppercase">
              Standard Operating Procedure
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-start space-x-3 bg-white/5 p-2.5 rounded-xl border border-white/10">
                <div className="w-5 h-5 rounded-full bg-blue-400/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-blue-300 font-bold text-[11px]">1</span>
                </div>
                <div>
                  <div className="font-bold text-white">Phase 1 &amp; 2: Request &amp; Approvals</div>
                  <div className="text-[11px] text-blue-200">
                    BOM / Tool templates with multi-tier price threshold routing.
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white/5 p-2.5 rounded-xl border border-white/10">
                <div className="w-5 h-5 rounded-full bg-emerald-400/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-emerald-300 font-bold text-[11px]">3</span>
                </div>
                <div>
                  <div className="font-bold text-white">Phase 3: Sourcing &amp; PO Issuance</div>
                  <div className="text-[11px] text-blue-200">
                    Cost check, lead time analysis &amp; alternate part validation.
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white/5 p-2.5 rounded-xl border border-white/10">
                <div className="w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-amber-300 font-bold text-[11px]">4</span>
                </div>
                <div>
                  <div className="font-bold text-white">Phase 4 &amp; 5: Tracking &amp; Feedback</div>
                  <div className="text-[11px] text-blue-200">
                    Live courier tracking, EDD &le; 7 days alert &amp; QA sign-off.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer Info */}
          <div className="relative z-10 pt-4 border-t border-white/15 text-[10px] text-blue-200 flex items-center justify-between">
            <span>Mohali Unit &ndash; 160055</span>
            <span>ISO 13485 Certified</span>
          </div>
        </div>

        {/* Right Form Pane (7 Cols on large) */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between">
          <div className="max-w-md w-full mx-auto space-y-6">
            {/* Form Title */}
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Sign in to your account
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your Walnut Medical credentials to access the R&amp;D portal.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-300 text-rose-800 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in duration-100">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email / ID Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address / Employee ID
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="name@walnutmedical.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#F8FAFC] border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#1254D8]/20 focus:border-[#1254D8] font-medium transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <span className="text-[11px] text-blue-600 font-semibold cursor-pointer hover:underline">
                    Forgot password?
                  </span>
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-[#F8FAFC] border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#1254D8]/20 focus:border-[#1254D8] font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded-sm border-slate-300 text-[#1254D8] focus:ring-[#1254D8]"
                  />
                  <span className="font-medium">Remember me for 7 days</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">Default: Walnut@2026</span>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#1254D8] hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                <span>{loading ? "Authenticating..." : "Sign In to Portal"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Switcher */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                  Quick Account Switcher (1-Click)
                </span>
                <span className="text-[10px] text-slate-400">Select to auto-fill</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickPersonas.map((p) => (
                  <button
                    key={p.email}
                    type="button"
                    onClick={() => handleQuickSelect(p.email)}
                    className={`text-left p-2 rounded-xl border text-xs transition-all flex items-center justify-between hover:border-blue-400 hover:shadow-2xs ${
                      email === p.email
                        ? "bg-blue-50/70 border-blue-400 ring-1 ring-blue-400"
                        : "bg-slate-50/70 border-slate-200/80 text-slate-700"
                    }`}
                  >
                    <div className="truncate pr-1">
                      <div className="font-bold text-slate-900 truncate text-[11px]">{p.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{p.role}</div>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md shrink-0 ${p.badge}`}>
                      Auto
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Security Disclaimer */}
          <div className="text-center text-[10px] text-slate-400 pt-6">
            Walnut Medical Portal &bull; Enterprise Single Sign-On Ready &bull; SOP WMPL-QAS-025-01A
          </div>
        </div>
      </div>
    </div>
  );
}

