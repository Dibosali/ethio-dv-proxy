"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import { TelegramSubmissionsView } from "@/components/admin/TelegramSubmissionsView";
import { PaidSubmissionsLog } from "@/components/admin/PaidSubmissionsLog";
import { PaymentsLogTable } from "@/components/admin/PaymentsLogTable";
import {
  FileCheck2,
  ArrowLeft,
  Store,
  DollarSign,
  CheckCircle2,
  Layers,
  Receipt,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SubmissionsPage() {
  const { submissions, agents } = useAdmin();
  const [activeTab, setActiveTab] = useState<"channels" | "paid_audit" | "bank_verifier">("channels");

  const paidCount = submissions.filter((s) => s.isPaid).length;
  const filledCount = submissions.filter((s) => s.isFilled).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Stationary Submissions
            </h1>
            <span className="rounded-lg bg-blue-500/10 px-2 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20">
              ማመልከቻዎች
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse submissions grouped by stationary shop with real-time payment and filing status tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard Overview</span>
          </Link>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Submissions
          </span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {submissions.length}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Across all stationery shops
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Stationeries
          </span>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {agents.filter((a) => a.isActive).length}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Active proxy partners
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Paid Submissions
          </span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {paidCount}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            {submissions.length > 0
              ? `${Math.round((paidCount / submissions.length) * 100)}% settlement rate`
              : "0%"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Filled Forms
          </span>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            {filledCount}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            {submissions.length > 0
              ? `${Math.round((filledCount / submissions.length) * 100)}% completed`
              : "0%"}
          </p>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("channels")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer",
            activeTab === "channels"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Stationery Channels (Telegram View)</span>
          <span
            className={cn(
              "px-1.5 py-0.5 text-[10px] rounded-full font-bold",
              activeTab === "channels"
                ? "bg-white/20 text-white"
                : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            )}
          >
            {submissions.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("paid_audit")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer",
            activeTab === "paid_audit"
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/25"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <Receipt className="h-4 w-4" />
          <span>Paid Submissions Audit Log</span>
          <span
            className={cn(
              "px-1.5 py-0.5 text-[10px] rounded-full font-bold",
              activeTab === "paid_audit"
                ? "bg-white/20 text-white"
                : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            )}
          >
            {paidCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("bank_verifier")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer",
            activeTab === "bank_verifier"
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/25"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Bank Verification & B2 Receipts Log</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "channels" ? (
        <TelegramSubmissionsView />
      ) : activeTab === "paid_audit" ? (
        <PaidSubmissionsLog />
      ) : (
        <PaymentsLogTable />
      )}
    </div>
  );
}
