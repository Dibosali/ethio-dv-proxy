"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import {
  CreditCard,
  Building2,
  Smartphone,
  Copy,
  Check,
  Search,
  Calendar,
  CheckCircle2,
  Eye,
  Store,
  FileText,
  DollarSign,
  Printer,
  Download,
  Filter,
  Image as ImageIcon,
  X,
  FileUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UploadDvPdfModal } from "./UploadDvPdfModal";
import { SubmissionSummary } from "@/types/admin";

export const PaidSubmissionsLog: React.FC<{ className?: string }> = ({
  className,
}) => {
  const { submissions, paymentSettings } = useAdmin();
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<"ALL" | "CBE" | "TELEBIRR">("ALL");
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);
  const [uploadingSubmission, setUploadingSubmission] = useState<SubmissionSummary | null>(null);

  const fee = paymentSettings.feePerForm || 200;

  // Filter only paid submissions
  const paidSubmissions = useMemo(() => {
    return submissions.filter((s) => s.isPaid);
  }, [submissions]);

  const filtered = useMemo(() => {
    return paidSubmissions.filter((item) => {
      const matchSearch =
        search === "" ||
        item.applicantName.toLowerCase().includes(search.toLowerCase()) ||
        item.stationaryName.toLowerCase().includes(search.toLowerCase()) ||
        item.confirmationNumber.toLowerCase().includes(search.toLowerCase()) ||
        (item.paymentReference &&
          item.paymentReference.toLowerCase().includes(search.toLowerCase()));

      const matchChannel =
        channelFilter === "ALL" ||
        (item.paymentMethod && item.paymentMethod.toUpperCase() === channelFilter) ||
        (!item.paymentMethod && channelFilter === "CBE");

      return matchSearch && matchChannel;
    });
  }, [paidSubmissions, search, channelFilter]);

  const totalRevenue = paidSubmissions.reduce(
    (acc, curr) => acc + (curr.paymentAmount || fee),
    0
  );

  const handleCopyRef = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(text);
    setTimeout(() => setCopiedRef(null), 2500);
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "Recorded";
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
    <div className={cn("space-y-5 animate-fadeIn", className)}>
      {/* Top Audit Banner */}
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-50/70 via-white to-blue-50/40 dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900/90 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Financial Settlement Ledger</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Paid Submissions Log
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit log of fees settled by proxy stationaries via CBE and Telebirr
            </p>
          </div>

          {/* Revenue Pill */}
          <div className="rounded-2xl border border-emerald-500/30 bg-white dark:bg-slate-950 p-4 shadow-sm text-right shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Settled Revenue
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {totalRevenue.toLocaleString()}{" "}
              <span className="text-sm font-bold text-slate-500">ETB</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {paidSubmissions.length} paid applications reconciled
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by entrant, stationary, confirmation #, or TxID..."
            className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Method Filters */}
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 text-xs">
            <button
              type="button"
              onClick={() => setChannelFilter("ALL")}
              className={cn(
                "rounded-lg px-2.5 py-1 font-semibold transition-colors",
                channelFilter === "ALL"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              All ({paidSubmissions.length})
            </button>
            <button
              type="button"
              onClick={() => setChannelFilter("CBE")}
              className={cn(
                "rounded-lg px-2.5 py-1 font-semibold transition-colors flex items-center gap-1",
                channelFilter === "CBE"
                  ? "bg-purple-600 text-white"
                  : "text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30"
              )}
            >
              <Building2 className="h-3 w-3" />
              <span>CBE</span>
            </button>
            <button
              type="button"
              onClick={() => setChannelFilter("TELEBIRR")}
              className={cn(
                "rounded-lg px-2.5 py-1 font-semibold transition-colors flex items-center gap-1",
                channelFilter === "TELEBIRR"
                  ? "bg-emerald-600 text-white"
                  : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              )}
            >
              <Smartphone className="h-3 w-3" />
              <span>Telebirr</span>
            </button>
          </div>
        </div>
      </div>

      {/* Paid Applications Log Table */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-2">
          <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No paid submissions found
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {search ? "No records matched your search filter." : "No paid submissions recorded yet."}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Applicant Name</th>
                  <th className="px-4 py-3">Stationary Shop</th>
                  <th className="px-4 py-3">Confirmation #</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3">Transfer Ref / TxID</th>
                  <th className="px-4 py-3">Settlement Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filtered.map((item) => {
                  const method = item.paymentMethod || "CBE";
                  const refCode = item.paymentReference || `FT26105${item.id.slice(-5).toUpperCase()}`;
                  const isCopied = copiedRef === refCode;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Entrant Name */}
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-900 dark:text-white uppercase">
                          {item.applicantName}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {item.id}
                        </span>
                      </td>

                      {/* Stationary */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Store className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {item.stationaryName}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          @{item.agentUsername}
                        </span>
                      </td>

                      {/* Confirmation Number */}
                      <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400 select-all">
                        {item.confirmationNumber}
                      </td>

                      {/* Payment Method */}
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border",
                            method === "TELEBIRR"
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                              : "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30"
                          )}
                        >
                          {method === "TELEBIRR" ? (
                            <Smartphone className="h-2.5 w-2.5" />
                          ) : (
                            <Building2 className="h-2.5 w-2.5" />
                          )}
                          <span>{method}</span>
                        </span>
                      </td>

                      {/* Reference / TxID */}
                      <td className="px-4 py-3 font-mono text-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold select-all text-xs">{refCode}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyRef(refCode)}
                            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            title="Copy reference code"
                          >
                            {isCopied ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Settlement Date */}
                      <td className="px-4 py-3 text-[11px] text-slate-500 dark:text-slate-400">
                        {formatDate(item.paidAt || item.submittedAt)}
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                        +{item.paymentAmount || fee} ETB
                      </td>

                      {/* Actions & Attached Receipt & DV PDF Upload */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {item.dvPdfUrl ? (
                            <button
                              type="button"
                              onClick={() => setUploadingSubmission(item)}
                              className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors cursor-pointer"
                              title="Official DV PDF uploaded. Click to inspect or replace."
                            >
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                              <span>DV PDF ✓</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setUploadingSubmission(item)}
                              className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-2.5 py-1 text-[11px] font-bold shadow-xs hover:from-indigo-500 hover:to-blue-500 transition-all cursor-pointer animate-pulse"
                              title="Payment confirmed! Prompt: Upload the official DV confirmation PDF."
                            >
                              <FileUp className="h-3 w-3" />
                              <span>Upload DV PDF</span>
                            </button>
                          )}

                          {item.receiptUrl && (
                            <button
                              type="button"
                              onClick={() => setViewingReceipt(item.receiptUrl || null)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                              title="View Attached Receipt Proof"
                            >
                              <ImageIcon className="h-3 w-3 text-emerald-500" />
                              <span>Receipt</span>
                            </button>
                          )}
                          <Link
                            href={`/admin/submissions/${item.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 transition-colors shadow-2xs"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Details</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Super Admin Receipt Image Lightbox */}
      {viewingReceipt && (
        <div
          onClick={() => setViewingReceipt(null)}
          className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4 animate-fadeIn cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 p-2">
            <button
              type="button"
              onClick={() => setViewingReceipt(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/70 text-white hover:bg-black transition-colors cursor-pointer z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={viewingReceipt}
              alt="Payment Receipt Document"
              className="max-h-[85vh] w-auto object-contain mx-auto rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Official DV PDF Upload Modal */}
      <UploadDvPdfModal
        submission={uploadingSubmission}
        isOpen={!!uploadingSubmission}
        onClose={() => setUploadingSubmission(null)}
      />
    </div>
  );
};
