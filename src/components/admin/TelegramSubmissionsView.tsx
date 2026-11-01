"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import { SubmissionSummary } from "@/types/admin";
import { CopyDetailsButton } from "@/components/admin/CopyDetailsButton";
import {
  Store,
  CheckCircle2,
  XCircle,
  FileCheck2,
  Calendar,
  Users,
  Search,
  Eye,
  Filter,
  Phone,
  ArrowRight,
  ChevronRight,
  Check,
  AlertCircle,
  Layers,
  Sparkles,
  Clock,
  FileUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UploadDvPdfModal } from "./UploadDvPdfModal";

export const TelegramSubmissionsView: React.FC = () => {
  const { submissions, agents, toggleSubmissionPaid, toggleSubmissionFilled } =
    useAdmin();

  // Selected stationary channel (default to first active agent or 'ALL')
  const [selectedStationary, setSelectedStationary] = useState<string>("ALL");
  const [channelSearch, setChannelSearch] = useState("");
  const [uploadingSubmission, setUploadingSubmission] = useState<SubmissionSummary | null>(null);
  const [submissionSearch, setSubmissionSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "UNPAID" | "PAID" | "UNFILLED" | "FILLED"
  >("ALL");

  // Stationary channel grouping
  const stationaryChannels = useMemo(() => {
    // Map existing agents and unique stationary names from submissions
    const list: {
      name: string;
      agentUsername?: string;
      phone?: string;
      city?: string;
      submissionsCount: number;
      paidCount: number;
      filledCount: number;
    }[] = [];

    // Combine agents and any additional stationaries in submissions
    const map = new Map<
      string,
      {
        name: string;
        agentUsername?: string;
        phone?: string;
        city?: string;
        submissionsCount: number;
        paidCount: number;
        filledCount: number;
      }
    >();

    // Seed from agents
    agents.forEach((a) => {
      map.set(a.profile.stationaryName, {
        name: a.profile.stationaryName,
        agentUsername: a.username,
        phone: a.profile.phoneNumber,
        city: a.profile.city,
        submissionsCount: 0,
        paidCount: 0,
        filledCount: 0,
      });
    });

    // Count submissions
    submissions.forEach((s) => {
      const existing = map.get(s.stationaryName);
      if (existing) {
        existing.submissionsCount += 1;
        if (s.isPaid) existing.paidCount += 1;
        if (s.isFilled) existing.filledCount += 1;
      } else {
        map.set(s.stationaryName, {
          name: s.stationaryName,
          agentUsername: s.agentUsername,
          phone: s.contactPhone,
          submissionsCount: 1,
          paidCount: s.isPaid ? 1 : 0,
          filledCount: s.isFilled ? 1 : 0,
        });
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => b.submissionsCount - a.submissionsCount
    );
  }, [agents, submissions]);

  // Filtered stationaries in left column
  const filteredChannels = useMemo(() => {
    if (!channelSearch.trim()) return stationaryChannels;
    const q = channelSearch.toLowerCase();
    return stationaryChannels.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.agentUsername && c.agentUsername.toLowerCase().includes(q))
    );
  }, [stationaryChannels, channelSearch]);

  // Current active stationary details
  const activeStationaryData = useMemo(() => {
    if (selectedStationary === "ALL") return null;
    return stationaryChannels.find((c) => c.name === selectedStationary) || null;
  }, [selectedStationary, stationaryChannels]);

  // Submissions for the selected stationary
  const channelSubmissions = useMemo(() => {
    let list =
      selectedStationary === "ALL"
        ? [...submissions]
        : submissions.filter((s) => s.stationaryName === selectedStationary);

    if (submissionSearch.trim()) {
      const q = submissionSearch.toLowerCase();
      list = list.filter(
        (s) =>
          s.applicantName.toLowerCase().includes(q) ||
          s.confirmationNumber.toLowerCase().includes(q) ||
          s.stationaryName.toLowerCase().includes(q)
      );
    }

    if (statusFilter === "PAID") {
      list = list.filter((s) => s.isPaid);
    } else if (statusFilter === "UNPAID") {
      list = list.filter((s) => !s.isPaid);
    } else if (statusFilter === "FILLED") {
      list = list.filter((s) => s.isFilled);
    } else if (statusFilter === "UNFILLED") {
      list = list.filter((s) => !s.isFilled);
    }

    return list.sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }, [submissions, selectedStationary, submissionSearch, statusFilter]);

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 p-2 sm:p-3 shadow-xl min-h-[720px]">
      {/* ============================================================== */}
      {/* LEFT PANEL: Telegram-Style Stationary Channels List */}
      {/* ============================================================== */}
      <div className="lg:col-span-4 flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80 overflow-hidden shadow-sm">
        {/* Header & Search */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/15 text-blue-600 dark:text-blue-400">
                <Store className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Stationaries
              </span>
            </div>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
              {stationaryChannels.length} Shops
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search stationaries..."
              value={channelSearch}
              onChange={(e) => setChannelSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Stationary Channels Scroll Feed */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[600px] lg:max-h-[660px]">
          {/* "All Stationaries" Unified Channel */}
          <button
            type="button"
            onClick={() => setSelectedStationary("ALL")}
            className={cn(
              "w-full text-left p-3 transition-colors flex items-center justify-between group",
              selectedStationary === "ALL"
                ? "bg-blue-50/80 dark:bg-blue-600/15 border-l-4 border-blue-600"
                : "hover:bg-slate-50 dark:hover:bg-slate-900/60"
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-colors",
                  selectedStationary === "ALL"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                )}
              >
                <Layers className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  All Stationaries Feed
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  Aggregated mesh submissions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <span className="rounded-full bg-blue-100 dark:bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                {submissions.length}
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>

          {/* Individual Stationary Channels */}
          {filteredChannels.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
              No stationaries found.
            </div>
          ) : (
            filteredChannels.map((channel) => {
              const isSelected = selectedStationary === channel.name;
              const initials = channel.name
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase();

              return (
                <button
                  key={channel.name}
                  type="button"
                  onClick={() => setSelectedStationary(channel.name)}
                  className={cn(
                    "w-full text-left p-3 transition-colors flex items-center justify-between group",
                    isSelected
                      ? "bg-blue-50/80 dark:bg-blue-600/15 border-l-4 border-blue-600"
                      : "hover:bg-slate-50 dark:hover:bg-slate-900/60"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-extrabold transition-colors uppercase",
                        isSelected
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      )}
                    >
                      {initials || "ST"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {channel.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                        @{channel.agentUsername || "proxy_agent"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold",
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      )}
                    >
                      {channel.submissionsCount}
                    </span>

                    {/* Mini indicators for paid & filled */}
                    <div className="flex items-center gap-1 text-[9px] font-medium text-slate-500 dark:text-slate-400">
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {channel.paidCount}P
                      </span>
                      <span>•</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {channel.filledCount}F
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* RIGHT PANEL: Submissions List for the Active Stationary */}
      {/* ============================================================== */}
      <div className="lg:col-span-8 flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80 overflow-hidden shadow-sm">
        {/* Stationary Channel Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-sm shadow-md shadow-blue-500/20">
                <Store className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                    {selectedStationary === "ALL"
                      ? "All Registered Submissions"
                      : selectedStationary}
                  </h2>
                  <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Live Channel
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {activeStationaryData?.agentUsername && (
                    <span className="font-mono text-blue-600 dark:text-blue-400">
                      @{activeStationaryData.agentUsername}
                    </span>
                  )}
                  {activeStationaryData?.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{activeStationaryData.phone}</span>
                    </span>
                  )}
                  <span>
                    Showing {channelSubmissions.length} of{" "}
                    {selectedStationary === "ALL"
                      ? submissions.length
                      : (activeStationaryData?.submissionsCount || 0)}{" "}
                    records
                  </span>
                </div>
              </div>
            </div>

            {/* Quick status filters */}
            <div className="flex items-center gap-1 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0">
              {(
                [
                  { id: "ALL", label: "All" },
                  { id: "UNPAID", label: "Unpaid" },
                  { id: "PAID", label: "Paid" },
                  { id: "UNFILLED", label: "Unfilled" },
                  { id: "FILLED", label: "Filled" },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStatusFilter(f.id)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors whitespace-nowrap",
                    statusFilter === f.id
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Applicant Search in Channel */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search applicant name or confirmation number..."
              value={submissionSearch}
              onChange={(e) => setSubmissionSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Submissions Feed List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 max-h-[580px] lg:max-h-[640px]">
          {channelSubmissions.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <FileCheck2 className="h-10 w-10 mx-auto text-slate-400 dark:text-slate-600 stroke-[1.5]" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No submissions in this channel
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {submissionSearch || statusFilter !== "ALL"
                    ? "Try adjusting your search terms or status filter."
                    : "No entrant forms have been submitted by this stationery yet."}
                </p>
              </div>
              {(submissionSearch || statusFilter !== "ALL") && (
                <button
                  type="button"
                  onClick={() => {
                    setSubmissionSearch("");
                    setStatusFilter("ALL");
                  }}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            channelSubmissions.map((sub) => {
              const isPaid = !!sub.isPaid;
              const isFilled = !!sub.isFilled;

              return (
                <div
                  key={sub.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 p-3.5 sm:p-4 shadow-sm hover:border-blue-400 dark:hover:border-blue-500/50 transition-all space-y-3"
                >
                  {/* Top Bar: Name, Confirmation, Stationary, Date */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                        <img
                          src={sub.photoUrl}
                          alt={sub.applicantName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/submissions/${sub.id}`}
                          className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-xs sm:text-sm truncate block leading-snug"
                        >
                          {sub.applicantName}
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-blue-200 dark:border-slate-800 select-all font-semibold">
                            {sub.confirmationNumber}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            {formatDate(sub.submittedAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badges: Paid / Unpaid & Filled / Unfilled */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Paid Badge */}
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Paid</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                          <AlertCircle className="h-3 w-3" />
                          <span>Unpaid</span>
                        </span>
                      )}

                      {/* Filled Badge */}
                      {isFilled ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:text-blue-400">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Filled</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                          <Clock className="h-3 w-3" />
                          <span>Unfilled</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details Strip + Toggle Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-slate-200 dark:border-slate-800/80 text-xs">
                    {/* Meta info tags */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-medium">
                        {sub.maritalStatus}
                      </span>
                      <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-medium">
                        {sub.childrenCount > 0
                          ? `${sub.childrenCount} Children`
                          : "0 Children"}
                      </span>
                      {selectedStationary === "ALL" && (
                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-semibold">
                          <Store className="h-3 w-3 text-blue-500" />
                          <span className="truncate max-w-[150px]">
                            {sub.stationaryName}
                          </span>
                        </span>
                      )}
                    </div>

                    {/* Interactive Action & Toggle Buttons */}
                    <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                      {/* Paid Toggle Button */}
                      <button
                        type="button"
                        onClick={() => toggleSubmissionPaid(sub.id)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all shadow-sm border",
                          isPaid
                            ? "bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                        )}
                        title={isPaid ? "Click to mark Unpaid" : "Click to mark Paid"}
                      >
                        <Check className="h-3 w-3" />
                        <span>{isPaid ? "Paid ✓" : "Mark Paid"}</span>
                      </button>

                      {/* When form is paid: Prompt Super Admin to upload official DV PDF */}
                      {isPaid && (
                        sub.dvPdfUrl ? (
                          <button
                            type="button"
                            onClick={() => setUploadingSubmission(sub)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-2 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 transition-colors cursor-pointer"
                            title="Official DV PDF uploaded. Click to inspect or replace."
                          >
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            <span>DV PDF ✓</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setUploadingSubmission(sub)}
                            className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:from-indigo-500 hover:to-blue-500 transition-all cursor-pointer animate-pulse"
                            title="Form is paid! Click to upload the official government DV confirmation PDF."
                          >
                            <FileUp className="h-3 w-3" />
                            <span>Upload DV PDF</span>
                          </button>
                        )
                      )}

                      {/* Filled Toggle Button */}
                      <button
                        type="button"
                        onClick={() => toggleSubmissionFilled(sub.id)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all shadow-sm border",
                          isFilled
                            ? "bg-blue-600 text-white border-blue-500 hover:bg-blue-700"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                        )}
                        title={isFilled ? "Click to mark Unfilled" : "Click to mark Filled"}
                      >
                        <FileCheck2 className="h-3 w-3" />
                        <span>{isFilled ? "Filled ✓" : "Mark Filled"}</span>
                      </button>

                      {/* Copy Details */}
                      <CopyDetailsButton
                        submission={sub}
                        variant="secondary"
                        className="py-1 px-2.5 text-[11px]"
                      />

                      {/* View Link */}
                      <Link
                        href={`/admin/submissions/${sub.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Eye className="h-3 w-3 text-blue-500" />
                        <span>View</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Official DV PDF Upload Modal */}
      <UploadDvPdfModal
        submission={uploadingSubmission}
        isOpen={!!uploadingSubmission}
        onClose={() => setUploadingSubmission(null)}
      />
    </div>
  );
};
