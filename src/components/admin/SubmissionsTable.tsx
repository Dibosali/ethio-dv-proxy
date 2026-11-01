"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import { SubmissionSummary } from "@/types/admin";
import {
  FileCheck2,
  Store,
  Calendar,
  Users,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpDown,
  Check,
  X,
  FileUp,
  Download,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UploadDvPdfModal } from "./UploadDvPdfModal";

export interface SubmissionsTableProps {
  initialStationaryFilter?: string;
  className?: string;
  limit?: number;
}

export const SubmissionsTable: React.FC<SubmissionsTableProps> = ({
  initialStationaryFilter = "ALL",
  className,
  limit,
}) => {
  const {
    submissions,
    agents,
    deleteSubmission,
    toggleSubmissionPaid,
    toggleSubmissionFilled,
  } = useAdmin();

  // Filters state
  const [selectedStationary, setSelectedStationary] = useState<string>(
    initialStationaryFilter
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(
    null
  );
  const [deletedToast, setDeletedToast] = useState<string | null>(null);
  const [uploadingSubmission, setUploadingSubmission] = useState<SubmissionSummary | null>(null);
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);

  const formatReceiptDate = (iso?: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  // Extract unique stationary names for filter dropdown
  const uniqueStationaries = useMemo(() => {
    const set = new Set<string>();
    submissions.forEach((s) => set.add(s.stationaryName));
    agents.forEach((a) => set.add(a.profile.stationaryName));
    return Array.from(set).sort();
  }, [submissions, agents]);

  // Filtered & sorted submissions
  const filteredSubmissions = useMemo(() => {
    let result = [...submissions];

    // Filter by stationary
    if (selectedStationary !== "ALL") {
      result = result.filter((s) => s.stationaryName === selectedStationary);
    }

    // Filter by search query (applicant name or confirmation number)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.applicantName.toLowerCase().includes(q) ||
          s.confirmationNumber.toLowerCase().includes(q) ||
          s.stationaryName.toLowerCase().includes(q)
      );
    }

    // Sort by date
    result.sort((a, b) => {
      const dateA = new Date(a.submittedAt).getTime();
      const dateB = new Date(b.submittedAt).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    if (limit && limit > 0) {
      return result.slice(0, limit);
    }

    return result;
  }, [submissions, selectedStationary, searchQuery, sortOrder, limit]);

  const handleDelete = (id: string, name: string) => {
    deleteSubmission(id);
    setActiveActionMenuId(null);
    setDeletedToast(`Submission for "${name}" was deleted successfully.`);
    setTimeout(() => setDeletedToast(null), 3500);
  };

  const formatSubmissionDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className={cn("space-y-3.5", className)}>
      {/* Toast Notification on Deletion */}
      {deletedToast && (
        <div className="flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/70 p-3 text-xs text-rose-800 dark:text-rose-200 shadow-md animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-rose-500" />
            <span>{deletedToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setDeletedToast(null)}
            className="text-rose-400 hover:text-rose-600 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-3 shadow-sm">
        {/* Stationary Filter Dropdown */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Filter className="h-3.5 w-3.5 text-blue-500" />
            <span>Stationary:</span>
          </div>

          <div className="relative">
            <select
              value={selectedStationary}
              onChange={(e) => setSelectedStationary(e.target.value)}
              className="appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 pr-7 text-xs font-semibold text-slate-800 dark:text-white focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="ALL">All Stationaries ({submissions.length})</option>
              {uniqueStationaries.map((name) => {
                const count = submissions.filter(
                  (s) => s.stationaryName === name
                ).length;
                return (
                  <option key={name} value={name}>
                    {name} ({count})
                  </option>
                );
              })}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400 text-[10px]">
              ▼
            </div>
          </div>

          {selectedStationary !== "ALL" && (
            <button
              type="button"
              onClick={() => setSelectedStationary("ALL")}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Reset
            </button>
          )}
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search applicant or CN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
            }
            className="flex h-8 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Toggle Date Sort Order"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline text-[11px]">
              {sortOrder === "desc" ? "Newest" : "Oldest"}
            </span>
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
            {/* Table Header */}
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 pl-3.5 pr-2 sm:pl-5">Applicant</th>
                <th className="px-2.5 py-3">Stationary</th>
                <th className="px-2.5 py-3">Status Badges</th>
                <th className="px-2.5 py-3">Toggle Actions</th>
                <th className="px-2.5 py-3">Family</th>
                <th className="px-2.5 py-3">Date</th>
                <th className="py-3 pl-2 pr-3.5 text-right sm:pr-5">View</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-xs text-slate-400"
                  >
                    <div className="max-w-xs mx-auto space-y-1.5">
                      <FileCheck2 className="h-7 w-7 mx-auto text-slate-400 dark:text-slate-600 stroke-[1.5]" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        No submissions found
                      </p>
                      <p className="text-[11px] text-slate-500">
                        No submissions match the active filter or search term.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => {
                  const isMenuOpen = activeActionMenuId === sub.id;
                  const isPaid = !!sub.isPaid;
                  const isFilled = !!sub.isFilled;

                  return (
                    <tr
                      key={sub.id}
                      className="group transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                    >
                      {/* Column 1: Applicant Name + Photo Thumbnail + Confirmation Number */}
                      <td className="py-3 pl-3.5 pr-2 sm:pl-5">
                        <div className="flex items-center gap-2.5">
                          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-sm">
                            <img
                              src={sub.photoUrl}
                              alt={sub.applicantName}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 max-w-[170px] sm:max-w-[200px]">
                            <Link
                              href={`/admin/submissions/${sub.id}`}
                              className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors block truncate leading-snug text-xs"
                            >
                              {sub.applicantName}
                            </Link>
                            <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 select-all block truncate">
                              {sub.confirmationNumber}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Stationary Name */}
                      <td className="px-2.5 py-3">
                        <div className="space-y-0.5 max-w-[150px]">
                          <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200 text-xs">
                            <Store className="h-3 w-3 text-blue-500 shrink-0" />
                            <span className="truncate">{sub.stationaryName}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                            @{sub.agentUsername}
                          </p>
                        </div>
                      </td>

                      {/* Column 3: Paid & Filled Status Badges */}
                      <td className="px-2.5 py-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-wrap items-center gap-1">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                <span>Paid</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                                <AlertCircle className="h-2.5 w-2.5" />
                                <span>Unpaid</span>
                              </span>
                            )}

                            {isFilled ? (
                              <span className="inline-flex items-center gap-0.5 rounded-md bg-blue-500/15 border border-blue-500/30 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-400">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                <span>Filled</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                <Clock className="h-2.5 w-2.5" />
                                <span>Unfilled</span>
                              </span>
                            )}
                          </div>

                          {/* Paid settlement date timestamp */}
                          {isPaid && sub.paidAt && (
                            <span
                              className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono flex items-center gap-1 font-semibold"
                              title={`Settled at: ${new Date(sub.paidAt).toLocaleString()}`}
                            >
                              <Calendar className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>{formatReceiptDate(sub.paidAt)}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 4: Toggle Actions (Paid & Filled Buttons), Attached Receipt, & DV PDF Prompt */}
                      <td className="px-2.5 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleSubmissionPaid(sub.id)}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold transition-all border",
                              isPaid
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600"
                            )}
                            title={isPaid ? "Mark as Unpaid" : "Mark as Paid"}
                          >
                            <Check className="h-2.5 w-2.5" />
                            <span>Paid</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleSubmissionFilled(sub.id)}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold transition-all border",
                              isFilled
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600"
                            )}
                            title={isFilled ? "Mark as Unfilled" : "Mark as Filled"}
                          >
                            <FileCheck2 className="h-2.5 w-2.5" />
                            <span>Filled</span>
                          </button>

                          {/* View Uploaded Receipt Screenshot Button */}
                          {isPaid && sub.receiptUrl && (
                            <button
                              type="button"
                              onClick={() => setViewingReceiptUrl(sub.receiptUrl || null)}
                              className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer shadow-2xs"
                              title="Inspect uploaded payment receipt screenshot proof"
                            >
                              <ImageIcon className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                              <span>Receipt</span>
                            </button>
                          )}

                          {/* When form is paid: Prompt Super Admin to upload official DV PDF */}
                          {isPaid && (
                            sub.dvPdfUrl ? (
                              <button
                                type="button"
                                onClick={() => setUploadingSubmission(sub)}
                                className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                                title="Official DV PDF uploaded. Click to inspect or replace."
                              >
                                <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                                <span>DV PDF ✓</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setUploadingSubmission(sub)}
                                className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs hover:from-indigo-500 hover:to-blue-500 transition-all cursor-pointer animate-pulse"
                                title="Form is paid! Click to upload the official government DV confirmation PDF."
                              >
                                <FileUp className="h-2.5 w-2.5" />
                                <span>Upload DV PDF</span>
                              </button>
                            )
                          )}
                        </div>
                      </td>

                      {/* Column 5: Family Composition */}
                      <td className="px-2.5 py-3 text-[11px] text-slate-600 dark:text-slate-300">
                        <div className="space-y-0.5">
                          <span className="truncate block max-w-[110px] text-[10px] font-medium">
                            {sub.maritalStatus}
                          </span>
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            <Users className="h-2.5 w-2.5" />
                            <span>{sub.childrenCount} ch</span>
                          </span>
                        </div>
                      </td>

                      {/* Column 6: Submission Date */}
                      <td className="px-2.5 py-3 text-slate-500 dark:text-slate-400 text-[10px] font-mono">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[110px]">
                            {formatSubmissionDate(sub.submittedAt)}
                          </span>
                        </div>
                      </td>

                      {/* Column 7: Actions */}
                      <td className="py-3 pl-2 pr-3.5 text-right sm:pr-5">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveActionMenuId(
                                isMenuOpen ? null : sub.id
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                            aria-label="Actions menu"
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </button>

                          {/* Dropdown Menu */}
                          {isMenuOpen && (
                            <div className="absolute right-0 mt-1.5 w-32 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-1 shadow-2xl z-40 space-y-0.5 animate-fadeIn">
                              <Link
                                href={`/admin/submissions/${sub.id}`}
                                onClick={() => setActiveActionMenuId(null)}
                                className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                <Eye className="h-3 w-3 text-blue-500" />
                                <span>View</span>
                              </Link>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(sub.id, sub.applicantName)
                                }
                                className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/15 transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official DV PDF Uploader Modal */}
      <UploadDvPdfModal
        submission={uploadingSubmission}
        isOpen={!!uploadingSubmission}
        onClose={() => setUploadingSubmission(null)}
      />

      {/* Super Admin Payment Receipt Screenshot Lightbox */}
      {viewingReceiptUrl && (
        <div
          onClick={() => setViewingReceiptUrl(null)}
          className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4 animate-fadeIn cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 p-2 shadow-2xl">
            <button
              type="button"
              onClick={() => setViewingReceiptUrl(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/70 text-white hover:bg-black transition-colors cursor-pointer z-10"
              title="Close image"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={viewingReceiptUrl}
              alt="Payment Receipt Screenshot"
              className="max-h-[85vh] w-auto object-contain mx-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};
