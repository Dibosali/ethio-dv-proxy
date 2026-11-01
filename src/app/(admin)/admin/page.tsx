"use client";

import React from "react";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import { SubmissionsTable } from "@/components/admin/SubmissionsTable";
import { AgentList } from "@/components/admin/AgentList";
import { PaymentsLogTable } from "@/components/admin/PaymentsLogTable";
import {
  Users,
  Store,
  FileCheck2,
  KeyRound,
  Shield,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Clock,
  Layers,
  CheckCircle2,
  Bell,
  Eye,
  CreditCard,
  Building2,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { agents, submissions } = useAdmin();

  const totalActive = agents.filter((a) => a.isActive).length;
  const totalSubmissions = submissions.length;
  const totalPaid = submissions.filter((s) => s.isPaid).length;
  const totalFilled = submissions.filter((s) => s.isFilled).length;
  const paidPercent =
    totalSubmissions > 0 ? Math.round((totalPaid / totalSubmissions) * 100) : 0;
  const filledPercent =
    totalSubmissions > 0 ? Math.round((totalFilled / totalSubmissions) * 100) : 0;

  return (
    <div className="space-y-6 sm:space-y-7 animate-fadeIn">
      {/* Top Banner - Clean & Clutter-Free */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50 to-blue-50/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-blue-950/40 p-5 sm:p-6 shadow-sm dark:shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1 max-w-2xl">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              DV Dashboard Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Live operational metrics, proxy stationery performance, and entrant submission status tracking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin/agents"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:from-blue-500 hover:to-indigo-500 transition-all"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Create Agent</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <Link
              href="/admin/submissions"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm"
            >
              <FileCheck2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Stationary Channels</span>
            </Link>
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid - Operational Analytics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Registered Stationaries */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Stationaries
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Store className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {agents.length}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {totalActive} Active
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Partner proxy stations
          </p>
        </div>

        {/* Card 2: Total Submissions */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Entries
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <FileCheck2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalSubmissions}
            </span>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
              In Registry
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Neon cloud database
          </p>
        </div>

        {/* Card 3: Paid Submissions Analytics */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Paid Submissions
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {totalPaid}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              / {totalSubmissions} ({paidPercent}%)
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            {totalSubmissions - totalPaid} unpaid pending
          </p>
        </div>

        {/* Card 4: Filled Forms Analytics */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Filled Forms
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600/15 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {totalFilled}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              / {totalSubmissions} ({filledPercent}%)
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            {totalSubmissions - totalFilled} awaiting filling
          </p>
        </div>
      </div>

      {/* PRIMARY SECTION: Submissions Data Table */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                All Submitted DV Forms
              </h2>
              <span className="rounded-lg bg-blue-500/10 px-2 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                የማመልከቻዎች ዝርዝር
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Filter by stationery, search applicants, toggle Paid/Filled status, and inspect confirmation numbers.
            </p>
          </div>

          <Link
            href="/admin/submissions"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500"
          >
            <span>Open Stationary Channels View</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Submissions Table Component */}
        <SubmissionsTable />
      </div>

      {/* BANK PAYMENTS AUDIT TRAIL LOG */}
      <div className="space-y-3.5 pt-4 border-t border-slate-200 dark:border-slate-800">
        <PaymentsLogTable />
      </div>

      {/* SECONDARY SECTION: Active Proxy Stations Directory */}
      <div className="space-y-3.5 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Active Proxy Stations Directory
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click <strong>Copy</strong> or <strong>WhatsApp</strong> to securely dispatch credentials to stationery operators.
            </p>
          </div>

          <Link
            href="/admin/agents"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500"
          >
            <span>Open Agent Provisioning Wizard</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <AgentList />
      </div>
    </div>
  );
}
