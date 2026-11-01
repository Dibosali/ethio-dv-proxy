"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  CreditCard,
  Building2,
  Smartphone,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  FileText,
  X,
  AlertTriangle,
  Download,
} from "lucide-react";
import { getPaymentsAuditLogAction } from "@/actions/payment";
import { PaymentStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

interface PaymentAuditRecord {
  id: string;
  agentId: string;
  transactionId: string;
  amount: number;
  bankName: string;
  status: PaymentStatus;
  receiptPhotoUrl: string;
  receiptSignedUrl: string;
  senderName: string;
  submittedAt: string;
  verifiedAt: string | null;
  applicationId: string | null;
  application: {
    id: string;
    entrantName: string;
    isPaid: boolean;
    isFilled: boolean;
  } | null;
  agent: {
    id: string;
    username: string;
    stationaryName: string;
    phoneNumber: string;
  };
}

export const PaymentsLogTable: React.FC = () => {
  const [payments, setPayments] = useState<PaymentAuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [bankFilter, setBankFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [activeReceiptUrl, setActiveReceiptUrl] = useState<string | null>(null);
  const [activeReceiptDetails, setActiveReceiptDetails] = useState<PaymentAuditRecord | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPaymentsAuditLogAction();
      if (res.success && res.payments) {
        setPayments(res.payments as PaymentAuditRecord[]);
      } else {
        setError(res.error || "Failed to load payment logs");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to communicate with database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Format timestamps beautifully with native Intl.DateTimeFormat
  const formatDateTime = (dateString: string | null | undefined): string => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "—";

      const formatter = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      return formatter.format(date);
    } catch {
      return String(dateString);
    }
  };

  // Filter payments
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.agent.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (payment.application?.entrantName || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBank =
      bankFilter === "ALL" || payment.bankName.toUpperCase() === bankFilter;

    const matchesStatus =
      statusFilter === "ALL" || payment.status === statusFilter;

    return matchesSearch && matchesBank && matchesStatus;
  });

  const totalVerified = payments.filter((p) => p.status === PaymentStatus.VERIFIED).length;
  const totalFailed = payments.filter((p) => p.status === PaymentStatus.FAILED).length;
  const totalRevenue = payments
    .filter((p) => p.status === PaymentStatus.VERIFIED)
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-4">
      {/* Top Controls & Metrics */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Payment Verification Audit Log
              </h3>
              <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                የክፍያ ኦዲት መዝገብ
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Strict audit trail of all stationary payment submissions, bank confirmation IDs, and Backblaze receipts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => startTransition(() => fetchPayments())}
              disabled={loading || isPending}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", (loading || isPending) && "animate-spin")} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Audit Highlights Mini-Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-200/60 dark:border-slate-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                Verified Transactions
              </p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {totalVerified} <span className="text-xs font-normal text-slate-400">({totalRevenue.toLocaleString()} ETB)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-200/60 dark:border-slate-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/15 text-red-600 dark:text-red-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                Failed Attempts
              </p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                {totalFailed}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-200/60 dark:border-slate-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                Total Audit Entries
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {payments.length}
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Stationary, Transaction ID, or Entrant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Bank Filter */}
            <select
              value={bankFilter}
              onChange={(e) => setBankFilter(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">All Banks</option>
              <option value="CBE">CBE (ንግድ ባንክ)</option>
              <option value="TELEBIRR">Telebirr (ቴሌብር)</option>
              <option value="BOA">BOA (አቢሲኒያ)</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFIED">Verified</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-500" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Loading payment audit trail from Neon PostgreSQL...
            </p>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-2">
            <AlertTriangle className="h-8 w-8 mx-auto text-amber-500" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {error}
            </p>
            <button
              onClick={fetchPayments}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500"
            >
              Retry
            </button>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileText className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No Payment Records Found
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              When stationary agents verify payments, audit logs and timestamps will populate here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/70 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Sender (Stationary)
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Bank & Channel
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Transaction ID
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Amount
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Submitted At
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Verified At
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Receipt Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredPayments.map((p) => {
                  const isVerified = p.status === PaymentStatus.VERIFIED;
                  const isFailed = p.status === PaymentStatus.FAILED;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Sender / Stationary Name - SPECIFICALLY HIGHLIGHTED */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-xs shrink-0">
                            {p.senderName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50/60 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800/60 text-xs tracking-tight">
                              {p.senderName}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              @{p.agent.username}
                              {p.agent.phoneNumber && ` • ${p.agent.phoneNumber}`}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Bank & Channel */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {p.bankName.toUpperCase() === "CBE" ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                              <Building2 className="h-3 w-3" />
                              CBE
                            </span>
                          ) : p.bankName.toUpperCase() === "TELEBIRR" ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 text-[11px] font-bold text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800/50">
                              <Smartphone className="h-3 w-3" />
                              Telebirr
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 text-[11px] font-bold text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800/50">
                              <CreditCard className="h-3 w-3" />
                              BOA
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Transaction ID - SPECIFICALLY HIGHLIGHTED */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 tracking-wider">
                          {p.transactionId}
                        </span>
                        {p.application && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate max-w-[140px]">
                            App: {p.application.entrantName}
                          </div>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                        {p.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}{" "}
                        <span className="text-[10px] text-slate-400 font-normal">
                          ETB
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            VERIFIED
                          </span>
                        ) : isFailed ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-950/60 px-2.5 py-0.5 text-[11px] font-bold text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800">
                            <XCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
                            FAILED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                            PENDING
                          </span>
                        )}
                      </td>

                      {/* Submitted At Timestamp (Intl formatted) */}
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {formatDateTime(p.submittedAt)}
                      </td>

                      {/* Verified At Timestamp (Intl formatted) */}
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px]">
                        {p.verifiedAt ? (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {formatDateTime(p.verifiedAt)}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not Verified</span>
                        )}
                      </td>

                      {/* Receipt Action Button */}
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        {p.receiptPhotoUrl ? (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveReceiptUrl(p.receiptSignedUrl || p.receiptPhotoUrl);
                              setActiveReceiptDetails(p);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 transition-colors shadow-xs"
                          >
                            <Eye className="h-3.5 w-3.5 text-blue-500" />
                            <span>View Receipt</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">
                            No photo
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Backblaze Receipt Lightbox Modal */}
      {activeReceiptUrl && activeReceiptDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn"
          onClick={() => {
            setActiveReceiptUrl(null);
            setActiveReceiptDetails(null);
          }}
        >
          <div
            className="relative max-w-2xl w-full max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Backblaze B2 Receipt Audit Photo
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {activeReceiptDetails.transactionId} • {activeReceiptDetails.senderName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {activeReceiptUrl && (
                  <a
                    href={activeReceiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="Open Full Image in New Tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setActiveReceiptUrl(null);
                    setActiveReceiptDetails(null);
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Receipt Image */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/80 min-h-[300px]">
              <img
                src={activeReceiptUrl}
                alt={`Receipt for ${activeReceiptDetails.transactionId}`}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-lg shadow-lg border border-slate-800"
                onError={(e) => {
                  // Fallback for simulated or expired keys
                  (e.target as HTMLElement).style.display = "none";
                  const fallbackDiv = document.getElementById("receipt-fallback-box");
                  if (fallbackDiv) fallbackDiv.style.display = "block";
                }}
              />
              <div
                id="receipt-fallback-box"
                style={{ display: "none" }}
                className="text-center p-8 space-y-2 text-slate-300"
              >
                <FileText className="h-12 w-12 mx-auto text-slate-500" />
                <p className="text-sm font-bold">Secure B2 Stored Object</p>
                <p className="text-xs text-slate-400 font-mono">
                  {activeReceiptDetails.receiptPhotoUrl}
                </p>
                <p className="text-[11px] text-slate-500">
                  Pre-signed access token active for session audit.
                </p>
              </div>
            </div>

            {/* Modal Footer Audit Metadata */}
            <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-5 py-3 text-xs flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Stationary: </span>
                <span className="font-extrabold text-blue-600 dark:text-blue-400">
                  {activeReceiptDetails.senderName}
                </span>
                <span className="mx-2 text-slate-300">•</span>
                <span className="text-slate-500 dark:text-slate-400">Bank: </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {activeReceiptDetails.bankName}
                </span>
              </div>

              <div>
                <span className="text-slate-500 dark:text-slate-400">Submitted: </span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {formatDateTime(activeReceiptDetails.submittedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
