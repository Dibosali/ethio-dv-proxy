"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useAdmin } from "@/context/AdminContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { EthioDvLogo } from "@/components/ui/EthioDvLogo";
import { UserProfileBadge } from "@/components/ui/UserProfileBadge";
import { StationaryPaymentModal } from "@/components/analytics/StationaryPaymentModal";
import { SubmissionSummary } from "@/types/admin";
import { downloadDvConfirmationSlip, downloadOfficialDvPdf } from "@/lib/utils/dvSlip";
import {
  Store,
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  CreditCard,
  QrCode,
  DollarSign,
  ArrowLeft,
  LogOut,
  Send,
  Calendar,
  Sparkles,
  Phone,
  Building2,
  Lock,
  ArrowRight,
  Clock,
  ExternalLink,
  Receipt,
  Eye,
  Layers,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StationeryAnalyticsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const {
    submissions,
    paymentSettings,
    getStationarySubmissions,
    getStationaryStats,
  } = useAdmin();

  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"unpaid" | "paid" | "all">("unpaid");
  const [payingSubmission, setPayingSubmission] = useState<SubmissionSummary | null>(null);

  // Guard: unauthenticated redirects to login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/analytics");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 rounded-full border-3 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Loading Stationery Analytics & Billing...
          </p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const stationaryIdentifier =
    session.user.stationaryName || session.user.username || "Bole Star";
  const mySubmissions = getStationarySubmissions(stationaryIdentifier);
  const stats = getStationaryStats(stationaryIdentifier);

  // List of filled forms that are NOT paid
  const unpaidFilledForms = mySubmissions.filter(
    (s) => s.isFilled && !s.isPaid
  );

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 sticky top-0 z-30 shadow-xs backdrop-blur-md transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* Left: Brand + Link to Form */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Entrant Form</span>
            </Link>

            <div className="hidden sm:block h-4 w-px bg-slate-200 dark:bg-slate-800" />

            <div className="hidden sm:flex items-center gap-2.5">
              <EthioDvLogo size="xs" />
              <div>
                <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  Stationary Analytics & Settlement Portal
                </h1>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Billing reconciliation, filled status, and CBE / Telebirr settlement
                </p>
              </div>
            </div>
          </div>

          {/* Right: Profile, Theme Toggle, Sign Out */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Stationery Profile Interactive Badge */}
            <UserProfileBadge variant="stationary" />

            <ThemeToggle variant="header" />

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 dark:hover:border-rose-900/50 transition-colors shadow-2xs cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-7">
        {/* Top Shop Banner */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50 to-blue-50/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-blue-950/40 p-5 sm:p-7 shadow-sm dark:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-500/25">
              <Store className="h-3.5 w-3.5" />
              <span>Official Registered Proxy Terminal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {session.user.stationaryName || "Stationary Shop Terminal"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Account Terminal: <strong className="text-slate-700 dark:text-slate-300 font-mono">@{session.user.username}</strong> • Official Rate: <strong className="text-blue-600 dark:text-blue-400 font-mono">{paymentSettings.feePerForm} {paymentSettings.currency}</strong> per filled form.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/25 hover:from-blue-500 hover:to-indigo-500 transition-all"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Submit New Entrant Form</span>
            </Link>
          </div>
        </div>

        {/* Analytics KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Card 1: Total Forms Sent */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Forms Sent
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600/15 text-blue-600 dark:text-blue-400">
                <Send className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {stats.totalSent}
              </span>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                Submitted
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Entrants processed through terminal
            </p>
          </div>

          {/* Card 2: Total Filled Forms */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Filled Forms
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600/15 text-indigo-600 dark:text-indigo-400">
                <FileCheck2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {stats.totalFilled}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                / {stats.totalSent} entries
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Completed by submission agents
            </p>
          </div>

          {/* Card 3: Filled But Unpaid Forms */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Unpaid Filled Forms
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                {stats.filledUnpaid}
              </span>
              <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold">
                Pending Settlement
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Awaiting payment transfer
            </p>
          </div>

          {/* Card 4: Total Amount Owed */}
          <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-gradient-to-br from-rose-50/50 to-white dark:from-rose-950/20 dark:to-slate-900/90 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                Total Amount Owed
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">
                {stats.amountOwed.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-rose-700 dark:text-rose-400">
                {paymentSettings.currency}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              {stats.filledUnpaid} forms × {paymentSettings.feePerForm} {paymentSettings.currency}
            </p>
          </div>
        </div>

        {/* SECTION 1: Stationary Submissions & Settlement Management */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Shop Submissions & Settlement
                </h3>
                <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-400 border border-blue-500/30">
                  {mySubmissions.length} Total Entries
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Review submitted entrant forms, track filing progress, pay pending fees, and access official payment receipts.
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab("unpaid")}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  activeTab === "unpaid"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Pending Pay</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {unpaidFilledForms.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("paid")}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  activeTab === "paid"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Paid Submissions</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {mySubmissions.filter((s) => s.isPaid).length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  activeTab === "all"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>All Submissions</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {mySubmissions.length}
                </span>
              </button>
            </div>
          </div>

          {/* TAB 1: Unpaid Filled Forms */}
          {activeTab === "unpaid" && (
            <div>
              {unpaidFilledForms.length === 0 ? (
                <div className="rounded-3xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-8 text-center space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto">
                    <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      All Filled Forms Settled & Paid!
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                      You have 0 outstanding payment balance for {session.user.stationaryName}. All filled entries are in good standing.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <tr>
                          <th className="px-4 py-3">Applicant Name</th>
                          <th className="px-4 py-3">Confirmation #</th>
                          <th className="px-4 py-3">Submission Date</th>
                          <th className="px-4 py-3">Filing Status</th>
                          <th className="px-4 py-3">Payment</th>
                          <th className="px-4 py-3 text-right">Fee</th>
                          <th className="px-4 py-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {unpaidFilledForms.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <p className="font-bold text-slate-900 dark:text-white uppercase">
                                {item.applicantName}
                              </p>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ID: {item.id}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400 select-all">
                              {item.confirmationNumber}
                            </td>
                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                              {formatDate(item.submittedAt)}
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 dark:text-blue-400 border border-blue-500/30">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Filled ✓</span>
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                <AlertCircle className="h-3 w-3" />
                                <span>Unpaid</span>
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                              {paymentSettings.feePerForm} {paymentSettings.currency}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => setPayingSubmission(item)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-xs shadow-emerald-600/20 transition-all cursor-pointer"
                              >
                                <CreditCard className="h-3.5 w-3.5" />
                                <span>Pay Now</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="border-t-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 font-bold text-xs">
                        <tr>
                          <td colSpan={5} className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                            Total Outstanding for {unpaidFilledForms.length} Unpaid Forms:
                          </td>
                          <td className="px-4 py-3 text-right text-rose-600 dark:text-rose-400 font-mono text-sm">
                            {stats.amountOwed.toLocaleString()} {paymentSettings.currency}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                              Direct Settlement
                            </span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Paid Submissions */}
          {activeTab === "paid" && (
            <div>
              {mySubmissions.filter((s) => s.isPaid).length === 0 ? (
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-8 text-center space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto">
                    <Receipt className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      No Paid Submissions Yet
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      When you transfer payment for filled forms, your verified receipts and payment confirmations will appear here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <tr>
                          <th className="px-4 py-3">Applicant Name</th>
                          <th className="px-4 py-3">Confirmation #</th>
                          <th className="px-4 py-3">Payment Channel</th>
                          <th className="px-4 py-3">Reference / TxID</th>
                          <th className="px-4 py-3">Paid Date</th>
                          <th className="px-4 py-3 text-right">Amount</th>
                          <th className="px-4 py-3 text-center">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {mySubmissions
                          .filter((s) => s.isPaid)
                          .map((item) => (
                            <tr
                              key={item.id}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                              <td className="px-4 py-3">
                                <p className="font-bold text-slate-900 dark:text-white uppercase">
                                  {item.applicantName}
                                </p>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  ID: {item.id}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400 select-all">
                                {item.confirmationNumber}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border",
                                    item.paymentMethod === "TELEBIRR"
                                      ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25"
                                      : "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25"
                                  )}
                                >
                                  {item.paymentMethod === "TELEBIRR" ? "Telebirr" : "CBE Bank"}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-mono font-bold text-slate-700 dark:text-slate-300 select-all">
                                {item.paymentReference || "CONFIRMED"}
                              </td>
                              <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                {item.paidAt ? formatDate(item.paidAt) : formatDate(item.submittedAt)}
                              </td>
                              <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                {(item.paymentAmount || paymentSettings.feePerForm).toLocaleString()}{" "}
                                {paymentSettings.currency}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (item.dvPdfUrl) {
                                        downloadOfficialDvPdf(
                                          item.dvPdfUrl,
                                          item.applicantFirstName,
                                          item.applicantLastName,
                                          item.confirmationNumber
                                        );
                                      } else {
                                        downloadDvConfirmationSlip(item);
                                      }
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                                    title="Download official DV Confirmation Document"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                    <span>{item.dvPdfUrl ? "Download DV (PDF)" : "Download DV"}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setPayingSubmission(item)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                                    title="View Payment Receipt Proof"
                                  >
                                    <Receipt className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>Receipt</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: All Sent Submissions */}
          {activeTab === "all" && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Applicant Name</th>
                      <th className="px-4 py-3">Confirmation #</th>
                      <th className="px-4 py-3">Submission Date</th>
                      <th className="px-4 py-3">Filing Status</th>
                      <th className="px-4 py-3">Payment</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {mySubmissions.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900 dark:text-white uppercase">
                            {item.applicantName}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: {item.id}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400 select-all">
                          {item.confirmationNumber}
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                          {formatDate(item.submittedAt)}
                        </td>
                        <td className="px-4 py-3">
                          {item.isFilled ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 dark:text-blue-400 border border-blue-500/30">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Filled ✓</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                              <Clock className="h-3 w-3" />
                              <span>In Queue</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {item.isPaid ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Paid ✓</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400 border border-amber-500/30">
                              <AlertCircle className="h-3 w-3" />
                              <span>Unpaid</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.isPaid ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  if (item.dvPdfUrl) {
                                    downloadOfficialDvPdf(
                                      item.dvPdfUrl,
                                      item.applicantFirstName,
                                      item.applicantLastName,
                                      item.confirmationNumber
                                    );
                                  } else {
                                    downloadDvConfirmationSlip(item);
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-2xs cursor-pointer"
                                title="Download Official DV Document"
                              >
                                <Download className="h-3 w-3" />
                                <span>{item.dvPdfUrl ? "Download DV (PDF)" : "Download DV"}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setPayingSubmission(item)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                                title="View Receipt Proof"
                              >
                                <Receipt className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                <span>Receipt</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setPayingSubmission(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                            >
                              <CreditCard className="h-3 w-3" />
                              <span>Pay</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal: Stationary Payment Settlement & Official Receipt */}
        <StationaryPaymentModal
          submission={payingSubmission}
          isOpen={!!payingSubmission}
          onClose={() => setPayingSubmission(null)}
        />
      </main>
    </div>
  );
}
